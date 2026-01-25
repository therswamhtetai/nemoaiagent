import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// Initialize supabase lazily to avoid build-time errors
const getSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

// Configure web-push lazily (only when needed)
let vapidConfigured = false
const configureVapid = () => {
  if (vapidConfigured) return true

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY

  if (!publicKey || !privateKey) {
    console.warn('VAPID keys not configured - push notifications disabled')
    return false
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@nemoai.app',
    publicKey,
    privateKey
  )
  vapidConfigured = true
  return true
}

// POST - Send push notification to user
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, title, message, type, data } = body

    if (!user_id || !title) {
      return NextResponse.json(
        { error: 'user_id and title are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // 1. Save notification to database for in-app display
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id,
        title,
        body: message || '',
        type: type || 'general',
        data: data || null,
        is_read: false,
        is_pushed: false
      })
      .select()
      .single()

    if (notifError) {
      console.error('Error saving notification:', notifError)
      return NextResponse.json({ error: notifError.message }, { status: 500 })
    }

    // Check if VAPID is configured before trying to send push
    const canSendPush = configureVapid()

    if (!canSendPush) {
      return NextResponse.json({
        success: true,
        notification_id: notification.id,
        push_sent: false,
        message: 'Notification saved but VAPID keys not configured'
      })
    }

    // 2. Get user's push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user_id)

    if (subError) {
      console.error('Error fetching subscriptions:', subError)
      return NextResponse.json({
        success: true,
        notification_id: notification.id,
        push_sent: false,
        message: 'Notification saved but error fetching subscriptions'
      })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        notification_id: notification.id,
        push_sent: false,
        message: 'Notification saved but user has no push subscriptions'
      })
    }

    // 3. Send push notification to all user's devices
    const payload = JSON.stringify({
      title,
      body: message || '',
      icon: '/icon.png',
      badge: '/icon.png',
      tag: `nemoai-${notification.id}`,
      data: {
        notification_id: notification.id,
        type: type || 'general',
        url: data?.url || '/',
        ...data
      }
    })

    const pushResults = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            },
            payload
          )
          return { success: true, endpoint: sub.endpoint }
        } catch (error: any) {
          // If subscription is invalid, remove it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', sub.id)
          }
          return { success: false, endpoint: sub.endpoint, error: error.message }
        }
      })
    )

    const successCount = pushResults.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length

    // 4. Update notification as pushed
    if (successCount > 0) {
      await supabase
        .from('notifications')
        .update({ is_pushed: true })
        .eq('id', notification.id)
    }

    return NextResponse.json({
      success: true,
      notification_id: notification.id,
      push_sent: successCount > 0,
      devices_notified: successCount,
      total_devices: subscriptions.length
    })
  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
