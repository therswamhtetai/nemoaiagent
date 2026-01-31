import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK_TIMEOUT_MS = 30000
const RATE_LIMIT_MS = 2 * 60 * 1000
const DEFAULT_WEBHOOK_URL = 'https://admin.orcadigital.online/webhook/bug-report'

// Best-effort in-memory throttle. n8n should also enforce rate limiting.
const lastSubmissionByUserId = new Map<string, number>()

export async function POST(request: NextRequest) {
  try {
    const sessionUserId = request.headers.get('x-user-id')
    const sessionUsername = request.headers.get('x-username') || ''

    if (!sessionUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const now = Date.now()
    const last = lastSubmissionByUserId.get(sessionUserId) || 0
    if (now - last < RATE_LIMIT_MS) {
      return NextResponse.json(
        {
          success: false,
          error_code: 'RATE_LIMITED',
          message: 'Please wait a little before sending another report.',
        },
        { status: 429 }
      )
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL_BUG_REPORT || DEFAULT_WEBHOOK_URL

    const incoming = await request.formData()
    const description = (incoming.get('description') || '').toString()
    const email = (incoming.get('email') || '').toString()
    const fullName = (incoming.get('full_name') || '').toString()
    const appVersion = (incoming.get('app_version') || '').toString()
    const screen = (incoming.get('screen') || '').toString()
    const clientTimestamp = (incoming.get('client_timestamp') || '').toString()
    const userAgent = (incoming.get('user_agent') || request.headers.get('user-agent') || '').toString()
    const clientLanguage = (incoming.get('client_language') || '').toString()
    const timezoneOffsetMin = (incoming.get('timezone_offset_min') || '').toString()
    const viewport = (incoming.get('viewport') || '').toString()

    const photo = incoming.get('photo')
    const hasPhoto = photo instanceof File && photo.size > 0

    if (!description.trim() && !hasPhoto) {
      return NextResponse.json(
        { success: false, error_code: 'EMPTY_REPORT', message: 'Please add a description or attach a photo.' },
        { status: 400 }
      )
    }

    const forward = new FormData()
    forward.set('user_id', sessionUserId)
    if (sessionUsername) forward.set('username', sessionUsername)
    if (fullName) forward.set('full_name', fullName)
    if (email) forward.set('email', email)
    forward.set('description', description)
    if (appVersion) forward.set('app_version', appVersion)
    if (screen) forward.set('screen', screen)
    if (clientTimestamp) forward.set('client_timestamp', clientTimestamp)
    if (userAgent) forward.set('user_agent', userAgent)
    if (clientLanguage) forward.set('client_language', clientLanguage)
    if (timezoneOffsetMin) forward.set('timezone_offset_min', timezoneOffsetMin)
    if (viewport) forward.set('viewport', viewport)
    forward.set('received_at', new Date().toISOString())
    if (hasPhoto) {
      forward.set('photo', photo, photo.name)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS)

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: forward,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Bug report webhook error: ${response.status} - ${errorText}`)
        return NextResponse.json(
          { success: false, error_code: 'WEBHOOK_ERROR', message: 'Bug report service temporarily unavailable.' },
          { status: 502 }
        )
      }

      // Record throttle only on successful webhook response.
      lastSubmissionByUserId.set(sessionUserId, now)

      // Pass-through JSON if possible; otherwise return a generic success.
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await response.json()
        return NextResponse.json(data)
      }

      return NextResponse.json({ success: true })
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Bug report webhook timeout after', WEBHOOK_TIMEOUT_MS, 'ms')
        return NextResponse.json(
          { success: false, error_code: 'TIMEOUT', message: 'Request timed out. Please try again.' },
          { status: 504 }
        )
      }

      throw fetchError
    }
  } catch (error) {
    console.error('Bug report proxy error:', error)
    return NextResponse.json(
      { success: false, error_code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
