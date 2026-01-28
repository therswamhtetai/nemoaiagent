import { NextRequest, NextResponse } from 'next/server'

// Async voice processing - fires webhook and returns immediately
// Real-time Supabase subscription handles the response on the frontend

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

        // Fire-and-forget: Send to webhook without waiting for response
        // n8n will process and save to Supabase; frontend uses real-time subscription
        fetch(webhookUrl, {
            method: 'POST',
            body: formData,
        }).then(response => {
            if (!response.ok) {
                console.error(`[Voice] Webhook returned ${response.status}`)
            } else {
                console.log('[Voice] Webhook accepted request')
            }
        }).catch(error => {
            console.error('[Voice] Webhook fire-and-forget error:', error)
        })

        // Return 202 Accepted immediately
        // Frontend will receive the AI response via Supabase real-time subscription
        return NextResponse.json(
            { 
                status: 'processing', 
                message: 'Voice command received. Processing in background...',
                user_id: sessionUserId
            },
            { status: 202 }
        )

    } catch (error) {
        console.error("Voice proxy error:", error)
        return NextResponse.json(
            { error: 'Something went wrong with voice processing. Please try again.', code: 'INTERNAL_ERROR' },
            { status: 500 }
        )
    }
}
