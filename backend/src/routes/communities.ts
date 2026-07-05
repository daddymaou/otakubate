import express from 'express'
import {
  getCommunities,
  getCommunity,
  createCommunity,
  updateCommunity,
  joinCommunity,
  leaveCommunity,
  deleteCommunity
} from '../controllers/communityController'
import { protect } from '../middleware/auth'

const router = express.Router()

// All routes require auth
router.use(protect)

router.get('/', getCommunities)
router.get('/:slug', getCommunity)
router.post('/', createCommunity)
router.put('/:id', updateCommunity)
router.post('/:id/join', joinCommunity)
router.post('/:id/leave', leaveCommunity)
router.delete('/:id', deleteCommunity)

export default router