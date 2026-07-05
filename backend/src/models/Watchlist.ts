import mongoose, { Schema, Document } from 'mongoose'

export interface IWatchlist extends Document {
  userId: mongoose.Types.ObjectId
  animeId: number
  title: string
  image: string
  status: 'watching' | 'planning' | 'completed' | 'dropped' | 'on_hold'
  score: number | null
  progress: number
  addedAt: Date
}

const watchlistSchema = new Schema<IWatchlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    animeId: {
      type: Number,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['watching', 'planning', 'completed', 'dropped', 'on_hold'],
      default: 'planning'
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
      default: null
    },
    progress: {
      type: Number,
      default: 0
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

// Compound index to prevent duplicates
watchlistSchema.index({ userId: 1, animeId: 1 }, { unique: true })

const Watchlist = mongoose.model<IWatchlist>('Watchlist', watchlistSchema)

export default Watchlist