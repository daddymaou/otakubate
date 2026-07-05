import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User'

const defaultAvatars = Array.from({ length: 12 }, (_, i) => `/defaults/avatars/avatar${i + 1}.png`)
const defaultBanners = [
  '/defaults/banners/banner1.jpg',
  '/defaults/banners/banner2.jpg',
  '/defaults/banners/banner3.jpg',
  '/defaults/banners/banner4.jpg',
  '/defaults/banners/banner5.jpg',
  '/defaults/banners/banner6.jpg'
]

export const setupPassport = () => {
  console.log('🔧 Setting up Passport...')
  console.log('🔧 Google Client ID exists:', !!process.env.GOOGLE_CLIENT_ID)
  console.log('🔧 Google Client Secret exists:', !!process.env.GOOGLE_CLIENT_SECRET)
  console.log('🔧 Callback URL:', `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`)
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
        passReqToCallback: true,
      },
      async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          console.log('🔐 Google profile received!')
          console.log('🔐 Profile ID:', profile.id)
          console.log('🔐 Profile Email:', profile.emails?.[0]?.value)
          
          if (!profile.emails?.[0]?.value) {
            console.error('❌ No email from Google profile')
            return done(new Error('No email provided by Google'), undefined)
          }
          
          // Check if user exists by email
          let user = await User.findOne({ email: profile.emails[0].value })
          
          if (user) {
            console.log('✅ Existing user found:', user.email)
            
            // If user exists but has no Google ID, link it
            if (!user.googleId) {
              user.googleId = profile.id
              await user.save()
              console.log('✅ Google ID linked to existing user')
            }
            
            // --- FIX: If user has Google avatar, replace with default ---
            if (user.avatarType === 'default' && user.avatar && user.avatar.includes('googleusercontent.com')) {
              const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]
              user.avatar = randomAvatar
              await user.save()
              console.log('🔄 Replaced Google avatar with default for existing user')
            }
            
            return done(null, user)
          }
          
          // Create new user with default avatar (NOT Google avatar)
          console.log('🆕 Creating new user from Google OAuth')
          
          // Generate username from email
          let baseUsername = profile.emails[0].value.split('@')[0]
          let username = baseUsername
          let counter = 1
          while (await User.findOne({ username })) {
            username = `${baseUsername}${counter}`
            counter++
          }
          
          // Assign random default avatar and banner
          const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]
          const randomBanner = defaultBanners[Math.floor(Math.random() * defaultBanners.length)]
          
          user = await User.create({
            username,
            email: profile.emails[0].value,
            displayName: profile.displayName || profile.name?.givenName || username,
            googleId: profile.id,
            emailVerified: true,
            isVerified: true,
            // --- FIX: Use default avatar, NOT Google avatar ---
            avatar: randomAvatar,
            avatarType: 'default',
            banner: randomBanner,
            bannerType: 'default',
          })
          
          console.log('✅ New Google user created:', user.username)
          console.log('📧 Email:', user.email)
          console.log('🖼️ Avatar:', user.avatar)
          
          try {
            const { sendWelcomeEmail } = await import('../services/email')
            await sendWelcomeEmail(user.email, user.username)
            console.log('📧 Welcome email sent to:', user.email)
          } catch (emailErr: any) {
            console.error('❌ Welcome email failed:', emailErr.message)
          }
          
          return done(null, user)
        } catch (error) {
          console.error('❌ Google strategy error:', error)
          return done(error as Error, undefined)
        }
      }
    )
  )
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id)
  })
  
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id)
      done(null, user)
    } catch (error) {
      done(error, null)
    }
  })
  
  console.log('✅ Passport setup complete')
}