import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  username: string
  email: string
  password?: string
  displayName: string
  bio: string
  avatar: string
  avatarType: 'default' | 'custom'
  banner: string
  bannerType: 'default' | 'custom'
  gender: 'male' | 'female' | 'non-binary' | 'other' | 'prefer-not-to-say'
  pronouns: string
  location: string
  website: string
  isAdmin: boolean
  isVerified: boolean
  isActive: boolean
  isPremium: boolean
  emailVerified: boolean
  verificationToken?: string
  verificationTokenExpires?: Date
  verificationOtp?: string
  verificationOtpExpires?: Date
  googleId?: string
  favoriteGenres: string[]
  favoriteAnime: string[]
  followersCount: number
  followingCount: number
  postsCount: number
  otp?: string
  otpExpires?: Date
  actionOtp?: string
  actionOtpExpires?: Date
  actionOtpPurpose?: string
  deviceSessions: { deviceId: string; deviceName: string; lastSeen: Date; ip: string }[]
  fcmTokens: string[]
  notificationSettings: {
    newFollowers: boolean
    postLikes: boolean
    comments: boolean
    communityPosts: boolean
    directMessages: boolean
    mentions: boolean
    weeklyDigest: boolean
  }
  // --- NEW FIELDS ---
  isOnline: boolean
  lastSeen: Date
  blockedUsers: mongoose.Types.ObjectId[]
  blockedBy: mongoose.Types.ObjectId[]
  createdAt: Date
  comparePassword(password: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, select: false },
  displayName: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 500 },
  avatar: { type: String, default: '' },
  avatarType: { type: String, enum: ['default', 'custom'], default: 'default' },
  banner: { type: String, default: '' },
  bannerType: { type: String, enum: ['default', 'custom'], default: 'default' },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'non-binary', 'other', 'prefer-not-to-say'],
    default: 'prefer-not-to-say'
  },
  pronouns: { type: String, default: '', maxlength: 30 },
  location: { type: String, default: '', maxlength: 100 },
  website: { type: String, default: '', maxlength: 200 },
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isPremium: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  verificationToken: { type: String, select: false },
  verificationTokenExpires: { type: Date, select: false },
  verificationOtp: { type: String, select: false },
  verificationOtpExpires: { type: Date, select: false },
  googleId: { type: String },
  favoriteGenres: [{ type: String }],
  favoriteAnime: [{ type: String }],
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  postsCount: { type: Number, default: 0 },
  otp: { type: String, select: false },
  otpExpires: { type: Date, select: false },
  actionOtp: { type: String, select: false },
  actionOtpExpires: { type: Date, select: false },
  actionOtpPurpose: { type: String, select: false },
  deviceSessions: [{
    deviceId: String,
    deviceName: String,
    lastSeen: { type: Date, default: Date.now },
    ip: String,
  }],
  fcmTokens: [{ type: String }],
  notificationSettings: {
    type: Object,
    default: {
      newFollowers: true,
      postLikes: true,
      comments: true,
      communityPosts: true,
      directMessages: true,
      mentions: true,
      weeklyDigest: true
    }
  },
  // --- NEW FIELDS ---
  isOnline: { 
    type: Boolean, 
    default: false 
  },
  lastSeen: { 
    type: Date, 
    default: Date.now 
  },
  blockedUsers: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  blockedBy: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
}, { timestamps: true })

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password)
}

// FIXED: Prevent model re-compilation error
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export default User