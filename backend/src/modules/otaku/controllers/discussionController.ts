import { Response } from 'express'
import Club from '../models/Club'
import Discussion from '../models/Discussion'
import { AuthRequest } from '../../../middleware/auth'

const ALLOWED_REACTIONS = ['❤️', '🔥', '💀', '✨', '👀']

// ============================================
// CREATE DISCUSSION
// ============================================

export const createDiscussion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { clubId, title, content, image } = req.body
    const userId = req.user?._id

    if (!clubId) {
      res.status(400).json({ success: false, error: 'Club ID required' })
      return
    }

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, error: 'Discussion title required' })
      return
    }

    const club = await Club.findById(clubId)
    if (!club) {
      res.status(404).json({ success: false, error: 'Club not found' })
      return
    }

    const isAdmin = club.admins?.some((a: any) => a.toString() === userId.toString())
    const isOwner = club.ownerId?.toString() === userId.toString()

    if (!isAdmin && !isOwner) {
      res.status(403).json({ success: false, error: 'Only admins can create discussions' })
      return
    }

    const discussion = new Discussion({
      clubId,
      authorId: userId,
      title: title.trim(),
      content: content || '',
      image: image || null,
      reactions: []
    })

    await discussion.save()
    await discussion.populate('authorId', 'username displayName avatar')

    club.discussionsCount = (club.discussionsCount || 0) + 1
    await club.save()

    res.status(201).json({ success: true, discussion })
  } catch (error: any) {
    console.error('Create discussion error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ============================================
// GET CLUB DISCUSSIONS
// ============================================

export const getClubDiscussions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { clubId } = req.params
    const { page = 1, limit = 20 } = req.query

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const club = await Club.findById(clubId)
    if (!club) {
      res.status(404).json({ success: false, error: 'Club not found' })
      return
    }

    const discussions = await Discussion.find({ clubId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate('authorId', 'username displayName avatar')
      .populate({
        path: 'clubId',
        select: 'ownerId admins'
      })
      .lean()

    const total = await Discussion.countDocuments({ clubId })

    res.json({
      success: true,
      discussions,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
        total
      }
    })
  } catch (error: any) {
    console.error('Get discussions error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ============================================
// GET SINGLE DISCUSSION
// ============================================

export const getDiscussion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { discussionId } = req.params

    const discussion = await Discussion.findById(discussionId)
      .populate('authorId', 'username displayName avatar')
      .populate({
        path: 'clubId',
        select: 'ownerId admins'
      })
      .lean()

    if (!discussion) {
      res.status(404).json({ success: false, error: 'Discussion not found' })
      return
    }

    res.json({ success: true, discussion })
  } catch (error: any) {
    console.error('Get discussion error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ============================================
// UPDATE DISCUSSION
// ============================================

export const updateDiscussion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { discussionId } = req.params
    const { title, content, image } = req.body
    const userId = req.user?._id

    const discussion = await Discussion.findById(discussionId)
    if (!discussion) {
      res.status(404).json({ success: false, error: 'Discussion not found' })
      return
    }

    const club = await Club.findById(discussion.clubId)
    if (!club) {
      res.status(404).json({ success: false, error: 'Club not found' })
      return
    }

    const isAdmin = club.admins?.some((a: any) => a.toString() === userId.toString())
    const isOwner = club.ownerId?.toString() === userId.toString()

    if (!isAdmin && !isOwner) {
      res.status(403).json({ success: false, error: 'Only admins can update discussions' })
      return
    }

    if (title !== undefined) discussion.title = title
    if (content !== undefined) discussion.content = content
    if (image !== undefined) discussion.image = image

    await discussion.save()
    await discussion.populate('authorId', 'username displayName avatar')

    res.json({ success: true, discussion })
  } catch (error: any) {
    console.error('Update discussion error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ============================================
// DELETE DISCUSSION
// ============================================

export const deleteDiscussion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { discussionId } = req.params
    const userId = req.user?._id

    console.log('🗑️ Delete discussion request:', { discussionId, userId })

    // 1. Find the discussion
    const discussion = await Discussion.findById(discussionId)
    if (!discussion) {
      console.log('❌ Discussion not found')
      res.status(404).json({ success: false, error: 'Discussion not found' })
      return
    }

    console.log('📋 Discussion found:', {
      title: discussion.title,
      clubId: discussion.clubId,
      authorId: discussion.authorId
    })

    // 2. Get the club
    const club = await Club.findById(discussion.clubId)
    if (!club) {
      console.log('❌ Club not found')
      res.status(404).json({ success: false, error: 'Club not found' })
      return
    }

    // 3. Check permissions
    const isAdmin = club.admins?.some((a: any) => a.toString() === userId.toString())
    const isOwner = club.ownerId?.toString() === userId.toString()
    const isAuthor = discussion.authorId?.toString() === userId.toString()

    console.log('🔍 Permissions:', { isAdmin, isOwner, isAuthor })

    if (!isAdmin && !isOwner && !isAuthor) {
      console.log('❌ User cannot delete this discussion')
      res.status(403).json({ success: false, error: 'You cannot delete this discussion' })
      return
    }

    // 4. Delete the discussion
    await discussion.deleteOne()
    console.log('✅ Discussion deleted')

    // 5. Update club count
    club.discussionsCount = Math.max((club.discussionsCount || 0) - 1, 0)
    await club.save()
    console.log('✅ Club count updated')

    res.json({ success: true, message: 'Discussion deleted successfully' })
  } catch (error: any) {
    console.error('❌ Delete discussion error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ============================================
// ADD REACTION
// ============================================

export const addReaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { discussionId } = req.params
    const { emoji } = req.body
    const userId = req.user?._id

    if (!ALLOWED_REACTIONS.includes(emoji)) {
      res.status(400).json({ success: false, error: 'Invalid emoji' })
      return
    }

    const discussion = await Discussion.findById(discussionId)
    if (!discussion) {
      res.status(404).json({ success: false, error: 'Discussion not found' })
      return
    }

    await Discussion.updateOne(
      { _id: discussionId },
      { $pull: { 'reactions.$[].users': userId } }
    )

    await Discussion.updateOne(
      { _id: discussionId },
      { $push: { reactions: { emoji, users: [userId] } } }
    )

    await Discussion.updateOne(
      { _id: discussionId },
      { $pull: { reactions: { users: { $size: 0 } } } }
    )

    const updatedDiscussion = await Discussion.findById(discussionId)
    res.json({ success: true, reactions: updatedDiscussion?.reactions || [] })

  } catch (error: any) {
    console.error('Add reaction error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ============================================
// REMOVE REACTION
// ============================================

export const removeReaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { discussionId, emoji } = req.params
    const userId = req.user?._id

    await Discussion.updateOne(
      { _id: discussionId },
      { $pull: { 'reactions.$[elem].users': userId } },
      { 
        arrayFilters: [{ 'elem.emoji': emoji }] 
      }
    )

    await Discussion.updateOne(
      { _id: discussionId },
      { $pull: { reactions: { users: { $size: 0 } } } }
    )

    const updatedDiscussion = await Discussion.findById(discussionId)
    res.json({ success: true, reactions: updatedDiscussion?.reactions || [] })

  } catch (error: any) {
    console.error('Remove reaction error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}