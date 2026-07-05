import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, MessageCircle, Users, Plus, ArrowLeft, Check, CheckCheck, UserX, Lock, Ban } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { socket, connectSocket, onMessageReceive, offMessageReceive } from '../lib/socket'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'

export default function MessageInbox() {
  const { user: me } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [searchUsers, setSearchUsers] = useState('')
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]) // Users I blocked
  const [blockedByUsers, setBlockedByUsers] = useState<string[]>([]) // Users who blocked me
  const [isLoadingBlockStatus, setIsLoadingBlockStatus] = useState(true)

  // Use the online status hook
  const { onlineUsers, isLoading: onlineLoading } = useOnlineStatus()

  // Connect to socket
  useEffect(() => {
    if (me) {
      connectSocket(me._id)
      
      // Listen for new messages to refresh conversations
      onMessageReceive(() => {
        qc.invalidateQueries({ queryKey: ['conversations'] })
      })
      
      return () => {
        offMessageReceive()
      }
    }
  }, [me, qc])

  // Fetch conversations
  const { data: convs, isLoading: convsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await api.get('/messages/conversations')
      return data
    },
    refetchInterval: 30000,
  })

  // Fetch blocked users (who I blocked)
  const { data: blockedData } = useQuery({
    queryKey: ['blocked-users'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/messages/blocked/list')
        return data
      } catch (error) {
        console.error('Failed to fetch blocked users:', error)
        return { blockedUsers: [] }
      }
    },
    enabled: !!me,
  })

  // Fetch users who blocked me
  const { data: blockedByData } = useQuery({
    queryKey: ['blocked-by-users'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/messages/blocked-by/list')
        return data
      } catch (error) {
        console.error('Failed to fetch blocked-by users:', error)
        return { blockedByUsers: [] }
      }
    },
    enabled: !!me,
  })

  useEffect(() => {
    if (blockedData || blockedByData) {
      setIsLoadingBlockStatus(false)
    }
  }, [blockedData, blockedByData])

  // Search users for new chat
  const { data: userSearch } = useQuery({
    queryKey: ['user-search', searchUsers],
    queryFn: () => api.get(`/users/search?q=${searchUsers}`).then(r => r.data),
    enabled: showNewChat && searchUsers.length > 1,
  })

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString()
  }

  const conversations = convs?.conversations || []
  const myBlockedIds = blockedData?.blockedUsers?.map((u: any) => u._id) || []
  const blockedByIds = blockedByData?.blockedByUsers?.map((u: any) => u._id) || []
  
  // Check if a user is blocked (by me or by them)
  const isUserBlocked = (userId: string) => myBlockedIds.includes(userId)
  const isUserBlockedByThem = (userId: string) => blockedByIds.includes(userId)
  
  const filteredConversations = conversations.filter((c: any) => {
    const match = c.user?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    return match
  })

  const startConversation = (targetUserId: string) => {
    // Always navigate - the Messages component will handle blocked states
    setShowNewChat(false)
    setSearchUsers('')
    navigate(`/messages/${targetUserId}`)
  }

  const isUserOnline = (userId: string) => {
    return onlineUsers.includes(userId)
  }

  // Loading state
  if (isLoadingBlockStatus && (blockedData || blockedByData)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F5F0E8 0%, #FFE8E8 100%)' }}>
        <Spinner size={40} />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #F5F0E8 0%, #FFE8E8 100%)' }}>
      {/* ========== STICKY HEADER ========== */}
      <div className="sticky top-0 z-20 flex-shrink-0 px-4 py-4" style={{ background: 'rgba(255, 248, 238, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(230,57,70,0.1)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/feed" className="p-2 rounded-xl hover:bg-black/5 transition-all">
              <ArrowLeft size={20} style={{ color: '#666' }} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>Messages</h1>
              <p className="text-xs mt-0.5" style={{ color: '#999' }}>
                {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNewChat(true)}
            className="p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: '#1a1a2e', color: '#fff' }}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* ========== SEARCH BAR (Sticky) ========== */}
      <div className="sticky top-[73px] z-10 flex-shrink-0 max-w-4xl mx-auto w-full px-4 py-3" style={{ background: 'linear-gradient(135deg, #F5F0E8 0%, #FFE8E8 100%)' }}>
        <div 
          className="relative rounded-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(230, 57, 70, 0.12)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: '#999' }} />
          <input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none text-sm"
            style={{ background: 'transparent', color: '#1a1a2e' }}
            placeholder="Search conversations..."
          />
        </div>
      </div>

      {/* ========== CONVERSATIONS LIST (Scrollable) ========== */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          {convsLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size={36} />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(230,57,70,0.08)' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(230,57,70,0.1)' }}>
                <MessageCircle size={32} style={{ color: '#E63946' }} />
              </div>
              <p className="text-base font-medium" style={{ color: '#1a1a2e' }}>
                {searchQuery ? 'No conversations found' : 'No messages yet'}
              </p>
              <p className="text-sm mt-1" style={{ color: '#999' }}>
                {searchQuery ? 'Try a different search' : 'Start a new conversation'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowNewChat(true)}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
                  style={{ background: '#1a1a2e', color: '#fff' }}
                >
                  <Plus size={16} /> New Conversation
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((c: any) => {
                const userId = c.user?._id
                const online = userId ? isUserOnline(userId) : false
                const isBlockedByMe = userId ? isUserBlocked(userId) : false
                const isBlockedByThem = userId ? isUserBlockedByThem(userId) : false
                
                // Determine block status for display
                let blockStatus = null
                let blockIcon = null
                let blockColor = '#999'
                let subtitleText = ''
                
                if (isBlockedByMe) {
                  blockStatus = 'Blocked by you'
                  blockIcon = <Ban size={12} />
                  blockColor = '#999'
                  subtitleText = 'You blocked this user - tap to unblock'
                } else if (isBlockedByThem) {
                  blockStatus = 'Blocked you'
                  blockIcon = <Lock size={12} />
                  blockColor = '#E63946'
                  subtitleText = 'This user has blocked you - tap to view'
                }
                
                const isDisabled = isBlockedByMe || isBlockedByThem
                
                return (
                  <div
                    key={c.conversationId}
                    onClick={() => {
                      // ALWAYS navigate - Messages component handles display
                      navigate(`/messages/${userId}`)
                    }}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 cursor-pointer ${
                      isDisabled ? 'hover:shadow-sm' : 'hover:shadow-md active:scale-[0.98]'
                    }`}
                    style={{
                      background: isBlockedByThem ? 'rgba(230,57,70,0.05)' : 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: isBlockedByThem ? '1px solid rgba(230,57,70,0.15)' : '1px solid rgba(230,57,70,0.06)'
                    }}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 relative">
                      <Avatar 
                        src={c.user?.avatar} 
                        name={c.user?.displayName || c.user?.username} 
                        size={52} 
                      />
                      {online && !isDisabled && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2" style={{ background: '#10B981', borderColor: '#FFF8EE' }} />
                      )}
                      {isBlockedByMe && (
                        <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
                          <Ban size={18} className="text-white" />
                        </div>
                      )}
                      {isBlockedByThem && (
                        <div className="absolute inset-0 rounded-full bg-red-500/30 flex items-center justify-center">
                          <Lock size={18} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="font-semibold text-base truncate" style={{ color: '#1a1a2e' }}>
                            {c.user?.displayName || c.user?.username}
                          </h3>
                          {blockStatus && (
                            <span 
                              className="text-xs flex items-center gap-0.5 px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                              style={{ 
                                background: isBlockedByThem ? 'rgba(230,57,70,0.1)' : 'rgba(0,0,0,0.05)',
                                color: blockColor 
                              }}
                            >
                              {blockIcon} {blockStatus}
                            </span>
                          )}
                        </div>
                        {c.lastMessage?.createdAt && !isDisabled && (
                          <span className="text-xs flex-shrink-0" style={{ color: '#999' }}>
                            {formatTime(c.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {c.lastMessage?.sender === me?._id && !isDisabled && (
                            <span className="text-xs flex-shrink-0" style={{ color: '#999' }}>
                              {c.lastMessage?.read ? <CheckCheck size={14} /> : <Check size={14} />}
                            </span>
                          )}
                          <span 
                            className="text-sm truncate" 
                            style={{ 
                              color: isDisabled ? '#999' : c.unreadCount > 0 ? '#1a1a2e' : '#999',
                              fontWeight: c.unreadCount > 0 && !isDisabled ? 500 : 400
                            }}
                          >
                            {subtitleText || c.lastMessage?.content || 'No messages yet'}
                          </span>
                        </div>
                        {c.unreadCount > 0 && !isDisabled && (
                          <span 
                            className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: '#E63946', color: '#fff' }}
                          >
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      <Modal open={showNewChat} onClose={() => { setShowNewChat(false); setSearchUsers('') }} title="New Conversation">
        <div className="space-y-4">
          <div 
            className="relative rounded-xl"
            style={{
              background: '#fff',
              border: '1px solid rgba(230,57,70,0.15)'
            }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: '#999' }} />
            <input 
              value={searchUsers}
              onChange={e => setSearchUsers(e.target.value)}
              className="w-full pl-9 pr-3 py-3 rounded-xl focus:outline-none text-sm"
              style={{ background: 'transparent', color: '#1a1a2e' }}
              placeholder="Search by username..."
              autoFocus
            />
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {searchUsers.length > 1 && userSearch?.users?.length === 0 ? (
              <div className="text-center py-8">
                <Users size={32} className="mx-auto mb-2" style={{ color: '#ccc' }} />
                <p className="text-sm" style={{ color: '#999' }}>No users found</p>
              </div>
            ) : searchUsers.length <= 1 ? (
              <div className="text-center py-8">
                <Users size={32} className="mx-auto mb-2" style={{ color: '#ccc' }} />
                <p className="text-sm" style={{ color: '#999' }}>Type to search for users</p>
              </div>
            ) : (
              <div className="space-y-1">
                {userSearch?.users?.map((u: any) => {
                  const isBlockedByMe = myBlockedIds.includes(u._id)
                  const isBlockedByThem = blockedByIds.includes(u._id)
                  const isDisabled = isBlockedByMe || isBlockedByThem
                  
                  let statusText = ''
                  if (isBlockedByMe) statusText = '(Blocked by you)'
                  if (isBlockedByThem) statusText = '(Blocked you)'
                  
                  return (
                    <button
                      key={u._id}
                      onClick={() => {
                        // Always navigate - Messages component handles display
                        startConversation(u._id)
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        isDisabled ? 'opacity-60 hover:bg-transparent' : 'hover:bg-white/50 active:bg-white/70'
                      }`}
                      style={{
                        background: isBlockedByThem ? 'rgba(230,57,70,0.03)' : 'transparent'
                      }}
                    >
                      <div className="relative">
                        <Avatar src={u.avatar} name={u.displayName || u.username} size={44} />
                        {isBlockedByMe && (
                          <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
                            <Ban size={16} className="text-white" />
                          </div>
                        )}
                        {isBlockedByThem && (
                          <div className="absolute inset-0 rounded-full bg-red-500/30 flex items-center justify-center">
                            <Lock size={16} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-sm" style={{ color: '#1a1a2e' }}>
                            {u.displayName || u.username}
                          </div>
                          {statusText && (
                            <span className="text-xs" style={{ color: isBlockedByThem ? '#E63946' : '#999' }}>
                              {statusText}
                            </span>
                          )}
                        </div>
                        <div className="text-xs" style={{ color: '#999' }}>@{u.username}</div>
                        {u.bio && (
                          <p className="text-xs mt-0.5 truncate max-w-[200px]" style={{ color: '#bbb' }}>{u.bio}</p>
                        )}
                      </div>
                      {isUserOnline(u._id) && !isDisabled && (
                        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <style>{`
        .active\\:scale-98:active { transform: scale(0.98); }
      `}</style>
    </div>
  )
}