import { NextRequest, NextResponse } from 'next/server'

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

        const response = await fetch(webhookUrl, {
            method: 'POST',
            // No Content-Type header needed for FormData; fetch sets boundary automatically
            body: formData
        })

        if (!response.ok) {
            // Voice webhook might not return JSON on error, be careful
            const errorText = await response.text()
            throw new Error(`Webhook error: ${response.statusText} - ${errorText}`)
        }

        // Voice webhook returns JSON with audio_base64
        const data = await response.json()
        return NextResponse.json(data)

    } catch (error) {
        console.error("Proxy error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        )
    }
}
