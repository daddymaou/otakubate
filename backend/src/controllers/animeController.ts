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

export const search = async (req: Request, res: Response) => {
  try {
    const { q, page = '1', limit = '24' } = req.query

    if (!q) {
      return res.status(400).json({ success: false, error: 'Search query required' })
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

export const details = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid anime ID' 
      })
    }

    const anime = await getAnimeDetails(parseInt(id))
    
    if (!anime) {
      return res.status(404).json({ 
        success: false, 
        error: 'Anime not found' 
      })
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

export const category = async (req: Request, res: Response) => {
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

export const seasonal = async (req: Request, res: Response) => {
  try {
    const { year, season, page = '1', limit = '24' } = req.query

    if (!year || !season) {
      return res.status(400).json({ success: false, error: 'Year and season required' })
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

export const currentSeason = (req: Request, res: Response) => {
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

export const genres = (req: Request, res: Response) => {
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