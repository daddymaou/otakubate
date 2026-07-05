import mongoose, { Schema, Document } from 'mongoose'

export interface IMessage extends Document {
  conversation: string
  sender: mongoose.Types.ObjectId
  receiver: mongoose.Types.ObjectId
  content: string
  image?: string
  isRead: boolean
  readAt?: Date
  deliveredAt?: Date
  createdAt: Date
}

const MessageSchema = new Schema<IMessage>({
  conversation: { 
    type: String, 
    required: true,
    index: true 
  },
  sender: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiver: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    default: '' 
  },
  image: { 
    type: String 
  },
  isRead: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  readAt: { 
    type: Date 
  },
  deliveredAt: { 
    type: Date,
    default: Date.now 
  },
}, { 
  timestamps: true 
})

// Indexes for faster queries
MessageSchema.index({ conversation: 1, createdAt: -1 })
MessageSchema.index({ sender: 1, receiver: 1, isRead: 1 })
MessageSchema.index({ createdAt: -1 })

// Method to mark message as read
MessageSchema.methods.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true
    this.readAt = new Date()
    await this.save()
    return true
  }
  return false
}

// Static method to get unread count
MessageSchema.statics.getUnreadCount = async function(userId: string) {
  const count = await this.countDocuments({
    receiver: userId,
    isRead: false
  })
  return count
}

// Static method to mark all as read
MessageSchema.statics.markAllAsRead = async function(userId: string, conversationId?: string) {
  const query: any = { receiver: userId, isRead: false }
  if (conversationId) {
    query.conversation = conversationId
  }
  const result = await this.updateMany(query, {
    isRead: true,
    readAt: new Date()
  })
  return result
}

// Ensure model is not re-compiled
const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema)
export default Message