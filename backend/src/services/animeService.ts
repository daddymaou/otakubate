import axios from 'axios'
import {
  JikanMedia,
  TransformedAnime,
} from '../types/anime'

const JIKAN_API = 'https://api.jikan.moe/v4'

// ============================================
// TRANSFORM FUNCTIONS
// ============================================

function transformJikanMedia(media: any): TransformedAnime {
  try {
    const image = media.images?.jpg?.large_image_url || media.images?.jpg?.image_url || ''
    const genres = media.genres?.map((g: any) => g.name) || []
    const studios = media.studios?.map((s: any) => s.name) || []
    
    let status = media.status || 'Unknown'
    if (status === 'Finished Airing') status = 'FINISHED'
    else if (status === 'Currently Airing') status = 'RELEASING'
    else if (status === 'Not yet aired') status = 'NOT_YET_RELEASED'

    return {
      id: media.mal_id,
      mal_id: media.mal_id,
      title: media.title || 'Unknown',
      title_english: media.title_english || '',
      title_japanese: media.title_japanese || null,
      title_synonyms: media.title_synonyms || [],
      image: image,
      largeImage: media.images?.jpg?.large_image_url || image,
      banner: null,
      description: media.synopsis || '',
      episodes: media.episodes || 0,
      status: status,
      genres: genres,
      score: media.score || null,
      popularity: media.popularity || 0,
      rank: media.rank || null,
      members: media.members || 0,
      favorites: media.favorites || 0,
      format: media.type || 'TV',
      season: media.season || null,
      year: media.year || null,
      aired: media.aired,
      duration: media.duration || null,
      rating: media.rating || null,
      studios: studios,
      producers: media.producers?.map((p: any) => p.name) || [],
      licensors: media.licensors?.map((l: any) => l.name) || [],
      trailer: media.trailer ? {
        youtube_id: media.trailer.youtube_id,
        url: media.trailer.url,
        embed_url: media.trailer.embed_url
      } : null,
      externalLinks: media.external || [],
      streamingLinks: media.streaming || [],
      relations: media.relations || [],
      characters: media.characters?.data || [],
      recommendations: media.recommendations?.data || []
    }
  } catch (error) {
    console.error('Transform error:', error)
    return null as any
  }
}

// ============================================
// PUBLIC SERVICE METHODS
// ============================================

export async function searchAnime(query: string, page: number = 1, limit: number = 24) {
  try {
    const response = await axios.get(
      `${JIKAN_API}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}&sfw=true`,
      { timeout: 15000 }
    )
    const data = response.data.data || []
    return {
      results: data.map(transformJikanMedia).filter(Boolean),
      pagination: {
        currentPage: page,
        hasNextPage: data.length === limit,
        total: data.length
      }
    }
  } catch (error: any) {
    console.error('Search error:', error.message)
    return {
      results: [],
      pagination: {
        currentPage: page,
        hasNextPage: false,
        total: 0
      }
    }
  }
}

export async function getAnimeDetails(id: number) {
  try {
    const response = await axios.get(
      `${JIKAN_API}/anime/${id}/full`,
      { timeout: 15000 }
    )
    const data = response.data.data
    if (!data) throw new Error('Anime not found')
    return transformJikanMedia(data)
  } catch (error: any) {
    console.error('Details error:', error.message)
    throw error
  }
}

export async function getCategoryAnime(
  filter: string = 'trending',
  page: number = 1,
  limit: number = 24
) {
  try {
    const filterMap: Record<string, string> = {
      'trending': 'bypopularity',
      'top': 'favorite',
      'upcoming': 'upcoming',
      'movies': 'movie',
      'tv': 'tv'
    }

    const jikanFilter = filterMap[filter] || 'bypopularity'
    
    // Different endpoints for different filters
    let endpoint = ''
    if (filter === 'movies') {
      endpoint = `/anime?type=movie&page=${page}&limit=${limit}&order_by=popularity&sort=desc`
    } else if (filter === 'tv') {
      endpoint = `/anime?type=tv&page=${page}&limit=${limit}&order_by=popularity&sort=desc`
    } else {
      endpoint = `/top/anime?filter=${jikanFilter}&page=${page}&limit=${limit}`
    }

    console.log(`📡 Fetching: ${JIKAN_API}${endpoint}`)
    
    const response = await axios.get(
      `${JIKAN_API}${endpoint}`,
      { timeout: 15000 }
    )
    
    const data = response.data.data || []
    console.log(`✅ Found ${data.length} results for filter: ${filter}`)
    
    const transformed = data.map(transformJikanMedia).filter(Boolean)
    
    return {
      results: transformed,
      pagination: {
        currentPage: page,
        hasNextPage: data.length === limit,
        total: data.length
      }
    }
  } catch (error: any) {
    console.error(`❌ Category error (${filter}):`, error.message)
    return {
      results: [],
      pagination: {
        currentPage: page,
        hasNextPage: false,
        total: 0
      }
    }
  }
}

export async function getSeasonalAnime(
  year: number,
  season: string,
  page: number = 1,
  limit: number = 24
) {
  try {
    const seasonMap: Record<string, string> = {
      'winter': 'winter',
      'spring': 'spring',
      'summer': 'summer',
      'fall': 'fall'
    }

    const seasonParam = seasonMap[season.toLowerCase()] || 'winter'
    const response = await axios.get(
      `${JIKAN_API}/seasons/${year}/${seasonParam}?page=${page}&limit=${limit}`,
      { timeout: 15000 }
    )
    const data = response.data.data || []
    
    return {
      results: data.map(transformJikanMedia).filter(Boolean),
      pagination: {
        currentPage: page,
        hasNextPage: data.length === limit,
        total: data.length
      }
    }
  } catch (error: any) {
    console.error('Seasonal error:', error.message)
    return {
      results: [],
      pagination: {
        currentPage: page,
        hasNextPage: false,
        total: 0
      }
    }
  }
}

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

export function getGenres(): string[] {
  return [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
    'Romance', 'Sci-Fi', 'Slice of Life', 'Thriller', 'Mystery',
    'Horror', 'Supernatural', 'Sports', 'Music', 'Mecha',
    'Historical', 'Psychological', 'Seinen', 'Shounen', 'Shoujo',
    'Isekai', 'Magic', 'Martial Arts', 'Military', 'Parody',
    'School', 'Space', 'Vampire', 'Yaoi', 'Yuri'
  ]
}