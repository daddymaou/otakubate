import api from './api'

// ============================================
// API FUNCTIONS (Calls Backend -> Jikan)
// ============================================

// ============================================
// SEARCH ANIME
// ============================================

export async function searchAnime(query: string, page: number = 1) {
  try {
    const response = await api.get('/anime/search', {
      params: {
        q: query,
        page: page,
        limit: 24
      }
    })

    const data = response.data

    return {
      results: data.results || [],
      pageInfo: {
        currentPage: data.pagination?.currentPage || page,
        hasNextPage: data.pagination?.hasNextPage || false,
        total: data.pagination?.total || 0
      }
    }
  } catch (error) {
    console.error('Search error:', error)
    throw error
  }
}

// ============================================
// GET ANIME DETAILS
// ============================================

export async function getAnimeDetails(id: string | number) {
  try {
    const response = await api.get(`/anime/details/${id}`)
    return response.data.anime
  } catch (error) {
    console.error('Details error:', error)
    throw error
  }
}

// ============================================
// GET CATEGORY ANIME (Trending, Top, etc.)
// ============================================

export async function getCategoryAnime(category: string, page: number = 1) {
  try {
    const response = await api.get('/anime/category', {
      params: {
        filter: category,
        page: page,
        limit: 24
      }
    })

    const data = response.data

    return {
      results: data.results || [],
      pageInfo: {
        currentPage: data.pagination?.currentPage || page,
        hasNextPage: data.pagination?.hasNextPage || false,
        total: data.pagination?.total || 0
      }
    }
  } catch (error) {
    console.error('Category error:', error)
    throw error
  }
}

// ============================================
// GET SEASONAL ANIME
// ============================================

export async function getSeasonalAnime(year: number, season: string, page: number = 1) {
  try {
    const response = await api.get('/anime/seasonal', {
      params: {
        year: year,
        season: season,
        page: page,
        limit: 24
      }
    })

    const data = response.data

    return {
      results: data.results || [],
      pageInfo: {
        currentPage: data.pagination?.currentPage || page,
        hasNextPage: data.pagination?.hasNextPage || false,
        total: data.pagination?.total || 0
      }
    }
  } catch (error) {
    console.error('Seasonal error:', error)
    throw error
  }
}

// ============================================
// GET CURRENT SEASON
// ============================================

export function getCurrentSeason() {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  
  let season = 'winter'
  if (month >= 3 && month <= 5) season = 'spring'
  else if (month >= 6 && month <= 8) season = 'summer'
  else if (month >= 9 && month <= 11) season = 'fall'
  else season = 'winter'
  
  return { season, year }
}

// ============================================
// GET ANIME GENRES
// ============================================

export async function getGenres() {
  try {
    const response = await api.get('/anime/genres')
    return response.data.genres || []
  } catch (error) {
    console.error('Genres error:', error)
    return []
  }
}

// ============================================
// GET CURRENT SEASON FROM BACKEND
// ============================================

export async function getCurrentSeasonFromBackend() {
  try {
    const response = await api.get('/anime/current-season')
    return response.data
  } catch (error) {
    console.error('Current season error:', error)
    return getCurrentSeason()
  }
}