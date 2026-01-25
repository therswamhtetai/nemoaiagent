import { NextRequest, NextResponse } from 'next/server'
import { createSession, setSessionCookieInResponse } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Call n8n webhook for authentication
    const webhookUrl = process.env.N8N_WEBHOOK_URL_AUTH
    if (!webhookUrl) {
      console.error('Missing N8N_WEBHOOK_URL_AUTH env var')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Debug logging
    console.log('Attempting login for:', username)
    console.log('N8N URL:', webhookUrl)
    console.log('API Key present:', !!process.env.INTERNAL_API_KEY)

    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.INTERNAL_API_KEY || '',
      },
      body: JSON.stringify({ username, password }),
    })

    const responseText = await n8nResponse.text()
    console.log('N8N Status:', n8nResponse.status)
    console.log('N8N Response:', responseText)

    if (!n8nResponse.ok) {
      console.error('N8N returned error status')
      return NextResponse.json(
        { error: `Invalid credentials (N8N Status: ${n8nResponse.status})` },
        { status: 401 }
      )
    }

    if (!responseText) {
      console.error('N8N returned empty response')
      return NextResponse.json(
        { error: 'Invalid credentials (Empty response from N8N)' },
        { status: 401 }
      )
    }

    let userData
    try {
      userData = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse N8N response:', e)
      return NextResponse.json(
        { error: 'Invalid credentials (Invalid JSON from N8N)' },
        { status: 401 }
      )
    }

    const userId = userData.id || userData.user_id

    if (!userId) {
      console.error('No user ID in N8N response:', userData)
      return NextResponse.json(
        { error: 'Invalid credentials (No user ID returned)' },
        { status: 401 }
      )
    }

    // Create session token
    const token = await createSession(userId, username)

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        username: userData.username || username,
        full_name: userData.full_name,
        email: userData.email,
      },
    })

    // Set httpOnly cookie
    return setSessionCookieInResponse(response, token)

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
