import express, { Response } from 'express'
import Watchlist from '../models/Watchlist'
import { protect, AuthRequest } from '../middleware/auth'

const router = express.Router()

// ============================================
// GET: User's watchlist
// ============================================

router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query
    const filter: { userId: string; status?: string } = {
      userId: req.user._id
    }

    if (status) {
      filter.status = status as string
    }

    const items = await Watchlist.find(filter).sort({ addedAt: -1 })

    res.json({
      success: true,
      items,
      count: items.length
    })
  } catch (error: any) {
    console.error('Get watchlist error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============================================
// GET: Check if anime is in watchlist
// ============================================

router.get('/check/:animeId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { animeId } = req.params

    const item = await Watchlist.findOne({
      userId: req.user._id,
      animeId: parseInt(animeId)
    })

    res.json({
      success: true,
      inWatchlist: !!item,
      item: item || null
    })
  } catch (error: any) {
    console.error('Check watchlist error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============================================
// POST: Add to watchlist
// ============================================

router.post('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { animeId, title, image, status = 'planning', score, progress } = req.body

    if (!animeId || !title) {
      return res.status(400).json({
        success: false,
        error: 'Anime ID and title are required'
      })
    }

    // Check if already exists
    const existing = await Watchlist.findOne({
      userId: req.user._id,
      animeId: parseInt(animeId)
    })

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Anime already in watchlist',
        item: existing
      })
    }

    const watchlistItem = new Watchlist({
      userId: req.user._id,
      animeId: parseInt(animeId),
      title,
      image: image || '',
      status,
      score: score || null,
      progress: progress || 0
    })

    await watchlistItem.save()

    res.status(201).json({
      success: true,
      item: watchlistItem,
      message: 'Added to watchlist'
    })
  } catch (error: any) {
    console.error('Add to watchlist error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============================================
// PUT: Update watchlist item
// ============================================

router.put('/:animeId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { animeId } = req.params
    const { status, score, progress } = req.body

    const item = await Watchlist.findOne({
      userId: req.user._id,
      animeId: parseInt(animeId)
    })

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in watchlist'
      })
    }

    if (status) item.status = status
    if (score !== undefined) item.score = score
    if (progress !== undefined) item.progress = progress

    await item.save()

    res.json({
      success: true,
      item,
      message: 'Watchlist updated'
    })
  } catch (error: any) {
    console.error('Update watchlist error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============================================
// DELETE: Remove from watchlist
// ============================================

router.delete('/:animeId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { animeId } = req.params

    const result = await Watchlist.findOneAndDelete({
      userId: req.user._id,
      animeId: parseInt(animeId)
    })

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in watchlist'
      })
    }

    res.json({
      success: true,
      message: 'Removed from watchlist'
    })
  } catch (error: any) {
    console.error('Remove from watchlist error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============================================
// GET: Watchlist stats
// ============================================

router.get('/stats', protect, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await Watchlist.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const statsObj = {
      total: 0,
      watching: 0,
      planning: 0,
      completed: 0,
      dropped: 0,
      on_hold: 0
    }

    stats.forEach(stat => {
      const key = stat._id as keyof typeof statsObj
      statsObj[key] = stat.count
      statsObj.total += stat.count
    })

    res.json({
      success: true,
      stats: statsObj
    })
  } catch (error: any) {
    console.error('Watchlist stats error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router