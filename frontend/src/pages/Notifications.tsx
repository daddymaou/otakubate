import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Bell, BellOff, Heart, MessageCircle, Users, UserPlus, CheckCircle, AlertCircle, AtSign, Trash2, Inbox, ArrowLeft } from 'lucide-react'
import api from '../lib/api'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Notifications() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  
  const { data, isLoading } = useQuery({ 
    queryKey: ['notifications'], 
    queryFn: () => api.get('/notifications').then(r => r.data),
    refetchInterval: 30000,
  })
  
  const readAllMutation = useMutation({ 
    mutationFn: () => api.put('/notifications/read-all'), 
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('All notifications marked as read')
    },
    onError: () => toast.error('Failed to mark all as read')
  })
  
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Notification deleted')
    },
    onError: () => toast.error('Failed to delete notification'),
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart size={14} style={{ color: '#E63946' }} />
      case 'comment':
        return <MessageCircle size={14} style={{ color: '#3B82F6' }} />
      case 'reply':
        return <MessageCircle size={14} style={{ color: '#10B981' }} />
      case 'follow':
        return <UserPlus size={14} style={{ color: '#10B981' }} />
      case 'mention':
        return <AtSign size={14} style={{ color: '#8B5CF6' }} />
      case 'verified':
        return <CheckCircle size={14} style={{ color: '#10B981' }} />
      case 'post_removed':
      case 'warning':
        return <AlertCircle size={14} style={{ color: '#F59E0B' }} />
      default:
        return <Bell size={14} style={{ color: '#E63946' }} />
    }
  }

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsReadMutation.mutateAsync(notification._id)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    await deleteMutation.mutateAsync(id)
  }

  const notifications = data?.notifications || []
  const unreadCount = data?.unreadCount || 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl transition-all duration-200 hover:bg-black/5 active:scale-95"
          style={{ color: '#666' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>Notifications</h1>
          <p className="text-sm mt-0.5" style={{ color: '#999' }}>
            Stay updated with what's happening
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={() => readAllMutation.mutate()} 
            disabled={readAllMutation.isPending}
            className="text-sm font-medium transition-all duration-200 hover:underline flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
            style={{ color: '#E63946' }}
          >
            <BellOff size={14} />
            {readAllMutation.isPending ? 'Marking...' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size={40} />
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && notifications.length > 0 && (
        <div className="space-y-2">
          {/* Unread Count Badge */}
          {unreadCount > 0 && (
            <div 
              className="text-xs px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-3"
              style={{
                background: 'rgba(230,57,70,0.1)',
                color: '#E63946'
              }}
            >
              <Bell size={12} />
              {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
            </div>
          )}
          
          {notifications.map((n: any) => (
            <Link 
              key={n._id} 
              to={n.link || '#'}
              onClick={() => handleNotificationClick(n)}
              className={`block p-4 rounded-2xl transition-all duration-200 hover:scale-[1.01] group ${
                !n.read ? 'border-l-4' : ''
              }`}
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(230, 57, 70, 0.08)',
                borderLeftColor: !n.read ? '#E63946' : 'rgba(230,57,70,0.08)'
              }}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative">
                  <Avatar 
                    src={n.sender?.avatar} 
                    name={n.sender?.displayName || n.sender?.username} 
                    size={48} 
                  />
                  <div 
                    className="absolute -bottom-1 -right-1 p-1 rounded-full"
                    style={{
                      background: '#FFF8EE',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    {getNotificationIcon(n.type)}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed" style={{ color: '#1a1a2e' }}>
                        {n.message}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#999' }}>
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!n.read && (
                        <div 
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                          style={{ background: '#E63946' }}
                        />
                      )}
                      <button
                        onClick={(e) => handleDelete(e, n._id)}
                        disabled={deleteMutation.isPending}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all duration-200 hover:bg-black/5 disabled:opacity-50"
                        style={{ color: '#999' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && notifications.length === 0 && (
        <div 
          className="text-center py-16 rounded-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(230, 57, 70, 0.08)'
          }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(230,57,70,0.1)' }}>
            <Inbox size={32} style={{ color: '#E63946' }} />
          </div>
          <p className="text-base font-medium" style={{ color: '#1a1a2e' }}>No notifications yet</p>
          <p className="text-sm mt-1" style={{ color: '#999' }}>
            When you get notifications, they'll show up here
          </p>
        </div>
      )}
    </div>
  )
}