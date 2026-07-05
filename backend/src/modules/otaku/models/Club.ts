import mongoose, { Schema, Document } from 'mongoose'

export interface IClub extends Document {
  name: string
  slug: string
  description: string
  avatar: string
  banner: string
  ownerId: mongoose.Types.ObjectId
  admins: mongoose.Types.ObjectId[]
  members: mongoose.Types.ObjectId[]
  membersCount: number
  discussionsCount: number
  createdAt: Date
  updatedAt: Date
}

const clubSchema = new Schema<IClub>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      unique: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      maxlength: 500
    },
    avatar: {
      type: String,
      default: ''
    },
    banner: {
      type: String,
      default: ''
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    admins: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    membersCount: {
      type: Number,
      default: 0
    },
    discussionsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

clubSchema.index({ name: 'text', description: 'text' })
clubSchema.index({ slug: 1 }, { unique: true })
clubSchema.index({ membersCount: -1 })

const Club = mongoose.model<IClub>('Club', clubSchema)
export default Club