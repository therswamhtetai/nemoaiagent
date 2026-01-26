import { NextRequest, NextResponse } from 'next/server'

// Timeout duration in milliseconds (90 seconds for AI responses)
const WEBHOOK_TIMEOUT = 90000

export async function POST(request: NextRequest) {
    try {
        // Get user ID from session (set by middleware)
        const sessionUserId = request.headers.get('x-user-id')

        if (!sessionUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const webhookUrl = process.env.N8N_WEBHOOK_URL_CHAT

        if (!webhookUrl) {
            console.error("Missing N8N_WEBHOOK_URL_CHAT env var")
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
        }

        // Use session user_id, not the one from body (prevents spoofing)
        const secureBody = {
            ...body,
            user_id: sessionUserId,
            userId: sessionUserId,
        }

        // Create AbortController for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT)

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(secureBody),
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                const errorText = await response.text()
                console.error(`Webhook error: ${response.status} - ${errorText}`)
                return NextResponse.json(
                    { error: 'AI service temporarily unavailable', code: 'WEBHOOK_ERROR' },
                    { status: 502 }
                )
            }

            const data = await response.json()
            return NextResponse.json(data)

        } catch (fetchError) {
            clearTimeout(timeoutId)

            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                console.error("Webhook timeout after", WEBHOOK_TIMEOUT, "ms")
                return NextResponse.json(
                    { error: 'Request timed out. Please try again.', code: 'TIMEOUT' },
                    { status: 504 }
                )
            }
            throw fetchError
        }

    } catch (error) {
        console.error("Proxy error:", error)
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.', code: 'INTERNAL_ERROR' },
            { status: 500 }
        )
    }
}
