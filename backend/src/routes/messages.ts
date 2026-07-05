import { Router, Response } from 'express'
import Message from '../models/Message'
import User from '../models/User'
import { protect, AuthRequest } from '../middleware/auth'

const router = Router()

const getConvId = (a: string, b: string) => [a, b].sort().join('_')

// ============================================
// GET CONVERSATIONS
// ============================================
router.get('/conversations', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id.toString()
    
    // Get all messages where user is sender or receiver
    const msgs = await Message.aggregate([
      { $match: { $or: [{ sender: req.user._id }, { receiver: req.user._id }] } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$conversation', lastMessage: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$lastMessage' } },
      { $sort: { createdAt: -1 } },
    ])
    
    const conversations = await Promise.all(msgs.map(async (msg) => {
      const otherId = msg.sender.toString() === userId ? msg.receiver.toString() : msg.sender.toString()
      
      // Check if user is blocked
      const [other, blockCheck, blockedByCheck] = await Promise.all([
        User.findById(otherId).select('username displayName avatar isVerified isOnline lastSeen'),
        User.findOne({ _id: userId, blockedUsers: otherId }),
        User.findOne({ _id: otherId, blockedUsers: userId })
      ])
      
      const isBlocked = !!blockCheck
      const isBlockedByThem = !!blockedByCheck
      const unread = await Message.countDocuments({ 
        conversation: msg.conversation, 
        receiver: req.user._id, 
        isRead: false 
      })
      
      return { 
        conversationId: msg.conversation, 
        user: other, 
        lastMessage: msg, 
        unreadCount: unread,
        isBlocked,
        isBlockedByThem
      }
    }))
    
    res.json({ success: true, conversations })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

// ============================================
// GET MESSAGES WITH USER - UPDATED: Always return messages
// ============================================
router.get('/:userId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params
    const myId = req.user._id.toString()
    
    // Check if blocked - but don't block access to messages
    const [blocked, blockedBy] = await Promise.all([
      User.findOne({ _id: myId, blockedUsers: userId }),
      User.findOne({ _id: userId, blockedUsers: myId })
    ])
    
    const convId = getConvId(myId, userId)
    
    // Get messages - ALWAYS return them, even if blocked
    const messages = await Message.find({ conversation: convId })
      .populate('sender', 'username displayName avatar')
      .sort({ createdAt: 1 })
      .limit(100)
    
    // Mark messages as read ONLY if not blocked
    if (!blocked && !blockedBy) {
      await Message.updateMany(
        { 
          conversation: convId, 
          receiver: req.user._id, 
          isRead: false 
        }, 
        { 
          isRead: true,
          readAt: new Date()
        }
      )
    }
    
    // Get online status of other user (only if not blocked)
    const otherUser = await User.findById(userId).select('isOnline lastSeen')
    
    res.json({ 
      success: true, 
      messages,
      isOnline: otherUser?.isOnline || false,
      lastSeen: otherUser?.lastSeen,
      isBlocked: !!blocked,
      isBlockedByUser: !!blockedBy
    })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

// ============================================
// SEND MESSAGE - UPDATED: Return 200 with block info instead of 403
// ============================================
router.post('/:userId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params
    const { content, image } = req.body
    const myId = req.user._id.toString()
    
    if (!content && !image) {
      return res.status(400).json({ success: false, message: 'Content or image required' })
    }
    
    // Check if blocked
    const [blocked, blockedBy] = await Promise.all([
      User.findOne({ _id: myId, blockedUsers: userId }),
      User.findOne({ _id: userId, blockedUsers: myId })
    ])
    
    if (blocked || blockedBy) {
      // Return 200 with block info instead of 403 error
      return res.status(200).json({ 
        success: false, 
        message: blockedBy ? 'You have been blocked by this user' : 'You have blocked this user',
        blocked: true,
        blockedByUser: !!blockedBy
      })
    }
    
    const convId = getConvId(myId, userId)
    
    const msg = await Message.create({ 
      conversation: convId, 
      sender: req.user._id, 
      receiver: userId, 
      content: content || '',
      image: image || null,
      deliveredAt: new Date()
    })
    
    const populated = await msg.populate('sender', 'username displayName avatar')
    
    res.status(201).json({ success: true, message: populated })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

// ============================================
// MARK MESSAGE AS READ
// ============================================
router.patch('/:messageId/read', protect, async (req: AuthRequest, res: Response) => {
  try {
    const message = await Message.findOne({
      _id: req.params.messageId,
      receiver: req.user._id
    })
    
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' })
    }
    
    if (!message.isRead) {
      message.isRead = true
      message.readAt = new Date()
      await message.save()
    }
    
    res.json({ success: true, message })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

// ============================================
// MARK ALL MESSAGES AS READ IN CONVERSATION
// ============================================
router.patch('/:userId/read-all', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params
    const convId = getConvId(req.user._id.toString(), userId)
    
    const result = await Message.updateMany(
      { 
        conversation: convId, 
        receiver: req.user._id, 
        isRead: false 
      }, 
      { 
        isRead: true,
        readAt: new Date()
      }
    )
    
    res.json({ 
      success: true, 
      message: `Marked ${result.modifiedCount} messages as read` 
    })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

// ============================================
// GET UNREAD COUNT
// ============================================
router.get('/unread/count', protect, async (req: AuthRequest, res: Response) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    })
    res.json({ success: true, count })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

// ============================================
// BLOCK USER
// ============================================
router.post('/block/:userId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params
    
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot block yourself' })
    }
    
    const user = await User.findById(req.user._id)
    const target = await User.findById(userId)
    
    if (!target) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    // Check if already blocked
    if (user.blockedUsers.includes(userId as any)) {
      return res.status(400).json({ success: false, message: 'User already blocked' })
    }
    
    user.blockedUsers.push(userId as any)
    await user.save()
    
    res.json({ success: true, message: 'User blocked successfully' })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

// ============================================
// UNBLOCK USER
// ============================================
router.delete('/block/:userId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params
    const user = await User.findById(req.user._id)
    
    user.blockedUsers = user.blockedUsers.filter(
      (id: any) => id.toString() !== userId
    )
    await user.save()
    
    res.json({ success: true, message: 'User unblocked successfully' })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

// ============================================
// GET BLOCKED USERS (Who I blocked)
// ============================================
router.get('/blocked/list', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).populate('blockedUsers', 'username displayName avatar bio')
    res.json({ success: true, blockedUsers: user.blockedUsers })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

// ============================================
// GET USERS WHO BLOCKED ME
// ============================================
router.get('/blocked-by/list', protect, async (req: AuthRequest, res: Response) => {
  try {
    const myId = req.user._id.toString()
    
    // Find users who have blocked me
    const blockedByUsers = await User.find({
      blockedUsers: { $in: [myId] }
    }).select('_id displayName username avatar bio')
    
    res.json({ 
      success: true, 
      blockedByUsers 
    })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

// ============================================
// GET BLOCK STATUS FOR A SPECIFIC USER
// ============================================
router.get('/block/status/:userId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params
    const myId = req.user._id.toString()
    
    const [blockedByMe, blockedByThem] = await Promise.all([
      User.findOne({ _id: myId, blockedUsers: userId }),
      User.findOne({ _id: userId, blockedUsers: myId })
    ])
    
    res.json({ 
      success: true, 
      isBlocked: !!blockedByMe,
      isBlockedByUser: !!blockedByThem
    })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

export default router