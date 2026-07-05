import { Request, Response } from 'express'
import {
  searchAnime,
  getAnimeDetails,
  getCategoryAnime,
  getSeasonalAnime,
  getCurrentSeason,
  getGenres
} from '../services/animeService'

// ============================================
// SEARCH ANIME
// ============================================

export const search = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, page = '1', limit = '24' } = req.query

    if (!q) {
      res.status(400).json({ success: false, error: 'Search query required' })
      return
    }

    const result = await searchAnime(
      q as string,
      parseInt(page as string),
      parseInt(limit as string)
    )

    res.json({
      success: true,
      ...result
    })
  } catch (error: any) {
    console.error('Search error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to search anime',
      details: error.message 
    })
  }
}

// ============================================
// GET ANIME DETAILS
// ============================================

export const details = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    
    // ✅ FIX: Convert id to string if it's an array
    const animeId = Array.isArray(id) ? id[0] : id
    
    if (!animeId || isNaN(parseInt(animeId))) {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid anime ID' 
      })
      return
    }

    const anime = await getAnimeDetails(parseInt(animeId))
    
    if (!anime) {
      res.status(404).json({ 
        success: false, 
        error: 'Anime not found' 
      })
      return
    }

    res.json({
      success: true,
      anime
    })
  } catch (error: any) {
    console.error('Details error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get anime details',
      details: error.message 
    })
  }
}

// ============================================
// GET CATEGORY ANIME
// ============================================

export const category = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filter = 'trending', page = '1', limit = '24' } = req.query

    const result = await getCategoryAnime(
      filter as string,
      parseInt(page as string),
      parseInt(limit as string)
    )

    res.json({
      success: true,
      ...result
    })
  } catch (error: any) {
    console.error('Category error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get category anime',
      details: error.message 
    })
  }
}

// ============================================
// GET SEASONAL ANIME
// ============================================

export const seasonal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, season, page = '1', limit = '24' } = req.query

    if (!year || !season) {
      res.status(400).json({ success: false, error: 'Year and season required' })
      return
    }

    const result = await getSeasonalAnime(
      parseInt(year as string),
      season as string,
      parseInt(page as string),
      parseInt(limit as string)
    )

    res.json({
      success: true,
      ...result
    })
  } catch (error: any) {
    console.error('Seasonal error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get seasonal anime',
      details: error.message 
    })
  }
}

// ============================================
// GET CURRENT SEASON
// ============================================

export const currentSeason = (req: Request, res: Response): void => {
  try {
    const result = getCurrentSeason()
    res.json({
      success: true,
      ...result
    })
  } catch (error: any) {
    console.error('Current season error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get current season',
      details: error.message 
    })
  }
}

// ============================================
// GET GENRES
// ============================================

export const genres = (req: Request, res: Response): void => {
  try {
    const genresList = getGenres()
    res.json({
      success: true,
      genres: genresList
    })
  } catch (error: any) {
    console.error('Genres error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get genres',
      details: error.message 
    })
  }
}