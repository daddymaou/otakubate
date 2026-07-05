import { Response } from 'express'
import Club from '../models/Club'
import Discussion from '../models/Discussion'
import { AuthRequest } from '../../../middleware/auth'

const ALLOWED_REACTIONS = ['❤️', '🔥', '💀', '✨', '👀']

// ============================================
// CREATE DISCUSSION
// ============================================

export const createDiscussion = async (req: AuthRequest, res: Response) => {
  try {
    const { clubId, title, content, image } = req.body
    const userId = req.user?._id

    if (!clubId) {
      return res.status(400).json({ success: false, error: 'Club ID required' })
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Discussion title required' })
    }

    const club = await Club.findById(clubId)
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' })
    }

    const isAdmin = club.admins?.some((a: any) => a.toString() === userId.toString())
    const isOwner = club.ownerId?.toString() === userId.toString()

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, error: 'Only admins can create discussions' })
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

export const getClubDiscussions = async (req: AuthRequest, res: Response) => {
  try {
    const { clubId } = req.params
    const { page = 1, limit = 20 } = req.query

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const club = await Club.findById(clubId)
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' })
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

export const getDiscussion = async (req: AuthRequest, res: Response) => {
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
      return res.status(404).json({ success: false, error: 'Discussion not found' })
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

export const updateDiscussion = async (req: AuthRequest, res: Response) => {
  try {
    const { discussionId } = req.params
    const { title, content, image } = req.body
    const userId = req.user?._id

    const discussion = await Discussion.findById(discussionId)
    if (!discussion) {
      return res.status(404).json({ success: false, error: 'Discussion not found' })
    }

    const club = await Club.findById(discussion.clubId)
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' })
    }

    const isAdmin = club.admins?.some((a: any) => a.toString() === userId.toString())
    const isOwner = club.ownerId?.toString() === userId.toString()

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, error: 'Only admins can update discussions' })
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
// DELETE DISCUSSION - FIXED
// ============================================

export const deleteDiscussion = async (req: AuthRequest, res: Response) => {
  try {
    const { discussionId } = req.params
    const userId = req.user?._id

    console.log('🗑️ Delete discussion request:', { discussionId, userId })

    // 1. Find the discussion
    const discussion = await Discussion.findById(discussionId)
    if (!discussion) {
      console.log('❌ Discussion not found')
      return res.status(404).json({ success: false, error: 'Discussion not found' })
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
      return res.status(404).json({ success: false, error: 'Club not found' })
    }

    // 3. Check permissions
    const isAdmin = club.admins?.some((a: any) => a.toString() === userId.toString())
    const isOwner = club.ownerId?.toString() === userId.toString()
    const isAuthor = discussion.authorId?.toString() === userId.toString()

    console.log('🔍 Permissions:', { isAdmin, isOwner, isAuthor })

    if (!isAdmin && !isOwner && !isAuthor) {
      console.log('❌ User cannot delete this discussion')
      return res.status(403).json({ success: false, error: 'You cannot delete this discussion' })
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

export const addReaction = async (req: AuthRequest, res: Response) => {
  try {
    const { discussionId } = req.params
    const { emoji } = req.body
    const userId = req.user?._id

    if (!ALLOWED_REACTIONS.includes(emoji)) {
      return res.status(400).json({ success: false, error: 'Invalid emoji' })
    }

    const discussion = await Discussion.findById(discussionId)
    if (!discussion) {
      return res.status(404).json({ success: false, error: 'Discussion not found' })
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

export const removeReaction = async (req: AuthRequest, res: Response) => {
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