import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Send, MoreVertical, 
  Smile, MessageCircle, ChevronLeft, 
  Check, CheckCheck,
  UserX, Ban, User, Unlock, Lock,
  UserMinus, Loader2, X
} from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { 
  socket, connectSocket, sendTypingStart, sendTypingStop,
  onMessageReceive, offMessageReceive, onMessageDelivered,
  onMessageRead, onTypingStart, onTypingStop, onBlocked
} from '../lib/socket'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'

export default function Messages() {
  const { userId } = useParams()
  const { user: me } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()
  
  const [msg, setMsg] = useState('')
  const [liveMessages, setLiveMessages] = useState<any[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [isBlockedByUser, setIsBlockedByUser] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [blockCheckLoading, setBlockCheckLoading] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Connect to socket
  useEffect(() => { 
    if (me) connectSocket(me._id)
  }, [me])

  // Socket listeners
  useEffect(() => {
    onMessageReceive((data: any) => {
      setLiveMessages(prev => {
        if (prev.some(m => m._id === data._id)) return prev
        return [...prev, data]
      })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    })

    onMessageDelivered((data: any) => {
      setLiveMessages(p => 
        p.map(m => m._id === data.messageId ? { ...m, delivered: true } : m)
      )
    })

    onMessageRead((data: any) => {
      setLiveMessages(p => 
        p.map(m => m._id === data.messageId ? { ...m, read: true, readAt: data.readAt } : m)
      )
    })

    onTypingStart((data: any) => {
      if (data.senderId === userId && !isBlocked && !isBlockedByUser) {
        setTypingUser(data.senderName)
        setIsTyping(true)
      }
    })

    onTypingStop((data: any) => {
      if (data.senderId === userId) {
        setIsTyping(false)
        setTypingUser(null)
      }
    })

    onBlocked((data: any) => {
      if (data.by === userId) {
        setIsBlockedByUser(true)
      }
      if (data.target === userId) {
        setIsBlocked(true)
      }
      qc.invalidateQueries({ queryKey: ['block-status', userId] })
    })

    return () => {
      offMessageReceive()
    }
  }, [userId, qc, isBlocked, isBlockedByUser])

  // Fetch conversations
  const { data: convs } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/messages/conversations').then(r => r.data),
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 60000,
  })

  // Check block status
  const { data: blockStatus, isLoading: blockStatusLoading } = useQuery({
    queryKey: ['block-status', userId],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/messages/block/status/${userId}`)
        return data
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.warn('Rate limited, using cached block status')
          return { isBlocked: false, isBlockedByUser: false }
        }
        throw error
      }
    },
    enabled: !!userId,
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 60000,
    retry: 1,
    retryDelay: 5000,
  })

  useEffect(() => {
    if (blockStatus) {
      setIsBlocked(blockStatus.isBlocked || false)
      setIsBlockedByUser(blockStatus.isBlockedByUser || false)
      setBlockCheckLoading(false)
    }
  }, [blockStatus])

  // Fetch messages
  const { data: msgs, isLoading: msgsLoading } = useQuery({
    queryKey: ['messages', userId],
    queryFn: () => api.get(`/messages/${userId}`).then(r => {
      setLiveMessages([])
      if (r.data.isBlocked !== undefined) {
        setIsBlocked(r.data.isBlocked)
      }
      if (r.data.isBlockedByUser !== undefined) {
        setIsBlockedByUser(r.data.isBlockedByUser)
      }
      return r.data
    }),
    enabled: !!userId,
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 60000,
    retry: 1,
    retryDelay: 5000,
  })

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: () => api.post(`/messages/${userId}`, { content: msg }),
    onSuccess: ({ data }) => {
      if (!data.success) {
        if (data.blocked) {
          if (data.blockedByUser) {
            setIsBlockedByUser(true)
          } else {
            setIsBlocked(true)
          }
          setMsg('')
          setIsSending(false)
          return
        }
        toast.error(data.message || 'Failed to send message')
        setIsSending(false)
        return
      }
      setMsg('')
      setIsSending(false)
      const messageData = { ...data.message, receiverId: userId }
      socket.emit('message:send', { receiverId: userId, message: messageData })
      qc.invalidateQueries({ queryKey: ['messages', userId] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (error: any) => {
      setIsSending(false)
      if (error.response?.status === 403) {
        if (error.response?.data?.blockedByUser) {
          setIsBlockedByUser(true)
        } else {
          setIsBlocked(true)
        }
      } else {
        toast.error('Failed to send message')
      }
    }
  })

  // Block user mutation
  const blockMutation = useMutation({
    mutationFn: () => api.post(`/messages/block/${userId}`),
    onSuccess: () => {
      setIsBlocked(true)
      setIsBlockedByUser(false)
      toast.success('User blocked successfully')
      setShowBlockModal(false)
      setShowMenu(false)
      qc.invalidateQueries({ queryKey: ['block-status', userId] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: () => toast.error('Failed to block user')
  })

  // Unblock user mutation
  const unblockMutation = useMutation({
    mutationFn: () => api.delete(`/messages/block/${userId}`),
    onSuccess: () => {
      setIsBlocked(false)
      toast.success('User unblocked successfully')
      setShowBlockModal(false)
      setShowMenu(false)
      qc.invalidateQueries({ queryKey: ['block-status', userId] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
      qc.invalidateQueries({ queryKey: ['messages', userId] })
    },
    onError: () => toast.error('Failed to unblock user')
  })

  // Scroll to bottom
  useEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) 
  }, [msgs, liveMessages, isTyping])

  const activeUser = convs?.conversations?.find((c: any) => c.user?._id === userId)?.user
  const isUserOnline = msgs?.isOnline || activeUser?.isOnline || false

  const handleSend = () => {
    if (!msg.trim() || sendMutation.isPending || isBlocked || isBlockedByUser) return
    setIsSending(true)
    sendMutation.mutate()
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
    sendTypingStop({ receiverId: userId!, senderId: me!._id })
    setIsTyping(false)
    setShowEmojiPicker(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMsg(value)
    
    if (value.trim() && !isTyping && !sendMutation.isPending && !isBlocked && !isBlockedByUser) {
      setIsTyping(true)
      sendTypingStart({ 
        receiverId: userId!, 
        senderId: me!._id,
        senderName: me?.displayName || me?.username || 'User'
      })
    }
    
    if (!value.trim() && isTyping) {
      setIsTyping(false)
      sendTypingStop({ receiverId: userId!, senderId: me!._id })
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
    
    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        sendTypingStop({ receiverId: userId!, senderId: me!._id })
      }, 2000)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setMsg(prev => prev + emoji)
    inputRef.current?.focus()
    setShowEmojiPicker(false)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Group messages by date - DEDUPLICATED
  const allMessages = [...(msgs?.messages || [])]
  
  // Add live messages if they don't already exist
  liveMessages.forEach(lm => {
    if (!allMessages.some(m => m._id === lm._id)) {
      allMessages.push(lm)
    }
  })
  
  // Sort by date
  allMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const groupedMessages = allMessages.reduce((groups: any, message: any) => {
    const date = new Date(message.createdAt).toDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(message)
    return groups
  }, {})

  const isMessageRead = (message: any) => {
    if (message.read) return true
    if (message.isRead) return true
    return false
  }

  if (!userId) {
    navigate('/messages')
    return null
  }

  // Loading state
  if (blockCheckLoading || blockStatusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F5F0E8 0%, #FFE8E8 100%)' }}>
        <Spinner size={40} />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #F5F0E8 0%, #FFE8E8 100%)' }}>
      {/* ========== HEADER - STICKY WITH HIGH Z-INDEX ========== */}
      <div 
        className="flex-shrink-0 px-4 py-3 flex items-center justify-between" 
        style={{ 
          background: 'rgba(255, 248, 238, 0.95)', 
          backdropFilter: 'blur(20px)', 
          borderBottom: '1px solid rgba(230,57,70,0.1)',
          position: 'relative',
          zIndex: 100
        }}
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/messages')} 
            className="p-1.5 rounded-lg hover:bg-black/5 transition-colors active:scale-95"
          >
            <ChevronLeft size={22} style={{ color: '#1a1a2e' }} />
          </button>
          
          {activeUser ? (
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar src={activeUser.avatar} name={activeUser.displayName || activeUser.username} size={40} />
                {!isBlocked && !isBlockedByUser && isUserOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2" style={{ background: '#10B981', borderColor: '#FFF8EE' }} />
                )}
              </div>
              <div>
                <Link to={`/profile/${activeUser.username}`} className="font-semibold text-base hover:underline" style={{ color: '#1a1a2e' }}>
                  {activeUser.displayName || activeUser.username}
                </Link>
                <div className="flex items-center gap-1">
                  {isBlockedByUser ? (
                    <>
                      <Lock size={10} style={{ color: '#E63946' }} />
                      <span className="text-xs" style={{ color: '#E63946' }}>Blocked you</span>
                    </>
                  ) : isBlocked ? (
                    <>
                      <Ban size={10} style={{ color: '#999' }} />
                      <span className="text-xs" style={{ color: '#999' }}>Blocked by you</span>
                    </>
                  ) : (
                    <>
                      <div className={`w-1.5 h-1.5 rounded-full ${isUserOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-xs" style={{ color: isUserOnline ? '#10B981' : '#999' }}>
                        {isUserOnline ? 'Online' : 'Offline'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="space-y-1">
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* ===== DROPDOWN MENU - FIXED ===== */}
        <div className="flex gap-1 relative" ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors active:scale-95"
          >
            <MoreVertical size={18} style={{ color: '#666' }} />
          </button>

          {showMenu && (
            <div 
              className="absolute right-0 top-full mt-1 w-52 rounded-xl shadow-lg py-1"
              style={{ 
                background: '#FFF8EE', 
                border: '1px solid rgba(230,57,70,0.1)',
                zIndex: 9999,
                position: 'absolute',
              }}
            >
              {activeUser && !isBlockedByUser && (
                <Link 
                  to={`/profile/${activeUser.username}`}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-black/5"
                  style={{ color: '#1a1a2e' }}
                  onClick={() => setShowMenu(false)}
                >
                  <User size={16} /> View Profile
                </Link>
              )}
              
              {!isBlockedByUser && (
                <>
                  <div className="h-px my-1" style={{ background: 'rgba(230,57,70,0.08)' }} />
                  {isBlocked ? (
                    <button 
                      onClick={() => { setShowMenu(false); setShowBlockModal(true) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-black/5"
                      style={{ color: '#10B981' }}
                    >
                      <Unlock size={16} /> Unblock User
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setShowMenu(false); setShowBlockModal(true) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-black/5"
                      style={{ color: '#E63946' }}
                    >
                      <UserX size={16} /> Block User
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Block Message - Shows in chat like a message, not a toast */}
      {isBlockedByUser && (
        <div className="flex-shrink-0 px-4 py-6 text-center border-b" style={{ background: 'rgba(230,57,70,0.05)', borderColor: 'rgba(230,57,70,0.1)' }}>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(230,57,70,0.1)' }}>
              <Lock size={24} style={{ color: '#E63946' }} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: '#E63946' }}>You've been blocked by this user</p>
              <p className="text-xs" style={{ color: '#999' }}>You cannot send messages to this user</p>
            </div>
          </div>
        </div>
      )}

      {/* You blocked them message - Shows in chat */}
      {isBlocked && !isBlockedByUser && (
        <div className="flex-shrink-0 px-4 py-6 text-center border-b" style={{ background: 'rgba(153,153,153,0.05)', borderColor: 'rgba(153,153,153,0.1)' }}>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(153,153,153,0.1)' }}>
              <Ban size={24} style={{ color: '#999' }} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: '#666' }}>You have blocked this user</p>
              <button
                onClick={() => setShowBlockModal(true)}
                className="text-xs font-medium mt-1 hover:underline"
                style={{ color: '#10B981' }}
              >
                <Unlock size={12} className="inline mr-1" /> Tap to unblock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Typing Indicator */}
      {isTyping && typingUser && !isBlocked && !isBlockedByUser && (
        <div className="flex-shrink-0 px-4 py-2 text-xs" style={{ color: '#999' }}>
          {typingUser} is typing...
        </div>
      )}

      {/* ========== MESSAGES AREA - SCROLLABLE WITH PROPER PADDING ========== */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {msgsLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size={32} />
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(230,57,70,0.1)' }}>
              <MessageCircle size={32} style={{ color: '#E63946' }} />
            </div>
            <p className="text-base font-medium" style={{ color: '#1a1a2e' }}>No messages yet</p>
            <p className="text-sm mt-1" style={{ color: '#999' }}>
              {isBlockedByUser ? "You can't send messages to this user" : 'Send a message to start the conversation'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-4xl mx-auto">
            {Object.entries(groupedMessages).map(([date, messages]: [string, any]) => (
              <div key={date}>
                <div className="flex justify-center mb-4">
                  <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.05)', color: '#999' }}>
                    {formatDate(date)}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {(messages as any[]).map((m: any, idx: number) => {
                    const isMe = m.sender?._id === me?._id || m.sender === me?._id
                    const read = isMessageRead(m)
                    return (
                      <div key={m._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} px-0.5`}>
                        <div 
                          className="max-w-[75%] sm:max-w-[70%] px-4 py-2.5 text-sm break-words relative"
                          style={{
                            background: isMe ? '#E63946' : '#fff',
                            color: isMe ? '#fff' : '#1a1a2e',
                            borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            boxShadow: isMe ? '0 2px 8px rgba(230,57,70,0.15)' : '0 2px 8px rgba(0,0,0,0.05)'
                          }}
                        >
                          {m.content}
                          <div className={`text-[10px] mt-1 flex items-center gap-1 justify-end ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                            <span>{formatTime(m.createdAt)}</span>
                            {isMe && (
                              read ? <CheckCheck size={12} className="text-white/70" /> : <Check size={12} className="text-white/50" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Block/Unblock Modal */}
      <Modal open={showBlockModal} onClose={() => setShowBlockModal(false)}>
        <div className="p-6">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
              isBlocked ? 'bg-green-50' : 'bg-red-50'
            }`}>
              {isBlocked ? (
                <Unlock size={28} style={{ color: '#10B981' }} />
              ) : (
                <Ban size={28} style={{ color: '#E63946' }} />
              )}
            </div>
            <h3 className="text-xl font-bold" style={{ color: '#1a1a2e' }}>
              {isBlocked 
                ? `Unblock ${activeUser?.displayName || activeUser?.username}?` 
                : `Block ${activeUser?.displayName || activeUser?.username}?`
              }
            </h3>
            <p className="text-sm mt-1" style={{ color: '#666' }}>
              {isBlocked 
                ? 'They will be able to send you messages and see your online status again.'
                : 'They will not be able to send you messages or see your online status.'
              }
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setShowBlockModal(false)}
              className="flex-1 py-3 rounded-xl text-sm font-medium transition-all hover:bg-black/5"
              style={{ color: '#666' }}
            >
              Cancel
            </button>
            {isBlocked ? (
              <button 
                onClick={() => unblockMutation.mutate()}
                disabled={unblockMutation.isPending}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: '#10B981', color: '#fff' }}
              >
                {unblockMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Unlock size={16} /> Unblock
                  </>
                )}
              </button>
            ) : (
              <button 
                onClick={() => blockMutation.mutate()}
                disabled={blockMutation.isPending}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: '#E63946', color: '#fff' }}
              >
                {blockMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Ban size={16} /> Block
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* ========== INPUT - STICKY BOTTOM ========== */}
      <div className="flex-shrink-0 p-3 border-t" style={{ background: 'rgba(255, 248, 238, 0.95)', borderColor: 'rgba(230,57,70,0.08)' }}>
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
          {/* Emoji Picker Button */}
          <div className="relative">
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0 active:scale-95"
              style={{ color: '#666' }}
              disabled={isBlocked || isBlockedByUser}
            >
              <Smile size={20} />
            </button>
            {showEmojiPicker && (
              <div 
                className="absolute bottom-full left-0 mb-2 z-50"
                style={{ 
                  background: '#fff',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(230,57,70,0.1)'
                }}
              >
                <div className="flex items-center justify-between p-2 border-b" style={{ borderColor: 'rgba(230,57,70,0.08)' }}>
                  <span className="text-xs font-medium" style={{ color: '#1a1a2e' }}>Emojis</span>
                  <button 
                    onClick={() => setShowEmojiPicker(false)}
                    className="p-1 rounded hover:bg-black/5"
                  >
                    <X size={14} style={{ color: '#999' }} />
                  </button>
                </div>
                <div className="p-2 grid grid-cols-6 gap-1 max-h-60 overflow-y-auto">
                  {['😊', '😂', '❤️', '🔥', '👀', '✨', '🌸', '🎌', '💀', '🥺', '🙏', '💯', '🤔', '👌', '😭', '🥰', '🤝', '⚡', '🎉', '💪', '🤩', '😎', '🫶', '🌟'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="w-8 h-8 rounded hover:bg-black/5 transition-colors text-xl flex items-center justify-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Input Field */}
          <div className="flex-1 relative">
            <input 
              ref={inputRef}
              value={msg} 
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2.5 rounded-xl focus:outline-none text-sm"
              style={{
                background: (isBlocked || isBlockedByUser) ? 'rgba(0,0,0,0.05)' : '#fff',
                border: `1px solid ${(isBlocked || isBlockedByUser) ? 'rgba(230,57,70,0.1)' : 'rgba(230,57,70,0.15)'}`,
                color: (isBlocked || isBlockedByUser) ? '#999' : '#1a1a2e',
                minHeight: '46px',
                cursor: (isBlocked || isBlockedByUser) ? 'not-allowed' : 'text'
              }}
              placeholder={
                isBlockedByUser ? "You can't message this user - you've been blocked" :
                isBlocked ? "You've blocked this user - unblock to chat" :
                "Type a message..."
              }
              autoFocus
              disabled={isBlocked || isBlockedByUser}
            />
            {msg.trim() && !isBlocked && !isBlockedByUser && (
              <button 
                onClick={handleSend}
                disabled={sendMutation.isPending || isSending}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                style={{
                  background: '#E63946',
                  color: '#fff'
                }}
              >
                {sendMutation.isPending || isSending ? <Spinner size={16} color="white" /> : <Send size={18} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}