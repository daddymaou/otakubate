import { Router, Response } from 'express'
import Comment from '../models/Comment'
import Like from '../models/Like'
import Notification from '../models/Notification'
import Post from '../models/Post'
import { protect, AuthRequest } from '../middleware/auth'

const router = Router()

// Get comments for a post (with replies) - Oldest first
router.get('/post/:postId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const comments = await Comment.find({ 
      post: req.params.postId, 
      parent: null 
    })
      .populate('author', 'username displayName avatar isVerified')
      .sort({ createdAt: 1 }) // Oldest first
      .lean()
    
    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parent: comment._id })
          .populate('author', 'username displayName avatar isVerified')
          .sort({ createdAt: 1 })
          .lean()
        
        // Check if user liked each comment
        const allCommentIds = [comment._id, ...replies.map(r => r._id)]
        const likedComments = await Like.find({ 
          user: req.user._id, 
          target: { $in: allCommentIds },
          targetType: 'Comment'
        }).select('target')
        const likedIds = new Set(likedComments.map(l => l.target.toString()))
        
        return {
          ...comment,
          isLiked: likedIds.has(comment._id.toString()),
          replies: replies.map(reply => ({
            ...reply,
            isLiked: likedIds.has(reply._id.toString())
          }))
        }
      })
    )
    
    res.json({ success: true, comments: commentsWithReplies })
  } catch (err: any) {
    console.error('Get comments error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// Create comment or reply (UPDATED with mention support)
router.post('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { content, postId, parentId } = req.body
    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Content required' })
    }
    
    // Extract mentions from content (@username)
    const mentionRegex = /@(\w+)/g
    const mentions = [...content.matchAll(mentionRegex)].map(m => m[1])
    
    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content: content.trim(),
      parent: parentId || null
    })
    
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } })
    
    const populated = await comment.populate('author', 'username displayName avatar isVerified')
    const post = await Post.findById(postId)
    
    // 1. Notify post author (if not self and not a reply)
    if (post && post.author.toString() !== req.user._id.toString() && !parentId) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        message: `${req.user.displayName || req.user.username} commented on your post: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        link: `/posts/${postId}`,
        relatedId: comment._id
      })
    }
    
    // 2. If this is a reply to another comment, notify the parent comment author
    if (parentId) {
      const parentComment = await Comment.findById(parentId)
      if (parentComment && parentComment.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: parentComment.author,
          sender: req.user._id,
          type: 'reply',
          message: `${req.user.displayName || req.user.username} replied to your comment: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
          link: `/posts/${postId}`,
          relatedId: comment._id
        })
      }
    }
    
    // 3. Create mention notifications for users mentioned in comment
    if (mentions.length > 0) {
      const mentionedUsers = await User.find({ username: { $in: mentions } })
      for (const mentionedUser of mentionedUsers) {
        if (mentionedUser._id.toString() !== req.user._id.toString()) {
          await Notification.create({
            recipient: mentionedUser._id,
            sender: req.user._id,
            type: 'mention',
            message: `${req.user.displayName || req.user.username} mentioned you in a comment: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
            link: `/posts/${postId}`,
            relatedId: comment._id
          })
        }
      }
    }
    
    res.status(201).json({ success: true, comment: populated })
  } catch (err: any) {
    console.error('Create comment error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// Edit comment (only author)
router.put('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' })
    }
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the comment author can edit' })
    }
    
    comment.content = req.body.content.trim()
    comment.isEdited = true
    await comment.save()
    
    const populated = await comment.populate('author', 'username displayName avatar isVerified')
    res.json({ success: true, comment: populated })
  } catch (err: any) {
    console.error('Edit comment error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// Delete comment (author OR post owner can delete)
router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' })
    }
    
    const post = await Post.findById(comment.post)
    const isAuthor = comment.author.toString() === req.user._id.toString()
    const isPostOwner = post && post.author.toString() === req.user._id.toString()
    
    if (!isAuthor && !isPostOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' })
    }
    
    // Delete all replies if deleting a parent comment
    await Comment.deleteMany({ parent: comment._id })
    await Comment.findByIdAndDelete(comment._id)
    await Like.deleteMany({ target: comment._id, targetType: 'Comment' })
    
    // Update comment count on post
    const remainingComments = await Comment.countDocuments({ post: comment.post })
    await Post.findByIdAndUpdate(comment.post, { commentsCount: remainingComments })
    
    res.json({ success: true, message: 'Comment deleted' })
  } catch (err: any) {
    console.error('Delete comment error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// Like/unlike comment (UPDATED with notification)
router.post('/:id/like', protect, async (req: AuthRequest, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' })
    }
    
    const existing = await Like.findOne({ 
      user: req.user._id, 
      target: comment._id, 
      targetType: 'Comment' 
    })
    
    if (existing) {
      await existing.deleteOne()
      await Comment.findByIdAndUpdate(comment._id, { $inc: { likesCount: -1 } })
      return res.json({ success: true, liked: false })
    }
    
    await Like.create({ user: req.user._id, target: comment._id, targetType: 'Comment' })
    await Comment.findByIdAndUpdate(comment._id, { $inc: { likesCount: 1 } })
    
    // 🔥 NEW: Create notification for comment like (don't notify yourself)
    if (comment.author.toString() !== req.user._id.toString()) {
      const post = await Post.findById(comment.post)
      await Notification.create({
        recipient: comment.author,
        sender: req.user._id,
        type: 'like',
        message: `${req.user.displayName || req.user.username} liked your comment: "${comment.content.substring(0, 40)}${comment.content.length > 40 ? '...' : ''}"`,
        link: `/posts/${comment.post}`,
        relatedId: comment._id
      })
    }
    
    res.json({ success: true, liked: true })
  } catch (err: any) {
    console.error('Like comment error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router