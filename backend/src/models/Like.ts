import mongoose, { Schema, Document } from 'mongoose'

export interface ILike extends Document {
  user: mongoose.Types.ObjectId
  target: mongoose.Types.ObjectId
  targetType: 'Post' | 'Comment'
  createdAt: Date
}

const LikeSchema = new Schema<ILike>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  target: { type: Schema.Types.ObjectId, refPath: 'targetType', required: true },
  targetType: { type: String, enum: ['Post', 'Comment'], required: true },
}, { timestamps: true })

LikeSchema.index({ user: 1, target: 1, targetType: 1 }, { unique: true })

const Like = mongoose.models.Like || mongoose.model<ILike>('Like', LikeSchema)
export default Like