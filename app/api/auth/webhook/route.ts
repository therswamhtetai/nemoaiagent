import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const webhookUrl = process.env.N8N_WEBHOOK_URL_AUTH

        if (!webhookUrl) {
            console.error("Missing N8N_WEBHOOK_URL_AUTH env var")
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
        }

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        const responseText = await response.text()

        if (!response.ok) {
            throw new Error(`Webhook Login failed: ${response.statusText} - ${responseText}`)
        }

        if (!responseText) return NextResponse.json(null)

        // Parse JSON safely
        const data = JSON.parse(responseText)
        return NextResponse.json(data)

    } catch (error) {
        console.error("Proxy error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        )
    }
}
