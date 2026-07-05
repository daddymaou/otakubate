import { Response, NextFunction } from 'express'
import Club from '../models/Club'
import Discussion from '../models/Discussion'
import { AuthRequest } from '../../../middleware/auth'

export const isClubAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id
    let clubId = req.params.id || req.params.clubId || req.body.clubId || req.query.clubId

    console.log('🔍 isClubAdmin - userId:', userId?.toString())
    console.log('🔍 isClubAdmin - clubId from params:', clubId)

    const discussionId = req.params.discussionId || req.params.id
    console.log('🔍 isClubAdmin - discussionId:', discussionId)
    
    if (!clubId && discussionId) {
      const discussion = await Discussion.findById(discussionId)
      console.log('🔍 isClubAdmin - discussion found:', !!discussion)
      if (discussion) {
        clubId = discussion.clubId?.toString()
        console.log('🔍 isClubAdmin - clubId from discussion:', clubId)
      }
    }

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' })
    }

    if (!clubId) {
      console.log('❌ isClubAdmin - No club ID found')
      return res.status(400).json({ success: false, error: 'Club ID required' })
    }

    const club = await Club.findById(clubId)
    if (!club) {
      console.log('❌ isClubAdmin - Club not found:', clubId)
      return res.status(404).json({ success: false, error: 'Club not found' })
    }

    const isAdmin = club.admins?.some((a: any) => a.toString() === userId.toString())
    const isOwner = club.ownerId?.toString() === userId.toString()

    console.log('🔍 isClubAdmin - isAdmin:', isAdmin, 'isOwner:', isOwner)

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only admins can perform this action' 
      })
    }

    req.club = club
    next()
  } catch (error: any) {
    console.error('Club admin auth error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

export const isClubOwner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id
    let clubId = req.params.id || req.params.clubId || req.body.clubId

    console.log('🔍 isClubOwner - userId:', userId?.toString())
    console.log('🔍 isClubOwner - clubId:', clubId)

    const discussionId = req.params.discussionId || req.params.id
    if (!clubId && discussionId) {
      const discussion = await Discussion.findById(discussionId)
      if (discussion) {
        clubId = discussion.clubId?.toString()
      }
    }

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' })
    }

    if (!clubId) {
      console.log('❌ isClubOwner - No club ID')
      return res.status(400).json({ success: false, error: 'Club ID required' })
    }

    const club = await Club.findById(clubId)
    if (!club) {
      console.log('❌ isClubOwner - Club not found:', clubId)
      return res.status(404).json({ success: false, error: 'Club not found' })
    }

    const isOwner = club.ownerId?.toString() === userId.toString()

    console.log('🔍 isClubOwner - isOwner:', isOwner)

    if (!isOwner) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only the owner can perform this action' 
      })
    }

    req.club = club
    next()
  } catch (error: any) {
    console.error('Club owner auth error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

export const isClubMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id

    console.log('🔍 isClubMember - userId:', userId?.toString())

    if (!userId) {
      console.log('❌ isClubMember - No user ID')
      return res.status(401).json({ success: false, error: 'Not authenticated' })
    }

    let clubId = null

    if (req.params.id) clubId = req.params.id
    if (req.params.clubId) clubId = req.params.clubId
    
    if (req.params.discussionId) {
      const discussion = await Discussion.findById(req.params.discussionId)
      if (discussion) {
        clubId = discussion.clubId?.toString()
      } else {
        return res.status(404).json({ success: false, error: 'Discussion not found' })
      }
    }
    
    if (!clubId && req.body.clubId) {
      clubId = req.body.clubId
    }

    if (!clubId && req.path) {
      const match = req.path.match(/\/discussions\/([^\/]+)\/reactions/)
      if (match && match[1]) {
        const discussion = await Discussion.findById(match[1])
        if (discussion) {
          clubId = discussion.clubId?.toString()
        } else {
          return res.status(404).json({ success: false, error: 'Discussion not found' })
        }
      }
    }

    if (!clubId) {
      console.log('❌ isClubMember - No club ID found')
      return res.status(400).json({ success: false, error: 'Club ID required' })
    }

    const club = await Club.findById(clubId)
    if (!club) {
      console.log('❌ isClubMember - Club not found:', clubId)
      return res.status(404).json({ success: false, error: 'Club not found' })
    }

    console.log('✅ isClubMember - Club found:', club.name)

    req.club = club
    next()

  } catch (error: any) {
    console.error('Club member auth error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}