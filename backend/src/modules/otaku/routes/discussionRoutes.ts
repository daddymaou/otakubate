import express from 'express'
import {
  createDiscussion,
  getClubDiscussions,
  getDiscussion,
  updateDiscussion,
  deleteDiscussion,
  addReaction,
  removeReaction
} from '../controllers/discussionController'
import { protect } from '../../../middleware/auth'
import { isClubAdmin, isClubMember } from '../middleware/clubAuth'

const router = express.Router()

// All routes require authentication
router.use(protect)

// ============================================
// DISCUSSION CRUD
// ============================================

// Create discussion (Admin/Owner only)
router.post('/', isClubAdmin, createDiscussion)

// Get all discussions for a club
router.get('/club/:clubId', getClubDiscussions)

// Get single discussion
router.get('/:discussionId', getDiscussion)

// Update discussion (Admin/Owner only)
router.put('/:discussionId', isClubAdmin, updateDiscussion)

// DELETE discussion - Controller handles permissions
router.delete('/:discussionId', protect, deleteDiscussion)

// ============================================
// REACTIONS (Anyone can react - no membership required)
// ============================================
router.post('/:discussionId/reactions', isClubMember, addReaction)
router.delete('/:discussionId/reactions/:emoji', isClubMember, removeReaction)

export default router