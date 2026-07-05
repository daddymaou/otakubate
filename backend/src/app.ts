import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import passport from 'passport'
import path from 'path'
import { connectDB } from './config/db'
import { setupPassport } from './config/passport'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import postRoutes from './routes/posts'
import commentRoutes from './routes/comments'
import messageRoutes from './routes/messages'
import notificationRoutes from './routes/notifications'
import animeRoutes from './routes/anime'
import watchlistRoutes from './routes/watchlist'
import adminRoutes from './routes/admin'
import uploadRoutes from './routes/upload'
import ogRoutes from './routes/og'
import aiRoutes from './routes/ai'
import { errorHandler } from './middleware/errorHandler'
import { rateLimiter } from './middleware/rateLimiter'
import User from './models/User'

// ============================================
// OTAKU MODULE
// ============================================
import otakuModule from './modules/otaku'

setupPassport()

const app = express()
const httpServer = createServer(app)

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

connectDB()

// ============================================
// SOCKET.IO SETUP - ONLINE/OFFLINE TRACKING
// ============================================
const onlineUsers = new Map<string, string>()

export function setupSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log('🔌 New socket connected:', socket.id)

    socket.on('user:online', async (userId: string) => {
      try {
        if (!userId) return
        onlineUsers.set(userId, socket.id)
        socket.data.userId = userId
        // ✅ FIX: Added type assertion
        await (User as any).findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date()
        })
        io.emit('users:online', { userId, isOnline: true })
        console.log(`✅ User ${userId} is online`)
      } catch (error) {
        console.error('Error setting user online:', error)
      }
    })

    socket.on('disconnect', async () => {
      try {
        const userId = socket.data.userId
        if (userId && onlineUsers.has(userId)) {
          onlineUsers.delete(userId)
          // ✅ FIX: Added type assertion
          await (User as any).findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date()
          })
          io.emit('users:online', { userId, isOnline: false })
          console.log(`❌ User ${userId} is offline`)
        }
      } catch (error) {
        console.error('Error setting user offline:', error)
      }
    })

    socket.on('users:get-online', () => {
      const online = Array.from(onlineUsers.keys())
      socket.emit('users:online-list', online)
    })

    socket.on('notification:send', ({ userId, notification }) => {
      const userSocketId = onlineUsers.get(userId)
      if (userSocketId) {
        io.to(userSocketId).emit('notification:receive', notification)
      }
    })

    console.log('📊 Total online users:', onlineUsers.size)
  })
}

setupSocket(io)

// ============================================
// EXPRESS MIDDLEWARE
// ============================================
app.use(helmet({ crossOriginEmbedderPolicy: false }))
app.use(compression())
app.use(morgan('dev'))
app.use(cors({ 
  origin: process.env.FRONTEND_URL || '*', 
  credentials: true 
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())
app.use(passport.initialize())
app.use(rateLimiter)

app.use('/defaults', express.static(path.join(__dirname, '../public/defaults')))
app.use('/og', ogRoutes)

// ============================================
// API ROUTES
// ============================================
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/anime', animeRoutes)
app.use('/api/watchlist', watchlistRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/upload', uploadRoutes)

// ============================================
// OTAKU MODULE ROUTES
// ============================================
app.use('/api/otaku', otakuModule)

// ============================================
// AI ROUTES
// ============================================
app.use('/api/ai', aiRoutes)

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (_req, res) => {
  res.json({ 
    success: true, 
    status: 'ok', 
    timestamp: new Date().toISOString(), 
    env: process.env.NODE_ENV 
  })
})

// ============================================
// ERROR HANDLER
// ============================================
app.use(errorHandler)

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`🚀 OtakuBate server running on port ${PORT}`)
  console.log(`🎌 Otaku routes mounted at /api/otaku`)
  console.log(`🤖 AI routes mounted at /api/ai`)
})

export default app
export { onlineUsers }