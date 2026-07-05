import mongoose, { Schema, Document } from 'mongoose'

export interface IDiscussion extends Document {
  clubId: mongoose.Types.ObjectId
  authorId: mongoose.Types.ObjectId
  title: string
  content: string
  image: string | null
  reactions: {
    emoji: string
    users: mongoose.Types.ObjectId[]
  }[]
  createdAt: Date
  updatedAt: Date
}

const discussionSchema = new Schema<IDiscussion>(
  {
    clubId: {
      type: Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
      index: true
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    content: {
      type: String,
      default: '',
      trim: true,
      maxlength: 5000
    },
    image: {
      type: String,
      default: null
    },
    reactions: [{
      emoji: { type: String, required: true },
      users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    }]
  },
  {
    timestamps: true
  }
)

discussionSchema.index({ clubId: 1, createdAt: -1 })

const Discussion = mongoose.model<IDiscussion>('Discussion', discussionSchema)
export default Discussion