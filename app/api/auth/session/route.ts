import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        username: session.username,
      },
      expiresAt: session.expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { authenticated: false, error: 'Session check failed' },
      { status: 500 }
    )
  }
}
