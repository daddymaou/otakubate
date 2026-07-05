import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export const connectDB = async (retryCount = 0) => {
  const maxRetries = 3
  const retryDelay = 5000

  try {
    const uri = process.env.MONGODB_URI
    console.log('🟡 Connecting to MongoDB Atlas...')
    
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in .env file')
    }

    // Log without password for debugging
    console.log('📡 Connecting to:', uri.replace(/\/\/.*@/, '//***:***@'))

    const conn = await mongoose.connect(uri, {
      family: 4,
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
      socketTimeoutMS: 60000, // Increased to 60 seconds
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority'
    })
    
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
    console.log(`📊 Database: ${conn.connection.name}`)
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected, attempting to reconnect...')
      if (retryCount < maxRetries) {
        setTimeout(() => connectDB(retryCount + 1), retryDelay)
      }
    })

  } catch (error: any) {
    console.error(`❌ MongoDB connection error (attempt ${retryCount + 1}/${maxRetries}):`, error.message)
    
    if (retryCount < maxRetries) {
      console.log(`🔄 Retrying in ${retryDelay / 1000} seconds...`)
      setTimeout(() => connectDB(retryCount + 1), retryDelay)
    } else {
      console.error('❌ Failed to connect to MongoDB after multiple attempts')
      console.log('💡 Troubleshooting tips:')
      console.log('   1. Check your MongoDB Atlas IP whitelist (add 0.0.0.0/0)')
      console.log('   2. Verify your username and password are correct')
      console.log('   3. Make sure your cluster is not paused')
      console.log('   4. Try using a VPN or different network')
      process.exit(1)
    }
  }
}