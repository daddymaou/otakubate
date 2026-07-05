// frontend/src/services/animeService.ts

const API_BASE = '/api/anime'

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  if (!title) return ''
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Search anime using Jikan
 * GET /api/anime/jikan/search?q=Naruto&page=1
 */
export async function searchAnime(query: string, page: number = 1) {
  try {
    const res = await fetch(`${API_BASE}/jikan/search?q=${encodeURIComponent(query)}&page=${page}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    
    if (data.success) {
      return {
        results: data.results || [],
        currentPage: data.pagination?.currentPage || page,
        hasNextPage: data.pagination?.hasNextPage || false
      }
    }
    return { results: [], currentPage: 1, hasNextPage: false }
  } catch (error) {
    console.error('[animeService] searchAnime error:', error)
    return { results: [], currentPage: 1, hasNextPage: false }
  }
}

/**
 * Get Jikan category (trending, top, upcoming, movies)
 * GET /api/anime/jikan/category?filter=airing&page=1
 */
export async function fetchCategory(filter: string, page: number = 1) {
  try {
    const res = await fetch(`${API_BASE}/jikan/category?filter=${filter}&page=${page}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    
    if (data.success) {
      return {
        results: data.results || [],
        currentPage: data.pagination?.currentPage || page,
        hasNextPage: data.pagination?.hasNextPage || false
      }
    }
    return { results: [], currentPage: 1, hasNextPage: false }
  } catch (error) {
    console.error('[animeService] fetchCategory error:', error)
    return { results: [], currentPage: 1, hasNextPage: false }
  }
}

/**
 * Get anime details by ID
 * GET /api/anime/jikan/details/:id
 */
export async function getAnimeDetails(id: string) {
  try {
    const res = await fetch(`${API_BASE}/jikan/details/${id}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.success ? data.anime : null
  } catch (error) {
    console.error('[animeService] getAnimeDetails error:', error)
    return null
  }
}

/**
 * Get episode links from download API
 * GET /api/anime/download/links/:animeTitle/:episode
 */
export async function getEpisodeLinks(animeTitle: string, episode: number) {
  try {
    const slug = generateSlug(animeTitle)
    const res = await fetch(`${API_BASE}/download/links/${slug}/${episode}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('[animeService] getEpisodeLinks error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Get extracted download links (actual video URLs)
 * GET /api/anime/download/extracted/:animeTitle/:episode?type=SUB
 */
export async function getExtractedDownloadLinks(animeTitle: string, episode: number, type: 'SUB' | 'DUB' = 'SUB') {
  try {
    const slug = generateSlug(animeTitle)
    const res = await fetch(`${API_BASE}/download/extracted/${slug}/${episode}?type=${type}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('[animeService] getExtractedDownloadLinks error:', error)
    return { success: false, links: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Get only PDrain download link for an episode
 * GET /api/anime/download/pdrain/:animeTitle/:episode?type=SUB
 */
export async function getPDrainLink(animeTitle: string, episode: number, type: 'SUB' | 'DUB' = 'SUB') {
  try {
    const slug = generateSlug(animeTitle)
    const res = await fetch(`${API_BASE}/download/extracted/${slug}/${episode}?type=${type}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    
    if (data.success && data.links) {
      // Find PDrain link
      const pdrain = data.links.find((link: any) => 
        link.server === 'PDrain' && link.success && link.downloadUrl
      )
      if (pdrain) {
        return { success: true, downloadUrl: pdrain.downloadUrl, server: 'PDrain' }
      }
    }
    return { success: false, error: 'No PDrain link found' }
  } catch (error) {
    console.error('[animeService] getPDrainLink error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}