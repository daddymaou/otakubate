import { Router } from 'express'
import { protect, adminOnly, AuthRequest } from '../middleware/auth'
import Club from '../modules/otaku/models/Club'
import User from '../models/User'
import { Response } from 'express'

const router = Router()

// ============================================
// ADMIN DASHBOARD STATS
// ============================================

router.get('/stats', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalClubs = await Club.countDocuments()
    const totalAdmins = await User.countDocuments({ isAdmin: true })
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalClubs,
        totalAdmins
      }
    })
  } catch (error: any) {
    console.error('Admin stats error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============================================
// GET ALL CLUBS (Admin)
// ============================================

router.get('/clubs', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const clubs = await Club.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
    
    res.json({
      success: true,
      clubs
    })
  } catch (error: any) {
    console.error('Admin clubs error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============================================
// GET ALL USERS (Admin)
// ============================================

router.get('/users', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find()
      .select('-password -otp -otpExpires -verificationToken -verificationOtp -verificationOtpExpires -actionOtp')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
    
    res.json({
      success: true,
      users
    })
  } catch (error: any) {
    console.error('Admin users error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============================================
// DELETE CLUB (Admin)
// ============================================

router.delete('/clubs/:id', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const club = await Club.findById(id)
    
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' })
    }
    
    await club.deleteOne()
    
    res.json({
      success: true,
      message: 'Club deleted successfully'
    })
  } catch (error: any) {
    console.error('Admin delete club error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============================================
// DELETE USER (Admin)
// ============================================

router.delete('/users/:id', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }
    
    await user.deleteOne()
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error: any) {
    console.error('Admin delete user error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============================================
// TOGGLE USER ADMIN STATUS
// ============================================

router.post('/users/:id/toggle-admin', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }
    
    user.isAdmin = !user.isAdmin
    await user.save()
    
    res.json({
      success: true,
      isAdmin: user.isAdmin,
      message: `User admin status updated to ${user.isAdmin}`
    })
  } catch (error: any) {
    console.error('Admin toggle error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router