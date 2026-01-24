import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const webhookUrl = process.env.N8N_WEBHOOK_URL_CHAT

        if (!webhookUrl) {
            console.error("Missing N8N_WEBHOOK_URL_CHAT env var")
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
        }

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Webhook error: ${response.statusText} - ${errorText}`)
        }

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
