import express from 'express'
import {
  search,
  details,
  category,
  seasonal,
  currentSeason,
  genres
} from '../controllers/animeController'

const router = express.Router()

// ============================================
// ANIME ROUTES
// ============================================

// Search
router.get('/search', search)

// Get anime details by ID
router.get('/details/:id', details)

// Get category anime (trending, top, upcoming, movies, tv)
router.get('/category', category)

// Get seasonal anime
router.get('/seasonal', seasonal)

// Get current season info
router.get('/current-season', currentSeason)

// Get all genres
router.get('/genres', genres)

export default router