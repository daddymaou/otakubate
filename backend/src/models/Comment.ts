import mongoose, { Schema, Document } from 'mongoose'

export interface IComment extends Document {
  post: mongoose.Types.ObjectId
  author: mongoose.Types.ObjectId
  content: string
  parent?: mongoose.Types.ObjectId
  likesCount: number
  isEdited: boolean
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<IComment>({
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 1000 },
  parent: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
  likesCount: { type: Number, default: 0 },
  isEdited: { type: Boolean, default: false },
}, { timestamps: true })

const Comment = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema)
export default Comment