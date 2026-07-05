import { Router, Request, Response } from 'express'
import User from '../models/User'

const router = Router()

router.get('/profile/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params
    const user = await User.findOne({ username })
    
    const defaultAvatars = Array.from({ length: 12 }, (_, i) => `/defaults/avatars/avatar${i + 1}.png`)
    const defaultBanners = [
      '/defaults/banners/banner1.jpg',
      '/defaults/banners/banner2.jpg',
      '/defaults/banners/banner3.jpg',
      '/defaults/banners/banner4.jpg',
      '/defaults/banners/banner5.jpg',
      '/defaults/banners/banner6.jpg'
    ]
    
    const avatarIndex = (user?._id.toString().charCodeAt(0) || 0) % defaultAvatars.length
    const avatarUrl = user?.avatar || defaultAvatars[avatarIndex]
    const displayName = user?.displayName || user?.username || username
    const bio = user?.bio || `${displayName} is on OtakuBate`
    
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a2e"/>
          <stop offset="100%" style="stop-color:#16213e"/>
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#E63946"/>
          <stop offset="100%" style="stop-color:#FF6B7A"/>
        </linearGradient>
        <clipPath id="circleClip">
          <circle cx="600" cy="250" r="90"/>
        </clipPath>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bg)"/>
      <rect x="0" y="0" width="1200" height="6" fill="url(#accent)"/>
      
      <!-- Avatar background -->
      <circle cx="600" cy="250" r="100" fill="rgba(255,255,255,0.05)"/>
      <circle cx="600" cy="250" r="90" fill="rgba(255,255,255,0.08)"/>
      
      <!-- Avatar image -->
      <image href="${avatarUrl}" x="510" y="160" width="180" height="180" clip-path="url(#circleClip)"/>
      
      <!-- Display name -->
      <text x="600" y="390" font-family="Arial, sans-serif" font-size="46" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
        ${displayName.length > 30 ? displayName.substring(0, 27) + '...' : displayName}
      </text>
      
      <!-- Username -->
      <text x="600" y="430" font-family="Arial, sans-serif" font-size="22" fill="#999" text-anchor="middle">
        @${username}
      </text>
      
      <!-- Bio -->
      <text x="600" y="480" font-family="Arial, sans-serif" font-size="16" fill="#666" text-anchor="middle">
        ${bio.length > 100 ? bio.substring(0, 97) + '...' : bio}
      </text>
      
      <!-- Button -->
      <rect x="450" y="550" width="300" height="40" rx="20" fill="#E63946" opacity="0.95"/>
      <text x="600" y="576" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
        OtakuBate — Anime Social Network
      </text>
    </svg>`
    
    res.setHeader('Content-Type', 'image/svg+xml')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.send(svg)
  } catch (err) {
    console.error('OG image error:', err)
    // Return a fallback image
    res.setHeader('Content-Type', 'image/svg+xml')
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#1a1a2e"/>
      <rect x="0" y="0" width="1200" height="6" fill="#E63946"/>
      <text x="600" y="315" font-family="Arial, sans-serif" font-size="42" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
        OtakuBate
      </text>
      <text x="600" y="365" font-family="Arial, sans-serif" font-size="20" fill="#999" text-anchor="middle">
        Anime Social Network
      </text>
    </svg>`)
  }
})

export default router