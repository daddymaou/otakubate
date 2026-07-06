import { io, Socket } from 'socket.io-client'

// ✅ DIRECT: Use Render URL directly
const SOCKET_URL = 'https://otakubate.onrender.com'

// Singleton socket instance with better reconnection settings
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 3,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
})

let isConnecting = false
let connectedUserId: string | null = null

// ============================================
// CONNECTION MANAGEMENT
// ============================================

export const connectSocket = (userId: string) => {
  if (isConnecting) {
    console.log('⏳ Socket connection already in progress...')
    return
  }

  if (socket.connected && connectedUserId === userId) {
    console.log('✅ Socket already connected for user:', userId)
    return
  }

  if (socket.connected && connectedUserId !== userId) {
    console.log('🔄 Different user detected, reconnecting...')
    disconnectSocket()
  }

  console.log('🔌 Connecting socket for user:', userId)
  isConnecting = true
  connectedUserId = userId

  socket.connect()

  const onConnect = () => {
    console.log('✅ Socket connected, emitting user:online for:', userId)
    socket.emit('user:online', userId)
    isConnecting = false
    socket.off('connect', onConnect)
  }

  socket.on('connect', onConnect)

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error)
    isConnecting = false
  })

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason)
    if (reason === 'io server disconnect' || reason === 'transport close') {
      if (connectedUserId) {
        setTimeout(() => {
          connectSocket(connectedUserId as string)
        }, 2000)
      }
    }
  })
}

export const disconnectSocket = () => {
  if (socket.connected) {
    console.log('🔌 Disconnecting socket...')
    isConnecting = false
    connectedUserId = null
    socket.disconnect()
  }
}

// ============================================
// MESSAGE EVENTS (DM)
// ============================================

export const sendMessage = (data: {
  receiverId: string
  message: {
    _id: string
    content: string
    sender: any
    createdAt: string
    image?: string
  }
}) => {
  if (socket.connected) {
    socket.emit('message:send', data)
  } else {
    console.warn('⚠️ Socket not connected, cannot send message')
  }
}

export const markMessageAsRead = (data: {
  messageId: string
  senderId: string
}) => {
  if (socket.connected) {
    socket.emit('message:read', data)
  }
}

export const markAllMessagesAsRead = (data: {
  userId: string
  conversationId?: string
}) => {
  if (socket.connected) {
    socket.emit('messages:read-all', data)
  }
}

// ============================================
// TYPING EVENTS (DM)
// ============================================

export const sendTypingStart = (data: {
  receiverId: string
  senderId: string
  senderName: string
}) => {
  if (socket.connected && data.receiverId) {
    socket.emit('typing:start', data)
  }
}

export const sendTypingStop = (data: {
  receiverId: string
  senderId: string
}) => {
  if (socket.connected && data.receiverId) {
    socket.emit('typing:stop', data)
  }
}

// ============================================
// USER STATUS EVENTS
// ============================================

export const getOnlineUsers = () => {
  if (socket.connected) {
    socket.emit('users:get-online')
  }
}

export const checkUserOnline = (userId: string) => {
  if (socket.connected) {
    socket.emit('user:check-online', { userId })
  }
}

export const blockUser = (data: {
  blockerId: string
  blockedId: string
}) => {
  if (socket.connected) {
    socket.emit('user:blocked', data)
  }
}

export const unblockUser = (data: {
  blockerId: string
  blockedId: string
}) => {
  if (socket.connected) {
    socket.emit('user:unblocked', data)
  }
}

// ============================================
// NOTIFICATION EVENTS
// ============================================

export const sendNotification = (data: {
  userId: string
  notification: any
}) => {
  if (socket.connected) {
    socket.emit('notification:send', data)
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

// DM Events
export const onMessageReceive = (callback: (data: any) => void) => {
  socket.on('message:receive', callback)
}

export const offMessageReceive = () => {
  socket.off('message:receive')
}

export const onMessageSent = (callback: (data: any) => void) => {
  socket.on('message:sent', callback)
}

export const offMessageSent = () => {
  socket.off('message:sent')
}

export const onMessageDelivered = (callback: (data: any) => void) => {
  socket.on('message:delivered', callback)
}

export const offMessageDelivered = () => {
  socket.off('message:delivered')
}

export const onMessageRead = (callback: (data: any) => void) => {
  socket.on('message:read', callback)
}

export const offMessageRead = () => {
  socket.off('message:read')
}

export const onTypingStart = (callback: (data: { senderId: string; senderName: string }) => void) => {
  socket.on('typing:start', callback)
}

export const offTypingStart = () => {
  socket.off('typing:start')
}

export const onTypingStop = (callback: (data: { senderId: string }) => void) => {
  socket.on('typing:stop', callback)
}

export const offTypingStop = () => {
  socket.off('typing:stop')
}

// User Status Events
export const onOnlineUsers = (callback: (users: string[]) => void) => {
  socket.on('users:online', callback)
}

export const offOnlineUsers = () => {
  socket.off('users:online')
}

export const onUserOnlineStatus = (callback: (data: { userId: string; isOnline: boolean }) => void) => {
  socket.on('user:online-status', callback)
}

export const offUserOnlineStatus = () => {
  socket.off('user:online-status')
}

// Block Events
export const onBlocked = (callback: (data: { by: string }) => void) => {
  socket.on('user:blocked', callback)
}

export const offBlocked = () => {
  socket.off('user:blocked')
}

export const onUnblocked = (callback: (data: { by: string }) => void) => {
  socket.on('user:unblocked', callback)
}

export const offUnblocked = () => {
  socket.off('user:unblocked')
}

// Notification Events
export const onNotificationReceive = (callback: (data: any) => void) => {
  socket.on('notification:receive', callback)
}

export const offNotificationReceive = () => {
  socket.off('notification:receive')
}

// ============================================
// CLEANUP
// ============================================

export const removeAllListeners = () => {
  socket.removeAllListeners()
}

export default socket