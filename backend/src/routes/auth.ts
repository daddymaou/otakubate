import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import crypto from 'crypto'
import User from '../models/User'
import { generateOTP } from '../utils/helpers'
import {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendActionOTPEmail,
} from '../services/email'
import { protect, AuthRequest } from '../middleware/auth'
import { authLimiter } from '../middleware/rateLimiter'

const router = Router()

const signToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })
const signRefresh = (id: string) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' })

const validatePassword = (password: string): string | null => {
  if (!password || password.length < 6) return 'Password must be at least 6 characters long'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter (A-Z)'
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter (a-z)'
  if (!/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/.test(password))
    return 'Password must contain at least one number or symbol'
  return null
}

// Default avatars and banners
const defaultAvatars = Array.from({ length: 12 }, (_, i) => `/defaults/avatars/avatar${i + 1}.png`)
const defaultBanners = [
  '/defaults/banners/banner1.jpg',
  '/defaults/banners/banner2.jpg',
  '/defaults/banners/banner3.jpg',
  '/defaults/banners/banner4.jpg',
  '/defaults/banners/banner5.jpg',
  '/defaults/banners/banner6.jpg'
]

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
// TEST EMAIL ENDPOINT
// ============================================
router.post('/test-email', protect, async (req: AuthRequest, res: Response) => {
  try {
    console.log('📧 Testing email to:', req.user.email)
    
    const { sendVerificationEmail } = await import('../services/email')
    await sendVerificationEmail(
      req.user.email,
      req.user.username,
      '123456'
    )
    
    res.json({ success: true, message: 'Test email sent successfully! Check your inbox.' })
  } catch (error: any) {
    console.error('❌ Test email error:', error.message)
    res.status(500).json({ 
      success: false, 
      message: error.message,
      details: error.stack
    })
  }
})

// ============================================
// ACTION OTP - USERNAME_CHANGE REMOVED (3-day cooldown only)
// ============================================
router.post('/send-action-otp', protect, authLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { purpose } = req.body
    const allowed = ['EMAIL_CHANGE', 'PASSWORD_CHANGE', 'DELETE_ACCOUNT', 'PRIVACY_UPDATE']
    if (!allowed.includes(purpose)) {
      return res.status(400).json({ success: false, message: 'Invalid purpose' })
    }
    
    const otp = generateOTP()
    
    await User.findByIdAndUpdate(req.user._id, {
      actionOtp: otp,
      actionOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
      actionOtpPurpose: purpose,
    })
    
    console.log(`📧 Sending action OTP for ${purpose} to ${req.user.email}`)
    console.log(`📧 OTP Code: ${otp}`)
    
    try {
      await sendActionOTPEmail(req.user.email, otp, req.user.username, purpose)
      console.log('✅ Action OTP email sent successfully')
      
      res.json({ 
        success: true, 
        message: 'Verification code sent to your email',
        devCode: process.env.NODE_ENV === 'development' ? otp : undefined
      })
    } catch (emailErr: any) {
      console.error('❌ Action OTP email failed:', emailErr.message)
      
      if (process.env.NODE_ENV === 'development') {
        return res.json({ 
          success: true, 
          message: `[DEV] Code: ${otp} (check console)`,
          devCode: otp
        })
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send verification code. Please check your email settings.',
        code: 'EMAIL_FAILED'
      })
    }
  } catch (err: any) {
    console.error('Send action OTP error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// VERIFY ACTION OTP
// ============================================
router.post('/verify-action-otp', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { otp, purpose } = req.body
    
    if (!otp || !purpose) {
      return res.status(400).json({ success: false, message: 'OTP and purpose are required' })
    }
    
    const user = await User.findById(req.user._id).select('+actionOtp +actionOtpExpires +actionOtpPurpose')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    
    if (process.env.NODE_ENV === 'development' && otp === '123456') {
      user.actionOtp = undefined
      user.actionOtpExpires = undefined
      user.actionOtpPurpose = undefined
      await user.save()
      return res.json({ success: true, message: 'Verified successfully (dev mode)' })
    }
    
    if (!user.actionOtp || !user.actionOtpExpires || user.actionOtp !== otp || user.actionOtpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' })
    }
    
    if (user.actionOtpPurpose !== purpose) {
      return res.status(400).json({ success: false, message: 'Code was issued for a different action' })
    }
    
    user.actionOtp = undefined
    user.actionOtpExpires = undefined
    user.actionOtpPurpose = undefined
    await user.save()
    
    res.json({ success: true, message: 'Verified successfully' })
  } catch (err: any) {
    console.error('Verify action OTP error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// REGISTER
// ============================================
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { username, email, password, displayName } = req.body
    if (!username || !email || !password)
      return res.status(400).json({ success: false, message: 'Username, email and password are required' })

    const pwError = validatePassword(password)
    if (pwError) return res.status(400).json({ success: false, message: pwError })

    const emailExists = await User.findOne({ email: email.toLowerCase() })
    if (emailExists) return res.status(400).json({ success: false, message: 'This email is already registered' })

    const usernameExists = await User.findOne({ username })
    if (usernameExists) return res.status(400).json({ success: false, message: 'This username is already taken' })

    const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]
    const randomBanner = defaultBanners[Math.floor(Math.random() * defaultBanners.length)]

    const verificationOtp = generateOTP()
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
      displayName: displayName || username,
      emailVerified: false,
      avatar: randomAvatar,
      avatarType: 'default',
      banner: randomBanner,
      bannerType: 'default',
      verificationOtp,
      verificationOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
    })

    try {
      await sendVerificationEmail(email.toLowerCase(), username, verificationOtp)
      console.log(`📧 Verification OTP sent to ${email.toLowerCase()}`)
    } catch (emailErr: any) {
      console.error('Verification email failed:', emailErr.message)
    }

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful! A 6-digit code has been sent to your email.',
      requiresVerification: true,
      email: user.email,
      userId: user._id
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// VERIFY EMAIL WITH OTP
router.post('/verify-email-otp', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, otp, userId } = req.body
    
    let user
    if (userId) {
      user = await User.findById(userId).select('+verificationOtp +verificationOtpExpires')
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+verificationOtp +verificationOtpExpires')
    }
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    
    if (user.emailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' })
    }
    
    if (!user.verificationOtp || !user.verificationOtpExpires || user.verificationOtp !== otp || user.verificationOtpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' })
    }
    
    user.emailVerified = true
    user.verificationOtp = undefined
    user.verificationOtpExpires = undefined
    await user.save()
    
    try {
      await sendWelcomeEmail(user.email, user.username)
      console.log('📧 Welcome email sent to:', user.email)
    } catch (emailErr: any) {
      console.error('Welcome email failed:', emailErr.message)
    }
    
    const token = signToken(user._id.toString())
    const refresh = signRefresh(user._id.toString())
    
    res.json({ 
      success: true, 
      message: 'Email verified successfully! You are now logged in.',
      token,
      refreshToken: refresh,
      user: safeUser(user)
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// RESEND VERIFICATION OTP
// ============================================
router.post('/resend-verification-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' })
    }
    
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' })
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified. Please login.' })
    }
    
    const otp = generateOTP()
    user.verificationOtp = otp
    user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()
    
    try {
      await sendVerificationEmail(user.email, user.username, otp)
      console.log(`📧 Resent verification OTP to ${user.email}`)
    } catch (emailErr: any) {
      console.error('Resend verification email failed:', emailErr.message)
      return res.status(500).json({ success: false, message: 'Failed to send verification email. Please try again.' })
    }
    
    res.json({ 
      success: true, 
      message: 'Verification code sent! Check your email.',
      userId: user._id,
      email: user.email
    })
  } catch (err: any) {
    console.error('Resend verification error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// LOGIN
// ============================================
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with this email address' })
    }
    
    if (!user.emailVerified) {
      if (!user.verificationOtp || user.verificationOtpExpires < new Date()) {
        const otp = generateOTP()
        user.verificationOtp = otp
        user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000)
        await user.save()
        
        try {
          await sendVerificationEmail(user.email, user.username, otp)
          console.log(`📧 Resent verification OTP to ${user.email}`)
        } catch (emailErr: any) {
          console.error('Verification email failed:', emailErr.message)
        }
      }
      
      return res.status(403).json({ 
        success: false, 
        message: 'Please verify your email address first. A verification code has been sent to your email.',
        requiresVerification: true,
        email: user.email,
        userId: user._id,
        canResend: true
      })
    }
    
    if (!user.password) {
      return res.status(401).json({ 
        success: false, 
        message: 'This account uses Google Sign-In. Please continue with Google.',
        isGoogleUser: true
      })
    }
    
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' })
    }

    const match = await user.comparePassword(password)
    if (!match) {
      return res.status(401).json({ success: false, message: 'Incorrect password' })
    }

    const token = signToken(user._id.toString())
    const refresh = signRefresh(user._id.toString())
    
    res.json({ success: true, token, refreshToken: refresh, user: safeUser(user) })
  } catch (err: any) {
    console.error('Login error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// GOOGLE OAUTH
// ============================================
router.get('/google', 
  (req, res, next) => {
    console.log('🔐 Google OAuth route hit!')
    console.log('🔐 GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID)
    console.log('🔐 GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET)
    
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      const fe = process.env.FRONTEND_URL || 'http://localhost:5173'
      console.log('❌ Google OAuth not configured - missing credentials')
      return res.redirect(`${fe}/login?error=google_not_configured`)
    }
    next()
  },
  (req, res, next) => {
    console.log('🔐 Passing to passport.authenticate...')
    next()
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account'
  })
)

router.get('/google/callback',
  (req, res, next) => {
    console.log('🔐 Google callback route hit!')
    console.log('🔐 Query params:', req.query)
    next()
  },
  (req, res, next) => {
    passport.authenticate('google', { 
      session: false,
      failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_failed`
    })(req, res, next)
  },
  async (req: any, res) => {
    try {
      console.log('✅ Google authentication successful')
      console.log('✅ User email:', req.user?.email)
      const googleUser = req.user
      
      if (!googleUser) {
        throw new Error('No user returned from Google')
      }
      
      let user = await User.findOne({ email: googleUser.email })
      
      if (!user) {
        console.log('🆕 Creating new user from Google OAuth')
        
        let baseUsername = googleUser.email.split('@')[0]
        let username = baseUsername
        let counter = 1
        while (await User.findOne({ username })) {
          username = `${baseUsername}${counter}`
          counter++
        }
        
        const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]
        const randomBanner = defaultBanners[Math.floor(Math.random() * defaultBanners.length)]
        
        user = await User.create({
          username,
          email: googleUser.email,
          displayName: googleUser.displayName || googleUser.username || username,
          avatar: randomAvatar,
          avatarType: 'default',
          banner: randomBanner,
          bannerType: 'default',
          emailVerified: true,
          isVerified: true,
          googleId: googleUser.id,
        })
        
        console.log('✅ New Google user created:', user.username)
        
        try {
          await sendWelcomeEmail(user.email, user.username)
          console.log('📧 Welcome email sent to:', user.email)
        } catch (emailErr: any) {
          console.error('Welcome email failed:', emailErr.message)
        }
      } else {
        console.log('✅ Existing Google user found:', user.username)
        if (user.avatarType === 'default' && user.avatar && user.avatar.includes('googleusercontent.com')) {
          const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]
          user.avatar = randomAvatar
          await user.save()
          console.log('🔄 Replaced Google avatar with default for existing user')
        }
      }
      
      const token = signToken(user._id.toString())
      const refresh = signRefresh(user._id.toString())
      const fe = process.env.FRONTEND_URL || 'http://localhost:5173'
      
      console.log('🔐 Redirecting to Google callback')
      // ✅ FIXED: Redirect to frontend Google callback with token
      res.redirect(`${fe}/auth/google/callback?token=${token}&refreshToken=${refresh}`)
    } catch (err: any) {
      console.error('❌ Google callback error:', err.message)
      const fe = process.env.FRONTEND_URL || 'http://localhost:5173'
      res.redirect(`${fe}/login?error=google_failed`)
    }
  }
)

// FORGOT PASSWORD
router.post('/forgot-password', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' })
    
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(404).json({ success: false, message: 'No account found' })
    
    const otp = generateOTP()
    user.otp = otp
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()
    
    try {
      await sendPasswordResetEmail(email.toLowerCase(), otp, user.username)
    } catch (emailErr: any) {
      console.error('Password reset email failed:', emailErr.message)
    }
    
    res.json({ success: true, message: 'Reset code sent to your email', email: user.email, userId: user._id })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// VERIFY RESET OTP
router.post('/verify-reset-otp', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' })
    }
    
    const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpires')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    
    if (!user.otp || !user.otpExpires || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset code' })
    }
    
    res.json({ success: true, message: 'Code verified successfully' })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// RESET PASSWORD
router.post('/reset-password', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' })
    }
    
    const pwError = validatePassword(newPassword)
    if (pwError) return res.status(400).json({ success: false, message: pwError })
    
    const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpires')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    
    if (!user.otp || !user.otpExpires || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset code' })
    }
    
    user.password = newPassword
    user.otp = undefined
    user.otpExpires = undefined
    await user.save()
    
    res.json({ success: true, message: 'Password reset successfully!' })
  } catch (err: any) {
    console.error('Reset password error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// REFRESH TOKEN
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'No refresh token provided',
        code: 'NO_REFRESH_TOKEN'
      })
    }
    
    let decoded: any
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!)
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Refresh token expired. Please login again.',
          code: 'REFRESH_EXPIRED'
        })
      }
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      })
    }
    
    const user = await User.findById(decoded.id).select('-password -otp -otpExpires -verificationToken -verificationOtp -verificationOtpExpires -actionOtp')
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      })
    }
    
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is deactivated',
        code: 'ACCOUNT_INACTIVE'
      })
    }
    
    const newToken = signToken(user._id.toString())
    
    res.json({ 
      success: true, 
      token: newToken,
      user: safeUser(user)
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired refresh token',
      code: 'REFRESH_ERROR'
    })
  }
})

// GET ME
router.get('/me', protect, async (req: AuthRequest, res: Response) => {
  try {
    console.log('📡 /me endpoint called - User ID:', req.user?._id)
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }
    
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    console.log('✅ Returning user data for:', user.username)
    res.json({ success: true, user: safeUser(user) })
  } catch (err: any) {
    console.error('❌ /me error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router