import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Users, AlertTriangle, CheckCircle, X, Inbox } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'

interface Notification {
  _id: string
  recipient: string
  sender: {
    _id: string
    username: string
    displayName: string
    avatar: string
    isVerified: boolean
  }
  type: 'like' | 'comment' | 'reply' | 'follow' | 'mention' | 'community_join' | 'post_removed' | 'warning' | 'verified'
  message: string
  read: boolean
  link: string
  createdAt: string
}

interface NotificationBellProps {
  isMobile?: boolean
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'like':
      return <Heart size={14} className="text-pink-500" />
    case 'comment':
    case 'reply':
      return <MessageCircle size={14} className="text-blue-500" />
    case 'follow':
      return <UserPlus size={14} className="text-green-500" />
    case 'mention':
      return <AtSign size={14} className="text-purple-500" />
    case 'community_join':
      return <Users size={14} className="text-orange-500" />
    case 'post_removed':
    case 'warning':
      return <AlertTriangle size={14} className="text-red-500" />
    case 'verified':
      return <CheckCircle size={14} className="text-emerald-500" />
    default:
      return <Bell size={14} />
  }
}

export default function NotificationBell({ isMobile = false }: NotificationBellProps) {
  const { user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Fetch notifications - OPTIMIZED to prevent 429
  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/notifications?limit=10')
        return data
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.warn('Rate limited, using cached data')
          return queryClient.getQueryData(['notifications', 'recent']) || { notifications: [], unreadCount: 0 }
        }
        throw error
      }
    },
    enabled: !!user,
    // 🔥 CRITICAL FIXES - Reduce API calls
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    refetchInterval: 30000, // Increased from 10s to 30s
    staleTime: 20000, // Data stays fresh for 20s
    gcTime: 60000, // Cache for 60s
    retry: 1, // Only retry once on failure
    retryDelay: 3000, // Wait 3s before retry
  })

  // Fetch unread count separately - with even less frequency
  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/notifications/unread-count')
        return data
      } catch (error: any) {
        if (error.response?.status === 429) {
          return { count: 0 }
        }
        throw error
      }
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    refetchInterval: 60000, // Only check unread count every 60s
    staleTime: 50000,
    gcTime: 120000,
    retry: 1,
    retryDelay: 5000,
  })

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await api.patch(`/notifications/${notificationId}/read`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'recent'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    },
  })

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.put('/notifications/read-all')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'recent'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
      toast.success('All notifications marked as read')
      setIsOpen(false)
    },
    onError: () => {
      toast.error('Failed to mark all as read')
    },
  })

  // Delete notification
  const deleteMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await api.delete(`/notifications/${notificationId}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'recent'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    },
    onError: () => {
      toast.error('Failed to delete notification')
    },
  })

  // Close dropdown when clicking outside (only for desktop)
  useEffect(() => {
    if (isMobile) return
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobile])

  const notifications = data?.notifications || []
  const unreadCount = unreadData?.count || data?.unreadCount || 0

  // Only log once on initial load
  useEffect(() => {
    if (isInitialLoad && !isLoading) {
      console.log('🔔 [NotificationBell] Unread count:', unreadCount)
      setIsInitialLoad(false)
    }
  }, [isLoading, unreadCount, isInitialLoad])

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsReadMutation.mutateAsync(notification._id)
    }
    setIsOpen(false)
  }

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.preventDefault()
    e.stopPropagation()
    await deleteMutation.mutateAsync(notificationId)
  }

  const formatTime = (dateString: string) => {
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

  if (!user) return null

  // Mobile version - just a bell button that navigates to notifications page
  if (isMobile) {
    return (
      <Link
        to="/notifications"
        className="relative p-2 rounded-xl transition-all duration-200 active:scale-95"
        style={{ color: '#999' }}
      >
        <Bell size={20} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse"
            style={{ background: '#E63946', color: '#fff' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>
    )
  }

  // Desktop version - bell with dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl transition-all duration-200 hover:bg-black/5"
        style={{ color: '#1a1a2e' }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse" style={{ background: '#E63946', color: '#fff' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[500px] overflow-hidden rounded-2xl shadow-2xl z-50 animate-fade-in" style={{ background: '#FFF8EE', border: '1px solid rgba(230, 57, 70, 0.1)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(230, 57, 70, 0.1)' }}>
            <h3 className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="text-xs px-2 py-1 rounded-lg transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-1"
                style={{ color: '#E63946', background: 'rgba(230, 57, 70, 0.1)' }}
              >
                <CheckCircle size={10} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 rounded-full animate-spin border-2" style={{ borderColor: '#E63946', borderTopColor: 'transparent' }} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'rgba(230,57,70,0.1)' }}>
                  <Inbox size={24} style={{ color: '#E63946' }} />
                </div>
                <p className="text-sm" style={{ color: '#999' }}>No notifications yet</p>
                <p className="text-xs mt-1" style={{ color: '#bbb' }}>When you get notifications, they'll show up here</p>
              </div>
            ) : (
              notifications.map((notification: Notification) => (
                <Link
                  key={notification._id}
                  to={notification.link}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start gap-3 px-4 py-3 transition-all duration-200 hover:bg-black/5 cursor-pointer group ${
                    !notification.read ? 'bg-opacity-30' : ''
                  }`}
                  style={{ 
                    background: !notification.read ? 'rgba(230, 57, 70, 0.05)' : 'transparent',
                    borderBottom: '1px solid rgba(230, 57, 70, 0.05)'
                  }}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {notification.sender?.avatar && !notification.sender.avatar.includes('googleusercontent.com') ? (
                      <img
                        src={notification.sender.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                          const parent = (e.target as HTMLImageElement).parentElement
                          if (parent) {
                            const fallback = document.createElement('div')
                            fallback.className = 'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold'
                            fallback.style.cssText = 'background: rgba(230,57,70,0.15); color: #E63946;'
                            fallback.textContent = (notification.sender?.displayName?.[0] || notification.sender?.username?.[0] || '?').toUpperCase()
                            parent.appendChild(fallback)
                          }
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(230,57,70,0.15)', color: '#E63946' }}>
                        {(notification.sender?.displayName?.[0] || notification.sender?.username?.[0] || '?').toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-xs leading-relaxed" style={{ color: !notification.read ? '#1a1a2e' : '#666' }}>
                          {notification.message}
                        </p>
                        <span className="text-[10px] mt-1 block" style={{ color: '#999' }}>
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                        <button
                          onClick={(e) => handleDelete(e, notification._id)}
                          className="p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-black/5"
                          style={{ color: '#999' }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t text-center" style={{ borderColor: 'rgba(230, 57, 70, 0.1)' }}>
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs transition-colors hover:underline flex items-center justify-center gap-1"
                style={{ color: '#E63946' }}
              >
                <Bell size={10} />
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-pulse {
          animation: pulse 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}