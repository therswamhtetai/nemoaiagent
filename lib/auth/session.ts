import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const SECRET_KEY = process.env.SESSION_SECRET || 'fallback-secret-change-in-production'
const key = new TextEncoder().encode(SECRET_KEY)

const COOKIE_NAME = 'nemo_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface SessionPayload {
  userId: string
  username: string
  expiresAt: Date
}

export async function createSession(userId: string, username: string): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  const token = await new SignJWT({ userId, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(key)

  return token
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    })

    return {
      userId: payload.userId as string,
      username: payload.username as string,
      expiresAt: new Date(payload.exp! * 1000),
    }
  } catch {
    return null
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION / 1000, // in seconds
  })
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value
}

export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = await getSessionCookie()
  if (!token) return null
  return verifySession(token)
}

// For use in API routes - verify session from request
export async function verifySessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySession(token)
}

// Response helper to set cookie in API response
export function setSessionCookieInResponse(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION / 1000,
  })
  return response
}

// For middleware - verify and optionally refresh session
export async function updateSession(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  const session = await verifySession(token)
  if (!session) {
    return null
  }

  // Refresh token if it's going to expire in less than 1 day
  const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000
  if (session.expiresAt.getTime() < oneDayFromNow) {
    const newToken = await createSession(session.userId, session.username)
    const response = NextResponse.next()
    return setSessionCookieInResponse(response, newToken)
  }

  return NextResponse.next()
}
