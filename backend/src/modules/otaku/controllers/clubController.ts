import { Response } from 'express'
import Club from '../models/Club'
import Discussion from '../models/Discussion'
import { AuthRequest } from '../../../middleware/auth'
import slugify from 'slugify'

// ============================================
// CREATE CLUB
// ============================================

export const createClub = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, avatar, banner } = req.body
    const userId = req.user?._id

    console.log('📝 Create club - userId:', userId?.toString())
    console.log('📝 Create club - name:', name)

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, error: 'Club name required' })
      return
    }

    const existing = await Club.findOne({ name: name.trim() })
    if (existing) {
      res.status(400).json({ success: false, error: 'Club name already taken' })
      return
    }

    const slug = slugify(name.trim(), { lower: true, strict: true })

    const club = new Club({
      name: name.trim(),
      slug,
      description: description || '',
      avatar: avatar || '',
      banner: banner || '',
      ownerId: userId,
      admins: [userId],
      members: [userId],
      membersCount: 1,
      discussionsCount: 0
    })

    await club.save()
    console.log('✅ Club created:', club._id.toString())

    res.status(201).json({ 
      success: true, 
      club: {
        ...club.toObject(),
        isAdmin: true,
        isOwner: true,
        isMember: true
      }
    })
  } catch (error: any) {
    console.error('❌ Create club error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ============================================
// GET ALL CLUBS
// ============================================

export const getClubs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query
    const userId = req.user?._id

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const clubs = await Club.find()
      .sort({ membersCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .lean()

    const clubsWithUserStatus = clubs.map(club => ({
      ...club,
      isAdmin: club.admins?.some((a: any) => a.toString() === userId?.toString()) || false,
      isOwner: club.ownerId?.toString() === userId?.toString(),
      isMember: club.members?.some((m: any) => m.toString() === userId?.toString()) || false
    }))

    const total = await Club.countDocuments()

    res.json({
      success: true,
      clubs: clubsWithUserStatus,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
        total
      }
    })
  } catch (error: any) {
    console.error('Get clubs error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ============================================
// GET RANDOM CLUBS
// ============================================

export const getRandomClubs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 6 } = req.query
    const userId = req.user?._id

    const clubs = await Club.aggregate([
      { $sample: { size: parseInt(limit as string) } }
    ])

    const clubsWithUserStatus = clubs.map(club => ({
      ...club,
      isAdmin: club.admins?.some((a: any) => a.toString() === userId?.toString()) || false,
      isOwner: club.ownerId?.toString() === userId?.toString(),
      isMember: club.members?.some((m: any) => m.toString() === userId?.toString()) || false
    }))

    res.json({
      success: true,
      clubs: clubsWithUserStatus
    })
  } catch (error: any) {
    console.error('Get random clubs error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ============================================
// GET SINGLE CLUB
// ============================================

export const getClub = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params
    const userId = req.user?._id

    const club = await Club.findOne({ slug }).lean()

    if (!club) {
      res.status(404).json({ success: false, error: 'Club not found' })
      return
    }

    const clubWithUserStatus = {
      ...club,
      isAdmin: club.admins?.some((a: any) => a.toString() === userId?.toString()) || false,
      isOwner: club.ownerId?.toString() === userId?.toString(),
      isMember: club.members?.some((m: any) => m.toString() === userId?.toString()) || false
    }

    res.json({ success: true, club: clubWithUserStatus })
  } catch (error: any) {
    console.error('Get club error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ============================================
// UPDATE CLUB
// ============================================

export const updateClub = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, description, avatar, banner } = req.body
    const userId = req.user?._id

    const club = await Club.findById(id)
    if (!club) {
      res.status(404).json({ success: false, error: 'Club not found' })
      return
    }

    const isOwner = club.ownerId?.toString() === userId?.toString()
    const isAdmin = club.admins?.some((a: any) => a.toString() === userId?.toString())

    if (!isOwner && !isAdmin) {
      res.status(403).json({ success: false, error: 'Only admins can update club' })
      return
    }

    if (name && name.trim()) {
      const existing = await Club.findOne({ name: name.trim(), _id: { $ne: id } })
      if (existing) {
        res.status(400).json({ success: false, error: 'Club name already taken' })
        return
      }
      club.name = name.trim()
      club.slug = slugify(name.trim(), { lower: true, strict: true })
    }

    if (description !== undefined) club.description = description
    if (avatar !== undefined) club.avatar = avatar
    if (banner !== undefined) club.banner = banner

    await club.save()

    res.json({ 
      success: true, 
      club: {
        ...club.toObject(),
        isAdmin: isAdmin || isOwner,
        isOwner,
        isMember: true
      }
    })
  } catch (error: any) {
    console.error('Update club error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ============================================
// DELETE CLUB
// ============================================

export const deleteClub = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user?._id

    console.log('🗑️ Delete club request:', { 
      clubId: id, 
      userId: userId?.toString(),
      userEmail: req.user?.email 
    })

    const club = await Club.findById(id)
    if (!club) {
      console.log('❌ Club not found:', id)
      res.status(404).json({ success: false, error: 'Club not found' })
      return
    }

    console.log('📋 Club found:', { 
      name: club.name, 
      ownerId: club.ownerId?.toString(),
      currentUserId: userId?.toString(),
      isOwner: club.ownerId?.toString() === userId?.toString()
    })

    const isOwner = club.ownerId?.toString() === userId?.toString()
    if (!isOwner) {
      console.log('❌ User is not the owner')
      res.status(403).json({ success: false, error: 'Only the owner can delete this club' })
      return
    }

    // Delete all discussions
    await Discussion.deleteMany({ clubId: id })
    console.log('✅ Discussions deleted')

    // Delete the club
    await club.deleteOne()
    console.log('✅ Club deleted')

    res.json({ success: true, message: 'Club deleted successfully' })
  } catch (error: any) {
    console.error('❌ Delete club error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ============================================
// GET CLUB MEMBERS
// ============================================

export const getClubMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const club = await Club.findById(id)
      .populate('members', 'username displayName avatar')
      .populate('admins', 'username displayName avatar')
      .populate('ownerId', 'username displayName avatar')
      .lean()

    if (!club) {
      res.status(404).json({ success: false, error: 'Club not found' })
      return
    }

    res.json({ 
      success: true, 
      members: club.members || [],
      admins: club.admins || [],
      owner: club.ownerId
    })
  } catch (error: any) {
    console.error('Get members error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ============================================
// JOIN CLUB
// ============================================

export const joinClub = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user?._id

    console.log('🔍 joinClub - userId:', userId?.toString())
    console.log('🔍 joinClub - clubId:', id)

    if (!userId) {
      console.log('❌ joinClub - No user ID')
      res.status(401).json({ success: false, error: 'Not authenticated' })
      return
    }

    const club = await Club.findById(id)
    if (!club) {
      console.log('❌ joinClub - Club not found:', id)
      res.status(404).json({ success: false, error: 'Club not found' })
      return
    }

    console.log('📋 joinClub - Club found:', club.name)

    if (club.members?.some((m: any) => m.toString() === userId.toString())) {
      console.log('❌ joinClub - Already a member')
      res.status(400).json({ success: false, error: 'Already a member' })
      return
    }

    club.members.push(userId)
    club.membersCount = club.members.length
    await club.save()

    console.log('✅ joinClub - Joined successfully')
    res.json({ success: true, message: 'Joined club successfully' })
  } catch (error: any) {
    console.error('❌ Join club error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ============================================
// LEAVE CLUB
// ============================================

export const leaveClub = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user?._id

    console.log('🔍 leaveClub - userId:', userId?.toString())
    console.log('🔍 leaveClub - clubId:', id)

    if (!userId) {
      res.status(401).json({ success: false, error: 'Not authenticated' })
      return
    }

    const club = await Club.findById(id)
    if (!club) {
      res.status(404).json({ success: false, error: 'Club not found' })
      return
    }

    if (club.ownerId?.toString() === userId.toString()) {
      console.log('❌ leaveClub - Owner cannot leave')
      res.status(400).json({ success: false, error: 'Owner cannot leave their own club' })
      return
    }

    club.members = club.members?.filter((m: any) => m.toString() !== userId.toString()) || []
    club.membersCount = club.members.length
    await club.save()

    club.admins = club.admins?.filter((a: any) => a.toString() !== userId.toString()) || []
    await club.save()

    console.log('✅ leaveClub - Left successfully')
    res.json({ success: true, message: 'Left club successfully' })
  } catch (error: any) {
    console.error('❌ Leave club error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ============================================
// PROMOTE TO ADMIN (Owner only)
// ============================================

export const promoteToAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, userId } = req.params
    const ownerId = req.user?._id

    const club = await Club.findById(id)
    if (!club) {
      res.status(404).json({ success: false, error: 'Club not found' })
      return
    }

    if (club.ownerId?.toString() !== ownerId?.toString()) {
      res.status(403).json({ success: false, error: 'Only the owner can promote members' })
      return
    }

    if (club.admins?.some((a: any) => a.toString() === userId)) {
      res.status(400).json({ success: false, error: 'User is already an admin' })
      return
    }

    if (!club.members?.some((m: any) => m.toString() === userId)) {
      res.status(400).json({ success: false, error: 'User is not a member of this club' })
      return
    }

    club.admins.push(userId as any)
    await club.save()

    res.json({ success: true, message: 'User promoted to admin' })
  } catch (error: any) {
    console.error('Promote error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ============================================
// DEMOTE FROM ADMIN (Owner only)
// ============================================

export const demoteFromAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, userId } = req.params
    const ownerId = req.user?._id

    const club = await Club.findById(id)
    if (!club) {
      res.status(404).json({ success: false, error: 'Club not found' })
      return
    }

    if (club.ownerId?.toString() !== ownerId?.toString()) {
      res.status(403).json({ success: false, error: 'Only the owner can demote admins' })
      return
    }

    if (club.ownerId?.toString() === userId) {
      res.status(400).json({ success: false, error: 'Cannot demote the owner' })
      return
    }

    club.admins = club.admins?.filter((a: any) => a.toString() !== userId) || []
    await club.save()

    res.json({ success: true, message: 'User demoted from admin' })
  } catch (error: any) {
    console.error('Demote error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ============================================
// TRANSFER OWNERSHIP (Owner only)
// ============================================

export const transferOwnership = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, userId } = req.params
    const ownerId = req.user?._id

    const club = await Club.findById(id)
    if (!club) {
      res.status(404).json({ success: false, error: 'Club not found' })
      return
    }

    if (club.ownerId?.toString() !== ownerId?.toString()) {
      res.status(403).json({ success: false, error: 'Only the owner can transfer ownership' })
      return
    }

    if (!club.members?.some((m: any) => m.toString() === userId)) {
      res.status(400).json({ success: false, error: 'User is not a member of this club' })
      return
    }

    club.ownerId = userId as any
    if (!club.admins?.some((a: any) => a.toString() === userId)) {
      club.admins.push(userId as any)
    }
    await club.save()

    res.json({ success: true, message: 'Ownership transferred successfully' })
  } catch (error: any) {
    console.error('Transfer ownership error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}