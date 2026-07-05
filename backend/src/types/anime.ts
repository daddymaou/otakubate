// ============================================
// JIKAN API TYPES
// ============================================

export interface JikanImages {
  jpg: {
    image_url: string
    small_image_url: string
    large_image_url: string
  }
  webp: {
    image_url: string
    small_image_url: string
    large_image_url: string
  }
}

export interface JikanTitle {
  type: string
  title: string
}

export interface JikanDate {
  year: number | null
  month: number | null
  day: number | null
}

export interface JikanAired {
  from: string | null
  to: string | null
  prop: {
    from: {
      day: number | null
      month: number | null
      year: number | null
    }
    to: {
      day: number | null
      month: number | null
      year: number | null
    }
  }
  string: string
}

export interface JikanGenre {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface JikanStudio {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface JikanProducer {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface JikanLicensor {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface JikanTheme {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface JikanDemographic {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface JikanRelation {
  relation: string
  entry: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
}

export interface JikanExternalLink {
  name: string
  url: string
}

export interface JikanStreamingLink {
  name: string
  url: string
}

export interface JikanCharacter {
  character: {
    mal_id: number
    url: string
    images: {
      jpg: {
        image_url: string
      }
      webp: {
        image_url: string
        small_image_url: string
      }
    }
    name: string
  }
  role: string
  voice_actors: Array<{
    person: {
      mal_id: number
      url: string
      images: {
        jpg: {
          image_url: string
        }
      }
      name: string
    }
    language: string
  }>
}

export interface JikanRecommendation {
  entry: {
    mal_id: number
    url: string
    images: {
      jpg: {
        image_url: string
      }
      webp: {
        image_url: string
      }
    }
    title: string
  }
  votes: number
}

// ============================================
// JIKAN MEDIA RESPONSE
// ============================================

export interface JikanMedia {
  mal_id: number
  url: string
  images: JikanImages
  trailer: {
    youtube_id: string | null
    url: string | null
    embed_url: string | null
    images: {
      image_url: string | null
      small_image_url: string | null
      medium_image_url: string | null
      large_image_url: string | null
      maximum_image_url: string | null
    } | null
  } | null
  approved: boolean
  titles: JikanTitle[]
  title: string
  title_english: string | null
  title_japanese: string | null
  title_synonyms: string[]
  type: string | null
  source: string | null
  episodes: number | null
  status: string | null
  airing: boolean
  aired: JikanAired
  duration: string | null
  rating: string | null
  score: number | null
  scored_by: number | null
  rank: number | null
  popularity: number | null
  members: number | null
  favorites: number | null
  synopsis: string | null
  background: string | null
  season: string | null
  year: number | null
  broadcast: {
    day: string | null
    time: string | null
    timezone: string | null
    string: string | null
  } | null
  producers: JikanProducer[]
  licensors: JikanLicensor[]
  studios: JikanStudio[]
  genres: JikanGenre[]
  explicit_genres: JikanGenre[]
  themes: JikanTheme[]
  demographics: JikanDemographic[]
  relations?: JikanRelation[]
  characters?: {
    data: JikanCharacter[]
  }
  recommendations?: {
    data: JikanRecommendation[]
  }
  external?: JikanExternalLink[]
  streaming?: JikanStreamingLink[]
}

// ============================================
// JIKAN API RESPONSE WRAPPER
// ============================================

export interface JikanResponse<T> {
  data: T
  pagination?: {
    last_visible_page: number
    has_next_page: boolean
    current_page: number
    items: {
      count: number
      total: number
      per_page: number
    }
  }
}

// ============================================
// TRANSFORMED ANIME (Frontend Format)
// ============================================

export interface TransformedAnime {
  id: number
  mal_id: number
  title: string
  title_english: string
  title_japanese: string | null
  title_synonyms: string[]
  image: string
  largeImage: string
  banner: string | null
  description: string
  episodes: number
  status: string
  genres: string[]
  score: number | null
  popularity: number
  rank: number | null
  members: number
  favorites: number
  format: string
  season: string | null
  year: number | null
  aired: JikanAired
  duration: string | null
  rating: string | null
  studios: string[]
  producers: string[]
  licensors: string[]
  trailer: {
    youtube_id: string | null
    url: string | null
    embed_url: string | null
  } | null
  externalLinks: JikanExternalLink[]
  streamingLinks: JikanStreamingLink[]
  relations?: JikanRelation[]
  characters?: JikanCharacter[]
  recommendations?: JikanRecommendation[]
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface AnimeListResponse {
  success: boolean
  results: TransformedAnime[]
  pagination: {
    currentPage: number
    hasNextPage: boolean
    total: number
    lastPage: number
  }
}

export interface AnimeDetailResponse {
  success: boolean
  anime: TransformedAnime
}

export interface AnimeGenresResponse {
  success: boolean
  genres: string[]
}

export interface CurrentSeasonResponse {
  success: boolean
  season: string
  year: number
}

// ============================================
// REQUEST QUERY TYPES
// ============================================

export interface SearchAnimeQuery {
  q: string
  page?: number
  limit?: number
}

export interface CategoryAnimeQuery {
  filter?: 'airing' | 'upcoming' | 'bypopularity' | 'favorite'
  page?: number
  limit?: number
}

export interface SeasonalAnimeQuery {
  year: number
  season: 'winter' | 'spring' | 'summer' | 'fall'
  page?: number
  limit?: number
}

// ============================================
// WATCHLIST TYPES
// ============================================

export interface WatchlistItem {
  userId: string
  animeId: number
  title: string
  image: string
  status: 'watching' | 'planning' | 'completed' | 'dropped' | 'on_hold'
  score: number | null
  progress: number
  addedAt: Date
}

export interface WatchlistStats {
  total: number
  watching: number
  planning: number
  completed: number
  dropped: number
  on_hold: number
}