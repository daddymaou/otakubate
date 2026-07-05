// backend/clear-db.js
// Run with: node clear-db.js

const mongoose = require('mongoose')
require('dotenv').config()

// Import models
const User = require('./src/models/User')
const Post = require('./src/models/Post')
const Comment = require('./src/models/Comment')
const Like = require('./src/models/Like')
const Follow = require('./src/models/Follow')
const Bookmark = require('./src/models/Bookmark')
const Notification = require('./src/models/Notification')
const Message = require('./src/models/Message')

async function clearDatabase() {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Confirm before clearing
    console.log('\n⚠️  WARNING: This will delete ALL data from your database!')
    console.log('Collections to be cleared:')
    console.log('  - Users')
    console.log('  - Posts')
    console.log('  - Comments')
    console.log('  - Likes')
    console.log('  - Follows')
    console.log('  - Bookmarks')
    console.log('  - Notifications')
    console.log('  - Messages')
    
    // Ask for confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const answer = await new Promise((resolve) => {
      readline.question('\n🗑️  Type "DELETE" to confirm: ', resolve)
    })
    readline.close()

    if (answer !== 'DELETE') {
      console.log('❌ Cancelled. No data was deleted.')
      process.exit(0)
    }

    console.log('\n🗑️  Clearing database...')

    // Clear all collections
    const collections = [
      'users',
      'posts', 
      'comments',
      'likes',
      'follows',
      'bookmarks',
      'notifications',
      'messages'
    ]

    for (const collection of collections) {
      const result = await mongoose.connection.db.collection(collection).deleteMany({})
      console.log(`  ✅ ${collection}: ${result.deletedCount} documents deleted`)
    }

    console.log('\n✅ Database cleared successfully!')
    
    // Close connection
    await mongoose.connection.close()
    console.log('🔌 Disconnected from MongoDB')
    process.exit(0)

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

clearDatabase()