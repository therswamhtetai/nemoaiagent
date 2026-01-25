"use client"

import { useState, useEffect, useCallback } from 'react'
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  MessageSquare,
  Calendar,
  Lightbulb,
  AlertCircle,
  BellOff,
  Smartphone
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Notification {
  id: string
  title: string
  body: string
  type: string
  data: any
  is_read: boolean
  created_at: string
  read_at: string | null
}

interface NotificationCenterProps {
  userId: string
  onClose?: () => void
}

const typeIcons: Record<string, any> = {
  task: Calendar,
  reminder: Clock,
  message: MessageSquare,
  idea: Lightbulb,
  system: AlertCircle,
  general: Bell
}

const typeColors: Record<string, string> = {
  task: 'text-blue-400',
  reminder: 'text-yellow-400',
  message: 'text-green-400',
  idea: 'text-purple-400',
  system: 'text-red-400',
  general: 'text-white/60'
}

export default function NotificationCenter({ userId, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)
  const [pushStatus, setPushStatus] = useState<string>('')
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  // Check device and push support
  useEffect(() => {
    const checkEnvironment = async () => {
      // Detect iOS
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
      setIsIOS(iOS)

      // Check if running as standalone PWA
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      setIsStandalone(standalone)

      // Check push support
      if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
        setPushSupported(true)

        // Check current permission and subscription
        const permission = Notification.permission
        if (permission === 'granted') {
          try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            setPushEnabled(!!subscription)
            if (subscription) {
              setPushStatus('Push notifications enabled')
            }
          } catch (e) {
            console.error('Error checking subscription:', e)
          }
        } else if (permission === 'denied') {
          setPushStatus('Notifications blocked in settings')
        }
      } else {
        // Determine why push isn't supported
        if (iOS && !standalone) {
          setPushStatus('Add to Home Screen to enable notifications')
        } else if (!('Notification' in window)) {
          setPushStatus('Notifications not supported on this browser')
        } else {
          setPushStatus('Push notifications not available')
        }
      }
    }

    checkEnvironment()
  }, [])

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`/api/notifications`, {
        credentials: 'include' // Send session cookie
      })
      const data = await response.json()
      if (data.notifications) {
        setNotifications(data.notifications)
        setUnreadCount(data.unread_count)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchNotifications()
    }
  }, [userId, fetchNotifications])

  // Enable push notifications - iOS requires user gesture
  const enablePush = async () => {
    try {
      setPushStatus('Requesting permission...')

      // First request notification permission
      const permission = await Notification.requestPermission()

      if (permission !== 'granted') {
        setPushStatus(permission === 'denied' ? 'Permission denied. Check settings.' : 'Permission not granted')
        return
      }

      setPushStatus('Subscribing...')

      // Wait for service worker
      const registration = await navigator.serviceWorker.ready

      // Get VAPID key
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        setPushStatus('Configuration error')
        return
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      })

      // Save subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send session cookie
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            isIOS: isIOS,
            isStandalone: isStandalone
          }
        })
      })

      if (response.ok) {
        setPushEnabled(true)
        setPushStatus('Push notifications enabled!')
      } else {
        setPushStatus('Failed to save subscription')
      }
    } catch (error: any) {
      console.error('Error enabling push:', error)
      if (error.name === 'NotAllowedError') {
        setPushStatus('Permission denied by user')
      } else if (error.name === 'AbortError') {
        setPushStatus('Subscription aborted')
      } else {
        setPushStatus(`Error: ${error.message || 'Unknown error'}`)
      }
    }
  }

  // Disable push notifications
  const disablePush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        await fetch('/api/notifications/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Send session cookie
          body: JSON.stringify({
            endpoint: subscription.endpoint
          })
        })
      }
      setPushEnabled(false)
      setPushStatus('Push notifications disabled')
    } catch (error) {
      console.error('Error disabling push:', error)
    }
  }

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send session cookie
        body: JSON.stringify({
          notification_id: notificationId
        })
      })
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send session cookie
        body: JSON.stringify({
          mark_all: true
        })
      })
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  // Clear all notifications
  const clearAll = async () => {
    try {
      await fetch(`/api/notifications`, {
        method: 'DELETE',
        credentials: 'include' // Send session cookie
      })
      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error('Error clearing notifications:', error)
    }
  }

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex flex-col h-full bg-[#1C1917]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-white/80" />
          <h2 className="text-lg font-medium text-white">Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-orange-500 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        )}
      </div>

      {/* Push notification section */}
      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {pushEnabled ? (
              <Bell className="w-4 h-4 text-green-400" />
            ) : isIOS && !isStandalone ? (
              <Smartphone className="w-4 h-4 text-yellow-400" />
            ) : (
              <BellOff className="w-4 h-4 text-white/40" />
            )}
            <span className="text-sm text-white/80">Push Notifications</span>
          </div>
          {pushSupported ? (
            <button
              onClick={pushEnabled ? disablePush : enablePush}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                pushEnabled
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
              }`}
            >
              {pushEnabled ? 'Enabled' : 'Enable'}
            </button>
          ) : (
            <span className="text-xs text-white/40">Not available</span>
          )}
        </div>
        {pushStatus && (
          <p className="text-xs text-white/50 mt-1.5">{pushStatus}</p>
        )}
        {isIOS && !isStandalone && (
          <p className="text-xs text-yellow-400/80 mt-1.5">
            Tap Share → "Add to Home Screen" to enable push notifications
          </p>
        )}
      </div>

      {/* Action buttons */}
      {notifications.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs text-white/60 hover:text-white hover:bg-white/10"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1" />
            Mark all read
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-xs text-white/60 hover:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Clear all
          </Button>
        </div>
      )}

      {/* Notifications list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-white/20 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-white/40">
            <Bell className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notification) => {
              const IconComponent = typeIcons[notification.type] || Bell
              const iconColor = typeColors[notification.type] || 'text-white/60'

              return (
                <div
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer ${
                    !notification.is_read ? 'bg-orange-500/5' : ''
                  }`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 mt-0.5 ${iconColor}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${
                          notification.is_read ? 'text-white/70' : 'text-white'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <span className="flex-shrink-0 w-2 h-2 mt-1.5 bg-orange-500 rounded-full" />
                        )}
                      </div>
                      {notification.body && (
                        <p className="text-xs text-white/50 mt-0.5 line-clamp-2">
                          {notification.body}
                        </p>
                      )}
                      <p className="text-xs text-white/30 mt-1">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
