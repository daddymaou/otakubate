import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId
  sender: mongoose.Types.ObjectId
  type: 'like' | 'comment' | 'reply' | 'follow' | 'mention' | 'community_join' | 'post_removed' | 'warning' | 'verified'
  message: string
  read: boolean
  link: string
  relatedId?: string  // Optional: ID of the post/comment that triggered this
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['like', 'comment', 'reply', 'follow', 'mention', 'community_join', 'post_removed', 'warning', 'verified'], 
    required: true 
  },
  message: { type: String, required: true },
  read: { type: Boolean, default: false, index: true },
  link: { type: String, required: true },
  relatedId: { type: String, default: null }
}, { timestamps: true })

// Compound index for efficient queries
NotificationSchema.index({ recipient: 1, createdAt: -1 })
NotificationSchema.index({ recipient: 1, read: 1 })

const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)
export default Notification