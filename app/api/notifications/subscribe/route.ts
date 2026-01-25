import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// POST - Save push subscription
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, subscription, device_info } = body

    if (!user_id || !subscription) {
      return NextResponse.json(
        { error: 'user_id and subscription are required' },
        { status: 400 }
      )
    }

    const { endpoint, keys } = subscription
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription format' },
        { status: 400 }
      )
    }

    // Upsert subscription (update if exists, insert if not)
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          device_info: device_info || null,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id,endpoint'
        }
      )
      .select()

    if (error) {
      console.error('Error saving subscription:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Push subscription saved successfully'
    })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove push subscription
export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { user_id, endpoint } = body

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    let query = supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user_id)

    if (endpoint) {
      query = query.eq('endpoint', endpoint)
    }

    const { error } = await query

    if (error) {
      console.error('Error removing subscription:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Push subscription removed'
    })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
