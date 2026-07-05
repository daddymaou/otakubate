import mongoose, { Schema, Document } from 'mongoose'

export interface IBookmark extends Document {
  user: mongoose.Types.ObjectId
  post: mongoose.Types.ObjectId
  createdAt: Date
}

const BookmarkSchema = new Schema<IBookmark>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
}, { timestamps: true })

BookmarkSchema.index({ user: 1, post: 1 }, { unique: true })

const Bookmark = mongoose.models.Bookmark || mongoose.model<IBookmark>('Bookmark', BookmarkSchema)
export default Bookmark