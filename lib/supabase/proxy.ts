import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const SUPABASE_URL = "https://inwpueybqvkctnfsofzi.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlud3B1ZXlicXZrY3RuZnNvZnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4OTA0ODYsImV4cCI6MjA4MjQ2NjQ4Nn0.kGqQ_vLny-IefaMC8KW1HAVEB4kLmhKzNvOLEkQZT3I"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  await supabase.auth.getUser()

  return supabaseResponse
}
