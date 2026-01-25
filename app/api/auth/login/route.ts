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

    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const responseText = await n8nResponse.text()

    if (!n8nResponse.ok) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!responseText) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const userData = JSON.parse(responseText)
    const userId = userData.id || userData.user_id

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
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
