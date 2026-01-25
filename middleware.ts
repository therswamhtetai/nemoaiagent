import { updateSession } from "@/lib/supabase/proxy"
import { verifySession } from "@/lib/auth/session"
import { NextResponse, type NextRequest } from "next/server"

// Routes that don't require authentication
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/webhook',
  '/api/auth/session',
  '/api/vapid-public-key',
]

// Routes that use server-to-server API key authentication (called by n8n)
const serverRoutes = [
  '/api/notifications/send',
]

// Routes that require user session authentication
const protectedApiRoutes = [
  '/api/chat',
  '/api/voice',
  '/api/monitor',
  '/api/notifications',
  '/api/upload',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return await updateSession(request)
  }

  // Server-to-server routes (called by n8n) - require API key
  if (serverRoutes.some(route => pathname.startsWith(route))) {
    const apiKey = request.headers.get('x-api-key')
    const expectedKey = process.env.INTERNAL_API_KEY

    if (expectedKey && apiKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      )
    }
    return await updateSession(request)
  }

  // Check if it's a protected API route
  const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route))

  if (isProtectedApi) {
    const token = request.cookies.get('nemo_session')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      )
    }

    const session = await verifySession(token)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session' },
        { status: 401 }
      )
    }

    // Add user info to request headers for API routes to use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', session.userId)
    requestHeaders.set('x-username', session.username)

    // Create response with modified headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    // Refresh token if expiring soon (less than 1 day)
    const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000
    if (session.expiresAt.getTime() < oneDayFromNow) {
      const { SignJWT } = await import('jose')
      const SECRET_KEY = process.env.SESSION_SECRET || 'fallback-secret-change-in-production'
      const key = new TextEncoder().encode(SECRET_KEY)

      const newToken = await new SignJWT({
        userId: session.userId,
        username: session.username,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
        .sign(key)

      response.cookies.set('nemo_session', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      })
    }

    return response
  }

  // For non-API routes, use Supabase session handling
  return await updateSession(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
