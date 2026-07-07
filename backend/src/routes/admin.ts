import { Router } from 'express'
import { protect, adminOnly, AuthRequest } from '../middleware/auth'
import Club from '../modules/otaku/models/Club'
import User from '../models/User'
import Post from '../models/Post'
import Comment from '../models/Comment'
import { Response } from 'express'

const router = Router()

// ============================================
// ADMIN DASHBOARD STATS
// ============================================

router.get('/stats', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalClubs, totalAdmins, totalPosts, totalComments] = await Promise.all([
      User.countDocuments(),
      Club.countDocuments(),
      User.countDocuments({ isAdmin: true }),
      Post.countDocuments(),
      Comment.countDocuments(),
    ])

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [newUsers, newPosts, newComments] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: today } }),
      Post.countDocuments({ createdAt: { $gte: today } }),
      Comment.countDocuments({ createdAt: { $gte: today } }),
    ])

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalClubs,
        totalAdmins,
        totalPosts,
        totalComments,
        today: {
          newUsers,
          newPosts,
          newComments
        }
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

router.get('/clubs', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query
    
    const query = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    } : {}

    const clubs = await Club.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean()
    
    const total = await Club.countDocuments(query)

    res.json({
      success: true,
      clubs,
      pagination: {
        currentPage: Number(page),
        total,
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error: any) {
    console.error('Admin clubs error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============================================
// GET ALL USERS (Admin)
// ============================================

router.get('/users', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query
    
    const query = search ? {
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } }
      ]
    } : {}

    const users = await User.find(query)
      .select('-password -otp -otpExpires -verificationToken -verificationOtp -verificationOtpExpires -actionOtp')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean()
    
    const total = await User.countDocuments(query)

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: Number(page),
        total,
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error: any) {
    console.error('Admin users error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============================================
// GET ALL POSTS (Admin)
// ============================================

router.get('/posts', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, userId = '' } = req.query
    
    const query: any = {}
    if (userId) query.author = userId

    const posts = await Post.find(query)
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean()

    const total = await Post.countDocuments(query)

    res.json({
      success: true,
      posts,
      pagination: {
        currentPage: Number(page),
        total,
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error: any) {
    console.error('Admin posts error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============================================
// GET ALL COMMENTS (Admin)
// ============================================

router.get('/comments', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, userId = '' } = req.query
    
    const query: any = {}
    if (userId) query.author = userId

    const comments = await Comment.find(query)
      .populate('author', 'username displayName avatar')
      .populate('post', 'title content')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean()

    const total = await Comment.countDocuments(query)

    res.json({
      success: true,
      comments,
      pagination: {
        currentPage: Number(page),
        total,
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error: any) {
    console.error('Admin comments error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============================================
// DELETE CLUB (Admin)
// ============================================

router.delete('/clubs/:id', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const club = await Club.findById(id)
    
    if (!club) {
      res.status(404).json({ success: false, error: 'Club not found' })
      return
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
// DELETE POST (Admin)
// ============================================

router.delete('/posts/:id', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const post = await Post.findById(id)
    
    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' })
      return
    }
    
    await post.deleteOne()
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (error: any) {
    console.error('Admin delete post error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============================================
// DELETE COMMENT (Admin)
// ============================================

router.delete('/comments/:id', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const comment = await Comment.findById(id)
    
    if (!comment) {
      res.status(404).json({ success: false, error: 'Comment not found' })
      return
    }
    
    await comment.deleteOne()
    
    res.json({
      success: true,
      message: 'Comment deleted successfully'
    })
  } catch (error: any) {
    console.error('Admin delete comment error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============================================
// DELETE USER (Admin)
// ============================================

router.delete('/users/:id', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' })
      return
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

router.post('/users/:id/toggle-admin', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' })
      return
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

// ============================================
// TOGGLE USER BAN
// ============================================

router.post('/users/:id/toggle-ban', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' })
      return
    }
    
    user.isBanned = !user.isBanned
    await user.save()
    
    res.json({
      success: true,
      isBanned: user.isBanned,
      message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`
    })
  } catch (error: any) {
    console.error('Admin toggle ban error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router