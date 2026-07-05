import { Router, Response, Request } from 'express'
import User from '../models/User'
import Follow from '../models/Follow'
import Post from '../models/Post'
import Comment from '../models/Comment'
import Message from '../models/Message'
import Notification from '../models/Notification'
import { protect, AuthRequest, optionalAuth } from '../middleware/auth'
import { getPagination } from '../utils/helpers'
import bcrypt from 'bcryptjs'
import { generateOTP } from '../utils/helpers'
import { sendVerificationEmail } from '../services/email'

const router = Router()

// Helper function to sanitize user data
const safeUser = (user: any) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  displayName: user.displayName,
  avatar: user.avatar,
  banner: user.banner || '',
  bio: user.bio || '',
  isAdmin: user.isAdmin,
  isPremium: user.isPremium,
  isVerified: user.isVerified,
  emailVerified: user.emailVerified,
  followersCount: user.followersCount || 0,
  followingCount: user.followingCount || 0,
  postsCount: user.postsCount || 0,
  favoriteAnime: user.favoriteAnime || [],
  favoriteGenres: user.favoriteGenres || [],
  avatarType: user.avatarType || 'default',
  bannerType: user.bannerType || 'default',
  gender: user.gender || 'prefer-not-to-say',
  pronouns: user.pronouns || '',
  location: user.location || '',
  website: user.website || '',
})

// ============================================
// CHECK USERNAME AVAILABILITY
// ============================================
router.get('/check-username', async (req: Request, res: Response) => {
  try {
    const { username } = req.query
    if (!username || typeof username !== 'string') {
      return res.json({ available: false })
    }
    
    if (username.length < 3) {
      return res.json({ available: false, reason: 'Username must be at least 3 characters' })
    }
    
    const existingUser = await User.findOne({ username })
    res.json({ available: !existingUser })
  } catch (err) {
    res.json({ available: false })
  }
})

// ============================================
// SEARCH USERS - MUST COME BEFORE /:username
// ============================================
router.get('/search', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { q, page = 1, limit = 20 } = req.query
    if (!q || typeof q !== 'string') {
      return res.json({ success: true, users: [] })
    }
    
    const { skip } = getPagination(Number(page), Number(limit))
    
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } },
      ],
      isActive: true,
    })
      .select('username displayName avatar bio isVerified isPremium followersCount followingCount emailVerified avatarType banner bannerType gender pronouns location website favoriteGenres favoriteAnime')
      .skip(skip)
      .limit(Number(limit))
    
    // Add isFollowing status for each user
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        const isFollowing = await Follow.findOne({ 
          follower: req.user._id, 
          following: user._id 
        })
        return {
          ...safeUser(user),
          isFollowing: !!isFollowing
        }
      })
    )
    
    res.json({ success: true, users: usersWithStatus })
  } catch (err: any) {
    console.error('Search error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// GET RECOMMENDED USERS
// ============================================
router.get('/recommended', protect, async (req: AuthRequest, res: Response) => {
  try {
    const limit = 20
    
    const following = await Follow.find({ follower: req.user._id }).select('following')
    const followingIds = following.map(f => f.following.toString())
    const excludeIds = [req.user._id.toString(), ...followingIds]
    
    const users = await User.find({
      _id: { $nin: excludeIds },
      isActive: true,
    })
      .select('username displayName avatar bio isVerified isPremium followersCount followingCount favoriteGenres avatarType banner bannerType')
      .sort({ followersCount: -1, postsCount: -1 })
      .limit(limit)
    
    let recommendedUsers = users
    if (req.user.favoriteGenres && req.user.favoriteGenres.length > 0) {
      const genreMatched = await User.find({
        _id: { $nin: excludeIds },
        isActive: true,
        favoriteGenres: { $in: req.user.favoriteGenres },
      })
        .select('username displayName avatar bio isVerified isPremium followersCount followingCount favoriteGenres avatarType banner bannerType')
        .sort({ followersCount: -1 })
        .limit(limit)
      
      const matchedIds = genreMatched.map(u => u._id.toString())
      const remainingUsers = users.filter(u => !matchedIds.includes(u._id.toString()))
      recommendedUsers = [...genreMatched, ...remainingUsers].slice(0, limit)
    }
    
    const usersWithStatus = recommendedUsers.map(user => ({
      ...safeUser(user),
      isFollowing: false,
    }))
    
    res.json({ success: true, users: usersWithStatus })
  } catch (err: any) {
    console.error('Recommended users error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// CHANGE USERNAME
// ============================================
router.put('/me/username', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.body
    
    if (!username || username.length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters' })
    }
    
    const existingUser = await User.findOne({ username })
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Username already taken' })
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpires -verificationToken -verificationOtp -verificationOtpExpires -actionOtp')
    
    res.json({ success: true, user: safeUser(user) })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// DEPRECATED: Old username endpoint with verification
// ============================================
router.put('/me/username-old', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { username, actionVerified } = req.body
    
    if (!actionVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required to change username',
        requiresVerification: true,
        purpose: 'USERNAME_CHANGE',
      })
    }
    
    const existingUser = await User.findOne({ username })
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Username already taken' })
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpires -verificationToken -verificationOtp -verificationOtpExpires -actionOtp')
    
    res.json({ success: true, user: safeUser(user) })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// PUBLIC ROUTE - ANYONE CAN VIEW PROFILE
// ============================================
router.get('/:username', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      '-password -otp -otpExpires -deviceSessions -verificationToken -verificationOtp -verificationOtpExpires -actionOtp'
    )
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    
    const defaultAvatars = Array.from({ length: 12 }, (_, i) => `/defaults/avatars/avatar${i + 1}.png`)
    const defaultBanners = [
      '/defaults/banners/banner1.jpg',
      '/defaults/banners/banner2.jpg',
      '/defaults/banners/banner3.jpg',
      '/defaults/banners/banner4.jpg',
      '/defaults/banners/banner5.jpg',
      '/defaults/banners/banner6.jpg'
    ]
    
    const avatarIndex = (user._id.toString().charCodeAt(0) || 0) % defaultAvatars.length
    const bannerIndex = (user._id.toString().charCodeAt(0) || 0) % defaultBanners.length
    const isFollowing = req.user ? await Follow.findOne({ follower: req.user._id, following: user._id }) : false
    
    res.json({ 
      success: true, 
      user: { 
        ...user.toObject(), 
        isFollowing: !!isFollowing,
        avatar: user.avatar || defaultAvatars[avatarIndex],
        avatarType: user.avatarType || 'default',
        banner: user.banner || defaultBanners[bannerIndex],
        bannerType: user.bannerType || 'default',
        gender: user.gender || 'prefer-not-to-say',
        pronouns: user.pronouns || '',
        location: user.location || '',
        website: user.website || '',
      } 
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// UPDATE CURRENT USER
// ============================================
router.put('/me', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      displayName, bio, avatar, banner, favoriteGenres, favoriteAnime, avatarType, bannerType,
      gender, pronouns, location, website 
    } = req.body

    const updateData: any = { displayName, bio, favoriteGenres, favoriteAnime, gender, pronouns, location, website }
    if (avatar !== undefined) updateData.avatar = avatar
    if (banner !== undefined) updateData.banner = banner
    if (avatarType !== undefined) updateData.avatarType = avatarType
    if (bannerType !== undefined) updateData.bannerType = bannerType

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpires -verificationToken -verificationOtp -verificationOtpExpires -actionOtp')

    res.json({ success: true, user: safeUser(user) })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// CHANGE EMAIL
// ============================================
router.put('/me/email', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { newEmail } = req.body
    
    if (!newEmail) {
      return res.status(400).json({ success: false, message: 'New email is required' })
    }
    
    const existingUser = await User.findOne({ email: newEmail.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' })
    }
    
    const otp = generateOTP()
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        email: newEmail.toLowerCase(),
        emailVerified: false,
        verificationOtp: otp,
        verificationOtpExpires: new Date(Date.now() + 10 * 60 * 1000)
      },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpires -verificationToken -verificationOtp -verificationOtpExpires -actionOtp')
    
    try {
      await sendVerificationEmail(newEmail.toLowerCase(), user.username, otp)
      console.log(`📧 Verification OTP sent to new email: ${newEmail.toLowerCase()}`)
    } catch (emailErr: any) {
      console.error('Verification email failed:', emailErr.message)
    }
    
    res.json({ 
      success: true, 
      message: 'Verification code sent to your new email address. Please verify to complete email change.',
      requiresVerification: true,
      user: safeUser(user)
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// VERIFY NEW EMAIL
// ============================================
router.post('/me/verify-new-email', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { otp } = req.body
    
    const user = await User.findById(req.user._id).select('+verificationOtp +verificationOtpExpires')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    
    if (!user.verificationOtp || !user.verificationOtpExpires || user.verificationOtp !== otp || user.verificationOtpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' })
    }
    
    user.emailVerified = true
    user.verificationOtp = undefined
    user.verificationOtpExpires = undefined
    await user.save()
    
    res.json({ success: true, message: 'New email verified successfully!' })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// CHANGE PASSWORD - FIXED for Google users
// ============================================
router.put('/me/password', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' })
    }
    
    const user = await User.findById(req.user._id).select('+password')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    
    if (!user.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'This account uses Google Sign-In. You don\'t have a password to change.',
        isGoogleUser: true
      })
    }
    
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' })
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }
    
    user.password = newPassword
    await user.save()
    
    res.json({ success: true, message: 'Password changed successfully' })
  } catch (err: any) {
    console.error('Change password error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// UPDATE NOTIFICATION SETTINGS
// ============================================
router.put('/me/notifications', protect, async (req: AuthRequest, res: Response) => {
  try {
    const notificationSettings = req.body
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificationSettings },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpires -verificationToken -verificationOtp -verificationOtpExpires -actionOtp')
    
    res.json({ success: true, user: safeUser(user) })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// UPDATE PRIVACY SETTINGS
// ============================================
router.put('/me/privacy', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { actionVerified, ...privacySettings } = req.body
    if (!actionVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required to change privacy settings',
        requiresVerification: true,
        purpose: 'PRIVACY_UPDATE',
      })
    }
    const user = await User.findByIdAndUpdate(req.user._id, privacySettings, { new: true }).select('-password')
    res.json({ success: true, user: safeUser(user) })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// FOLLOW/UNFOLLOW USER
// ============================================
router.post('/:id/follow', protect, async (req: AuthRequest, res: Response) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, message: "You can't follow yourself" })
    
    const target = await User.findById(req.params.id)
    if (!target) return res.status(404).json({ success: false, message: 'User not found' })
    
    const existing = await Follow.findOne({ follower: req.user._id, following: req.params.id })
    
    if (existing) {
      await existing.deleteOne()
      await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } })
      await User.findByIdAndUpdate(req.params.id, { $inc: { followersCount: -1 } })
      return res.json({ success: true, following: false })
    }
    
    await Follow.create({ follower: req.user._id, following: req.params.id })
    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } })
    await User.findByIdAndUpdate(req.params.id, { $inc: { followersCount: 1 } })
    
    if (target._id.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: target._id,
        sender: req.user._id,
        type: 'follow',
        message: `${req.user.displayName || req.user.username} started following you`,
        link: `/profile/${req.user.username}`,
        relatedId: req.user._id
      })
    }
    
    res.json({ success: true, following: true })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// GET USER POSTS
// ============================================
router.get('/:id/posts', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const { skip } = getPagination(Number(page), Number(limit))
    const posts = await Post.find({ author: req.params.id })
      .populate('author', 'username displayName avatar isVerified avatarType banner bannerType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
    res.json({ success: true, posts })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// GET USER'S FOLLOWERS
// ============================================
router.get('/:id/followers', protect, async (req: AuthRequest, res: Response) => {
  try {
    const follows = await Follow.find({ following: req.params.id }).populate(
      'follower',
      'username displayName avatar bio isVerified avatarType'
    )
    
    const followersWithStatus = await Promise.all(
      follows.map(async (f) => {
        const follower = f.follower
        const isFollowing = req.user ? await Follow.findOne({ 
          follower: req.user._id, 
          following: follower._id 
        }) : false
        return {
          ...follower.toObject(),
          isFollowing: !!isFollowing
        }
      })
    )
    
    res.json({ success: true, followers: followersWithStatus })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// GET USERS THAT A USER IS FOLLOWING
// ============================================
router.get('/:id/following', protect, async (req: AuthRequest, res: Response) => {
  try {
    const follows = await Follow.find({ follower: req.params.id }).populate(
      'following',
      'username displayName avatar bio isVerified avatarType'
    )
    
    const followingWithStatus = await Promise.all(
      follows.map(async (f) => {
        const following = f.following
        const isFollowing = req.user ? await Follow.findOne({ 
          follower: req.user._id, 
          following: following._id 
        }) : false
        return {
          ...following.toObject(),
          isFollowing: !!isFollowing
        }
      })
    )
    
    res.json({ success: true, following: followingWithStatus })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// DELETE ACCOUNT - FIXED for Google users
// ============================================
router.delete('/me', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { actionVerified } = req.body
    
    if (!actionVerified) {
      return res.status(403).json({
        success: false,
        message: 'Verification required to delete account',
        requiresVerification: true,
        purpose: 'DELETE_ACCOUNT',
      })
    }
    
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    await User.findByIdAndDelete(req.user._id)
    await Post.deleteMany({ author: req.user._id })
    await Follow.deleteMany({ $or: [{ follower: req.user._id }, { following: req.user._id }] })
    await Comment.deleteMany({ author: req.user._id })
    await Message.deleteMany({ $or: [{ sender: req.user._id }, { receiver: req.user._id }] })
    
    res.json({ success: true, message: 'Account deleted successfully' })
  } catch (err: any) {
    console.error('Delete account error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router