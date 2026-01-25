import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// POST - Mark notification(s) as read
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, notification_id, mark_all } = body

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    const updateData = {
      is_read: true,
      read_at: new Date().toISOString()
    }

    if (mark_all) {
      // Mark all notifications as read
      const { error } = await supabase
        .from('notifications')
        .update(updateData)
        .eq('user_id', user_id)
        .eq('is_read', false)

      if (error) {
        console.error('Error marking all as read:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      })
    } else if (notification_id) {
      // Mark specific notification as read
      const { error } = await supabase
        .from('notifications')
        .update(updateData)
        .eq('id', notification_id)
        .eq('user_id', user_id)

      if (error) {
        console.error('Error marking as read:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      })
    } else {
      return NextResponse.json(
        { error: 'Either notification_id or mark_all is required' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Mark as read error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
