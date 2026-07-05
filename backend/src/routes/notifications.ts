import { Router, Response } from 'express'
import Notification from '../models/Notification'
import { protect, AuthRequest } from '../middleware/auth'

const router = Router()

// GET all notifications with pagination and filtering
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 30, type, read } = req.query
    const skip = (Number(page) - 1) * Number(limit)
    
    // Build filter
    const filter: any = { recipient: req.user._id }
    if (type) filter.type = type
    if (read !== undefined) filter.read = read === 'true'
    
    const notifications = await Notification.find(filter)
      .populate('sender', 'username displayName avatar isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
    
    const total = await Notification.countDocuments(filter)
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false })
    
    res.json({ 
      success: true, 
      notifications, 
      unreadCount,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

// GET unread count only (for bell badge)
router.get('/unread-count', protect, async (req: AuthRequest, res: Response) => {
  try {
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false })
    res.json({ success: true, count: unreadCount })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

// Mark single notification as read
router.patch('/:id/read', protect, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id })
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' })
    }
    notification.read = true
    await notification.save()
    res.json({ success: true, notification })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

// Mark single notification as unread (undo)
router.patch('/:id/unread', protect, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id })
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' })
    }
    notification.read = false
    await notification.save()
    res.json({ success: true, notification })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

// Mark all notifications as read
router.put('/read-all', protect, async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false }, 
      { read: true }
    )
    res.json({ success: true, message: 'All notifications marked as read' })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

// Delete single notification
router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findOneAndDelete({ 
      _id: req.params.id, 
      recipient: req.user._id 
    })
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' })
    }
    res.json({ success: true, message: 'Notification deleted' })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

// Delete all read notifications
router.delete('/read/all', protect, async (req: AuthRequest, res: Response) => {
  try {
    const result = await Notification.deleteMany({ 
      recipient: req.user._id, 
      read: true 
    })
    res.json({ success: true, message: `${result.deletedCount} read notifications cleared` })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

// Delete all notifications (clear entire inbox)
router.delete('/all', protect, async (req: AuthRequest, res: Response) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id })
    res.json({ success: true, message: 'All notifications cleared' })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

// Delete notifications by type
router.delete('/type/:type', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.params
    const validTypes = ['like', 'comment', 'reply', 'follow', 'mention', 'community_join', 'post_removed', 'warning', 'verified']
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid notification type' })
    }
    
    const result = await Notification.deleteMany({ 
      recipient: req.user._id, 
      type 
    })
    res.json({ success: true, message: `${result.deletedCount} ${type} notifications deleted` })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

export default router