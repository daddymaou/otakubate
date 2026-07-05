import { Server, Socket } from 'socket.io'
import User from '../models/User'
import Message from '../models/Message'

const onlineUsers = new Map<string, string>()

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`)

    // ============================================
    // USER ONLINE
    // ============================================
    
    socket.on('user:online', async (userId: string) => {
      console.log(`👤 User online: ${userId}`)
      onlineUsers.set(userId, socket.id)
      socket.join(`user:${userId}`)
      
      await User.findByIdAndUpdate(userId, { 
        isOnline: true, 
        lastSeen: new Date() 
      })
      
      io.emit('users:online', Array.from(onlineUsers.keys()))
    })

    // ============================================
    // USER OFFLINE (Manual)
    // ============================================
    
    socket.on('user:offline', async (userId: string) => {
      console.log(`👤 User offline (manual): ${userId}`)
      
      if (onlineUsers.has(userId)) {
        onlineUsers.delete(userId)
      }
      
      await User.findByIdAndUpdate(userId, { 
        isOnline: false, 
        lastSeen: new Date() 
      })
      
      io.emit('users:online', Array.from(onlineUsers.keys()))
    })

    // ============================================
    // DISCONNECT
    // ============================================

    socket.on('disconnect', async () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`)
      
      let userId: string | null = null
      onlineUsers.forEach((socketId, id) => {
        if (socketId === socket.id) {
          userId = id
        }
      })
      
      if (userId) {
        onlineUsers.delete(userId)
        
        await User.findByIdAndUpdate(userId, { 
          isOnline: false, 
          lastSeen: new Date() 
        })
        
        io.emit('users:online', Array.from(onlineUsers.keys()))
      }
    })

    // ============================================
    // DIRECT MESSAGES - SEND
    // ============================================
    
    socket.on('message:send', async (data) => {
      const { receiverId, message } = data
      const receiverSocketId = onlineUsers.get(receiverId)
      
      // Save message to database
      try {
        const newMessage = new Message({
          sender: message.sender._id,
          receiver: receiverId,
          content: message.content,
          image: message.image || null,
          read: false
        })
        
        await newMessage.save()
        
        const populatedMessage = await newMessage.populate('sender', 'username displayName avatar')
        
        // Send to receiver if online
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message:receive', {
            ...populatedMessage.toObject(),
            delivered: true
          })
        }
        
        // Send confirmation to sender
        socket.emit('message:sent', {
          ...populatedMessage.toObject(),
          delivered: !!receiverSocketId
        })
        
        // Notify sender about delivery status
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message:delivered', {
            messageId: newMessage._id
          })
        }
      } catch (error) {
        console.error('Error saving message:', error)
        socket.emit('message:error', { error: 'Failed to send message' })
      }
    })

    // ============================================
    // DIRECT MESSAGES - READ
    // ============================================
    
    socket.on('message:read', async (data) => {
      const { messageId, senderId } = data
      
      try {
        await Message.findByIdAndUpdate(messageId, { 
          read: true,
          readAt: new Date()
        })
        
        const senderSocketId = onlineUsers.get(senderId)
        if (senderSocketId) {
          io.to(senderSocketId).emit('message:read', {
            messageId,
            readAt: new Date()
          })
        }
      } catch (error) {
        console.error('Error marking message as read:', error)
      }
    })

    // ============================================
    // DIRECT MESSAGES - READ ALL
    // ============================================
    
    socket.on('messages:read-all', async (data) => {
      const { userId, conversationId } = data
      
      try {
        const query: any = { receiver: userId, read: false }
        if (conversationId) {
          query.sender = conversationId
        }
        
        await Message.updateMany(query, { 
          read: true,
          readAt: new Date()
        })
      } catch (error) {
        console.error('Error marking all messages as read:', error)
      }
    })

    // ============================================
    // TYPING INDICATORS
    // ============================================
    
    socket.on('typing:start', (data) => {
      const { receiverId, senderId, senderName } = data
      const receiverSocketId = onlineUsers.get(receiverId)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:start', {
          senderId,
          senderName
        })
      }
    })

    socket.on('typing:stop', (data) => {
      const { receiverId, senderId } = data
      const receiverSocketId = onlineUsers.get(receiverId)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:stop', {
          senderId
        })
      }
    })

    // ============================================
    // UTILITY EVENTS
    // ============================================

    socket.on('users:get-online', () => {
      socket.emit('users:online', Array.from(onlineUsers.keys()))
    })

    socket.on('user:check-online', async (data) => {
      const { userId } = data
      const isOnline = onlineUsers.has(userId)
      socket.emit('user:online-status', {
        userId,
        isOnline
      })
    })

    // ============================================
    // BLOCK EVENTS
    // ============================================
    
    socket.on('user:blocked', async (data) => {
      const { blockerId, blockedId } = data
      
      if (onlineUsers.has(blockedId)) {
        const socketId = onlineUsers.get(blockedId)
        if (socketId) {
          io.to(socketId).emit('user:blocked', {
            by: blockerId
          })
        }
        onlineUsers.delete(blockedId)
      }
      
      await User.findByIdAndUpdate(blockerId, {
        $addToSet: { blockedUsers: blockedId }
      })
      
      io.emit('users:online', Array.from(onlineUsers.keys()))
    })

    socket.on('user:unblocked', async (data) => {
      const { blockerId, blockedId } = data
      
      await User.findByIdAndUpdate(blockerId, {
        $pull: { blockedUsers: blockedId }
      })
    })

    // ============================================
    // NOTIFICATION EVENTS
    // ============================================
    
    socket.on('notification:send', ({ userId, notification }) => {
      const userSocketId = onlineUsers.get(userId)
      if (userSocketId) {
        io.to(userSocketId).emit('notification:receive', notification)
      }
    })
  })
}

export const getOnlineUsers = () => Array.from(onlineUsers.keys())
export const isUserOnline = (userId: string) => onlineUsers.has(userId)