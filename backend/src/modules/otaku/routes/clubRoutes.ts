import express from 'express'
import {
  createClub,
  getClubs,
  getRandomClubs,
  getClub,
  updateClub,
  deleteClub,
  getClubMembers,
  joinClub,
  leaveClub,
  promoteToAdmin,
  demoteFromAdmin,
  transferOwnership
} from '../controllers/clubController'
import { protect } from '../../../middleware/auth'
import { isClubAdmin, isClubOwner } from '../middleware/clubAuth'

const router = express.Router()

// Public routes (with auth for user status)
router.get('/', protect, getClubs)
router.get('/random', protect, getRandomClubs)
router.get('/:slug', protect, getClub)

// Membership routes
router.post('/:id/join', protect, joinClub)
router.post('/:id/leave', protect, leaveClub)

// Members list - anyone can view (button hidden from non-members)
router.get('/:id/members', protect, getClubMembers)  // ← REMOVED isClubAdmin

// Admin routes (Admin/Owner only)
router.put('/:id', protect, isClubAdmin, updateClub)

// Owner routes (Owner only)
router.delete('/:id', protect, isClubOwner, deleteClub)
router.post('/:id/promote/:userId', protect, isClubOwner, promoteToAdmin)
router.post('/:id/demote/:userId', protect, isClubOwner, demoteFromAdmin)
router.post('/:id/transfer/:userId', protect, isClubOwner, transferOwnership)

// Create club (any authenticated user)
router.post('/', protect, createClub)

export default router