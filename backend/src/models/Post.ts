import mongoose, { Schema, Document } from 'mongoose'

export interface IPost extends Document {
  author: mongoose.Types.ObjectId
  community?: mongoose.Types.ObjectId
  content: string
  images: string[]
  tags: string[]
  animeRef?: string
  likesCount: number
  commentsCount: number
  sharesCount: number
  isNSFW: boolean
  isPinned: boolean
  spoilerWarning: boolean
  createdAt: Date
}

const PostSchema = new Schema<IPost>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  community: { type: Schema.Types.ObjectId, ref: 'Community' },
  content: { type: String, required: true, maxlength: 2000 },
  images: [{ type: String }],
  tags: [{ type: String }],
  animeRef: { type: String },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  sharesCount: { type: Number, default: 0 },
  isNSFW: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  spoilerWarning: { type: Boolean, default: false },
}, { timestamps: true })

PostSchema.index({ author: 1, createdAt: -1 })
PostSchema.index({ community: 1, createdAt: -1 })
PostSchema.index({ tags: 1 })

const Post = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema)
export default Post