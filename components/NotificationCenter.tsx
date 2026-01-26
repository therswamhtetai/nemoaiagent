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
  // New state for expanded processing
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
    // Optimistic update
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))

    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send session cookie
        body: JSON.stringify({
          notification_id: notificationId
        })
      })
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  // Toggle notification expansion
  const toggleNotification = (id: string, isRead: boolean) => {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      if (!isRead) {
        markAsRead(id)
      }
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
    <div className="flex flex-col h-full bg-[#1C1917]/90 backdrop-blur-xl border-l border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-5 h-5 text-white/90" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-[#1C1917]" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
            <p className="text-xs text-white/40">{unreadCount} unread</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Push notification status bar */}
      <div className={`px-4 py-2 text-xs flex items-center justify-between border-b border-white/5 ${pushEnabled ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'
        }`}>
        <div className="flex items-center gap-2">
          {pushEnabled ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          <span>{pushStatus || (pushEnabled ? 'Push enabled' : 'Push disabled')}</span>
        </div>
        {!pushEnabled && pushSupported && (
          <button onClick={enablePush} className="underline hover:text-white">Enable</button>
        )}
      </div>

      {/* Action buttons */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-end gap-1 px-2 py-2 border-b border-white/10 bg-white/[0.02]">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="h-8 text-xs text-white/60 hover:text-white hover:bg-white/10"
          >
            Mark all read
          </Button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-8 text-xs text-white/60 hover:text-red-400 hover:bg-red-500/10"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Notifications list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar-dark p-2 space-y-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-white/40">
            <div className="w-5 h-5 border-2 border-white/20 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-sm">Loading updates...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-white/30 text-center px-6">
            <div className="p-4 bg-white/5 rounded-full mb-3 ring-1 ring-white/10">
              <BellOff className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-white/50">All caught up</p>
            <p className="text-xs mt-1">Check back later for updates</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const IconComponent = typeIcons[notification.type] || Bell
            const iconColor = typeColors[notification.type] || 'text-white/60'
            const isExpanded = expandedId === notification.id

            return (
              <div
                key={notification.id}
                onClick={() => toggleNotification(notification.id, notification.is_read)}
                className={`group relative overflow-hidden rounded-xl border transition-all duration-200 cursor-pointer ${isExpanded
                    ? 'bg-white/10 border-white/20 shadow-lg'
                    : notification.is_read
                      ? 'bg-transparent border-transparent hover:bg-white/5'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                  }`}
              >
                {!notification.is_read && (
                  <div className="absolute top-3 right-3 w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                )}

                <div className="p-3 flex gap-3">
                  <div className={`mt-0.5 p-2 rounded-lg bg-white/5 ${isExpanded ? 'bg-white/10' : ''} ${iconColor}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 pr-4">
                      <h3 className={`text-sm font-medium leading-tight ${notification.is_read ? 'text-white/70' : 'text-white'
                        }`}>
                        {notification.title}
                      </h3>
                      <span className="text-[10px] text-white/30 whitespace-nowrap flex-shrink-0">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                    </div>

                    <p className={`text-xs mt-1 transition-all ${isExpanded ? 'text-white/90 whitespace-pre-wrap' : 'text-white/50 line-clamp-1'
                      }`}>
                      {notification.body}
                    </p>

                    {/* Expanded Content or Footer */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between animate-fade-in">
                        <span className="text-[10px] uppercase tracking-wider text-white/30">
                          {notification.type}
                        </span>
                        {!notification.is_read && (
                          <span className="text-[10px] text-orange-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Mark read
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
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
