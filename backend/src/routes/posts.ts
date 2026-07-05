import { Router, Response } from 'express'
import Post from '../models/Post'
import Comment from '../models/Comment'
import Like from '../models/Like'
import Bookmark from '../models/Bookmark'
import Notification from '../models/Notification'
import User from '../models/User'
import { protect, AuthRequest } from '../middleware/auth'
import { getPagination } from '../utils/helpers'

const router = Router()

// ============================================
// GET FEED POSTS
// ============================================
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, community, tag } = req.query
    const { skip } = getPagination(Number(page), Number(limit))
    const query: any = {}
    if (community) query.community = community
    if (tag) query.tags = tag
    const posts = await Post.find(query).populate('author', 'username displayName avatar isVerified').populate('community', 'name slug avatar').sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
    const total = await Post.countDocuments(query)
    const likedPosts = await Like.find({ user: req.user._id, targetType: 'Post', target: { $in: posts.map(p => p._id) } }).select('target')
    const likedIds = new Set(likedPosts.map(l => l.target.toString()))
    const bookmarkedPosts = await Bookmark.find({ user: req.user._id, post: { $in: posts.map(p => p._id) } }).select('post')
    const bookmarkedIds = new Set(bookmarkedPosts.map(b => b.post.toString()))
    const data = posts.map(p => ({ 
      ...p.toObject(), 
      isLiked: likedIds.has(p._id.toString()),
      isBookmarked: bookmarkedIds.has(p._id.toString())
    }))
    res.json({ success: true, posts: data, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }) }
})

// ============================================
// SEARCH POSTS - NEW ENDPOINT
// ============================================
router.get('/search', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { q, page = 1, limit = 20 } = req.query
    
    if (!q || typeof q !== 'string') {
      return res.json({ success: true, posts: [], total: 0, page: 1, pages: 0 })
    }
    
    const { skip } = getPagination(Number(page), Number(limit))
    const searchTerm = q.trim()
    
    // Build search query - search in content and tags
    const searchQuery: any = {
      $or: [
        { content: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [searchTerm.toLowerCase()] } },
      ]
    }
    
    // If search starts with #, search specifically for hashtags
    if (searchTerm.startsWith('#')) {
      const tagName = searchTerm.substring(1)
      searchQuery.$or = [
        { tags: { $in: [tagName.toLowerCase()] } },
        { content: { $regex: searchTerm, $options: 'i' } },
      ]
    }
    
    const posts = await Post.find(searchQuery)
      .populate('author', 'username displayName avatar isVerified avatarType banner bannerType')
      .populate('community', 'name slug avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
    
    const total = await Post.countDocuments(searchQuery)
    
    // Get user's liked and bookmarked posts
    const likedPosts = await Like.find({ 
      user: req.user._id, 
      targetType: 'Post', 
      target: { $in: posts.map(p => p._id) } 
    }).select('target')
    const likedIds = new Set(likedPosts.map(l => l.target.toString()))
    
    const bookmarkedPosts = await Bookmark.find({ 
      user: req.user._id, 
      post: { $in: posts.map(p => p._id) } 
    }).select('post')
    const bookmarkedIds = new Set(bookmarkedPosts.map(b => b.post.toString()))
    
    const data = posts.map(p => ({ 
      ...p.toObject(), 
      isLiked: likedIds.has(p._id.toString()),
      isBookmarked: bookmarkedIds.has(p._id.toString())
    }))
    
    res.json({ 
      success: true, 
      posts: data, 
      total, 
      page: Number(page), 
      pages: Math.ceil(total / Number(limit)) 
    })
  } catch (err: any) {
    console.error('Posts search error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// CREATE POST
// ============================================
router.post('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { content, images, tags, community, animeRef, spoilerWarning, isNSFW } = req.body
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content required' })
    
    // Extract mentions from content (@username)
    const mentionRegex = /@(\w+)/g
    const mentions = [...content.matchAll(mentionRegex)].map(m => m[1])
    
    const post = await Post.create({ author: req.user._id, content, images: images || [], tags: tags || [], community, animeRef, spoilerWarning, isNSFW })
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } })
    const populated = await post.populate('author', 'username displayName avatar isVerified')
    
    // Create mention notifications
    if (mentions.length > 0) {
      const mentionedUsers = await User.find({ username: { $in: mentions } })
      for (const mentionedUser of mentionedUsers) {
        if (mentionedUser._id.toString() !== req.user._id.toString()) {
          await Notification.create({
            recipient: mentionedUser._id,
            sender: req.user._id,
            type: 'mention',
            message: `${req.user.displayName || req.user.username} mentioned you in a post`,
            link: `/posts/${post._id}`,
            relatedId: post._id
          })
        }
      }
    }
    
    res.status(201).json({ success: true, post: populated })
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }) }
})

// ============================================
// GET SINGLE POST
// ============================================
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username displayName avatar isVerified bio').populate('community', 'name slug avatar')
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' })
    const liked = await Like.findOne({ user: req.user._id, target: post._id, targetType: 'Post' })
    const bookmarked = await Bookmark.findOne({ user: req.user._id, post: post._id })
    res.json({ success: true, post: { ...post.toObject(), isLiked: !!liked, isBookmarked: !!bookmarked } })
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }) }
})

// ============================================
// DELETE POST
// ============================================
router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' })
    if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin)
      return res.status(403).json({ success: false, message: 'Not authorized' })
    await post.deleteOne()
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: -1 } })
    res.json({ success: true, message: 'Post deleted' })
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }) }
})

// ============================================
// LIKE/UNLIKE POST
// ============================================
router.post('/:id/like', protect, async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' })
    const existing = await Like.findOne({ user: req.user._id, target: post._id, targetType: 'Post' })
    if (existing) {
      await existing.deleteOne()
      await Post.findByIdAndUpdate(post._id, { $inc: { likesCount: -1 } })
      return res.json({ success: true, liked: false })
    }
    await Like.create({ user: req.user._id, target: post._id, targetType: 'Post' })
    await Post.findByIdAndUpdate(post._id, { $inc: { likesCount: 1 } })
    
    // Create notification for post like (don't notify yourself)
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({ 
        recipient: post.author, 
        sender: req.user._id, 
        type: 'like', 
        message: `${req.user.displayName || req.user.username} liked your post`, 
        link: `/posts/${post._id}`,
        relatedId: post._id
      })
    }
    res.json({ success: true, liked: true })
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }) }
})

// ============================================
// BOOKMARK/UNBOOKMARK POST
// ============================================
router.post('/:id/bookmark', protect, async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' })
    
    const existing = await Bookmark.findOne({ user: req.user._id, post: post._id })
    if (existing) {
      await existing.deleteOne()
      return res.json({ success: true, bookmarked: false })
    }
    
    await Bookmark.create({ user: req.user._id, post: post._id })
    res.json({ success: true, bookmarked: true })
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }) }
})

// ============================================
// GET BOOKMARKED POSTS
// ============================================
router.get('/bookmarks/me', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const { skip } = getPagination(Number(page), Number(limit))
    
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate({
        path: 'post',
        populate: {
          path: 'author',
          select: 'username displayName avatar isVerified avatarType banner bannerType _id'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
    
    const posts = bookmarks.map(b => b.post).filter(p => p && p.author)
    const likedPosts = await Like.find({ 
      user: req.user._id, 
      targetType: 'Post', 
      target: { $in: posts.map(p => p._id) } 
    }).select('target')
    const likedIds = new Set(likedPosts.map(l => l.target.toString()))
    
    const data = posts.map(p => ({ 
      ...p.toObject(), 
      isLiked: likedIds.has(p._id.toString()),
      isBookmarked: true
    }))
    
    const total = await Bookmark.countDocuments({ user: req.user._id })
    res.json({ success: true, posts: data, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
  } catch (err: any) {
    console.error('Get bookmarks error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================
// GET COMMENTS FOR POST
// ============================================
router.get('/:id/comments', protect, async (req: AuthRequest, res: Response) => {
  try {
    const comments = await Comment.find({ post: req.params.id, parent: null }).populate('author', 'username displayName avatar isVerified').sort({ createdAt: -1 }).limit(50)
    res.json({ success: true, comments })
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }) }
})

// ============================================
// POST COMMENT ON A POST
// ============================================
router.post('/:id/comments', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { content, parent } = req.body
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content required' })
    
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' })
    
    // Extract mentions from comment content
    const mentionRegex = /@(\w+)/g
    const mentions = [...content.matchAll(mentionRegex)].map(m => m[1])
    
    const comment = await Comment.create({ post: req.params.id, author: req.user._id, content, parent })
    await Post.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } })
    const populated = await comment.populate('author', 'username displayName avatar isVerified')
    
    // 1. Notify post author (if comment is not from post author)
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({ 
        recipient: post.author, 
        sender: req.user._id, 
        type: 'comment', 
        message: `${req.user.displayName || req.user.username} commented on your post: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`, 
        link: `/posts/${post._id}`,
        relatedId: comment._id
      })
    }
    
    // 2. If this is a reply to another comment, notify the parent comment author
    if (parent) {
      const parentComment = await Comment.findById(parent)
      if (parentComment && parentComment.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: parentComment.author,
          sender: req.user._id,
          type: 'reply',
          message: `${req.user.displayName || req.user.username} replied to your comment: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
          link: `/posts/${post._id}`,
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
            message: `${req.user.displayName || req.user.username} mentioned you in a comment`,
            link: `/posts/${post._id}`,
            relatedId: comment._id
          })
        }
      }
    }
    
    res.status(201).json({ success: true, comment: populated })
  } catch (err: any) { 
    res.status(500).json({ success: false, message: err.message }) 
  }
})

export default router