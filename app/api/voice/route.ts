import { NextRequest, NextResponse } from 'next/server'

// Timeout duration in milliseconds (120 seconds for voice - transcription + LLM processing)
const WEBHOOK_TIMEOUT = 120000

// Extend Vercel serverless function timeout (Pro plan: up to 300s, Hobby: 60s max)
export const maxDuration = 120

export async function POST(request: NextRequest) {
    try {
        // Get user ID from session (set by middleware)
        const sessionUserId = request.headers.get('x-user-id')

        if (!sessionUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Forward FormData with secure user_id
        const formData = await request.formData()

        // Override user_id with session user_id (prevents spoofing)
        formData.set('user_id', sessionUserId)
        formData.set('userId', sessionUserId)

        const webhookUrl = process.env.N8N_WEBHOOK_URL_VOICE

        if (!webhookUrl) {
            console.error("Missing N8N_WEBHOOK_URL_VOICE env var")
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
        }

        // Create AbortController for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT)

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                // No Content-Type header needed for FormData; fetch sets boundary automatically
                body: formData,
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                // Voice webhook might not return JSON on error, be careful
                const errorText = await response.text()
                console.error(`Voice webhook error: ${response.status} - ${errorText}`)
                return NextResponse.json(
                    { error: 'Voice processing temporarily unavailable', code: 'WEBHOOK_ERROR' },
                    { status: 502 }
                )
            }

            // Voice webhook returns JSON with audio_base64
            const data = await response.json()
            return NextResponse.json(data)

        } catch (fetchError) {
            clearTimeout(timeoutId)

            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                console.error("Voice webhook timeout after", WEBHOOK_TIMEOUT, "ms")
                return NextResponse.json(
                    { error: 'Voice processing timed out. Please try again.', code: 'TIMEOUT' },
                    { status: 504 }
                )
            }
            throw fetchError
        }

    } catch (error) {
        console.error("Voice proxy error:", error)
        return NextResponse.json(
            { error: 'Something went wrong with voice processing. Please try again.', code: 'INTERNAL_ERROR' },
            { status: 500 }
        )
    }
}
