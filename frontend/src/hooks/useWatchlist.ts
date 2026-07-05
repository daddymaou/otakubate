import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '../lib/api'

interface WatchlistItem {
  _id?: string
  id?: string
  userId: string
  animeId: number
  title: string
  image: string
  status: 'watching' | 'planning' | 'completed' | 'dropped' | 'on_hold'
  score: number | null
  progress: number
  addedAt: string
  createdAt?: string
  updatedAt?: string
}

interface WatchlistCache {
  items: WatchlistItem[]
  stats: {
    total: number
    watching: number
    planning: number
    completed: number
    dropped: number
    on_hold: number
  }
  timestamp: number
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const FETCH_COOLDOWN = 10000 // 10 seconds between fetches

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    watching: 0,
    planning: 0,
    completed: 0,
    dropped: 0,
    on_hold: 0
  })
  
  const lastFetchRef = useRef<number>(0)
  const isFetchingRef = useRef<boolean>(false)

  // Load from cache on mount, then fetch fresh
  useEffect(() => {
    // Try to load from cache immediately
    const cached = getCachedWatchlist()
    if (cached) {
      setWatchlist(cached.items)
      setStats(cached.stats)
      setLoading(false)
    }
    
    // Then fetch fresh data
    loadWatchlist()
  }, [])

  // ============================================
  // CACHE HELPERS
  // ============================================

  const getCachedWatchlist = (): WatchlistCache | null => {
    try {
      const cached = localStorage.getItem('watchlist_cache')
      if (!cached) return null
      
      const parsed: WatchlistCache = JSON.parse(cached)
      // Check if cache is still valid (5 minutes)
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        return parsed
      }
      return null
    } catch (e) {
      return null
    }
  }

  const updateCache = (items: WatchlistItem[], statsData: typeof stats) => {
    try {
      const cache: WatchlistCache = {
        items,
        stats: statsData,
        timestamp: Date.now()
      }
      localStorage.setItem('watchlist_cache', JSON.stringify(cache))
    } catch (e) {
      // Ignore cache errors
    }
  }

  // ============================================
  // CALCULATE STATS FROM ITEMS
  // ============================================

  const calculateStats = (items: WatchlistItem[]) => {
    return {
      total: items.length,
      watching: items.filter(i => i.status === 'watching').length,
      planning: items.filter(i => i.status === 'planning').length,
      completed: items.filter(i => i.status === 'completed').length,
      dropped: items.filter(i => i.status === 'dropped').length,
      on_hold: items.filter(i => i.status === 'on_hold').length
    }
  }

  // ============================================
  // MAIN LOAD FUNCTION
  // ============================================

  const loadWatchlist = async (force: boolean = false) => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) return
    
    // Cooldown check - don't fetch if we fetched recently
    if (!force && Date.now() - lastFetchRef.current < FETCH_COOLDOWN) {
      console.log('⏳ Skipping watchlist fetch (cooldown)')
      return
    }

    isFetchingRef.current = true
    
    try {
      setLoading(true)
      lastFetchRef.current = Date.now()
      
      const response = await api.get('/watchlist')
      
      if (response.data.success) {
        const items = response.data.items || []
        setWatchlist(items)
        
        // Calculate stats from items (no separate API call)
        const statsData = calculateStats(items)
        setStats(statsData)
        
        // Update cache
        updateCache(items, statsData)
      }
    } catch (error: any) {
      // SILENT FAIL - no toast for 429 or any errors
      if (error.response?.status === 429) {
        console.warn('⏳ Rate limited, using cached data')
        // Use cached data if available
        const cached = getCachedWatchlist()
        if (cached) {
          setWatchlist(cached.items)
          setStats(cached.stats)
        }
      } else {
        console.error('Failed to load watchlist:', error)
        // Only show toast for non-429 errors that aren't initial load
        if (watchlist.length === 0) {
          // Try cached data as fallback
          const cached = getCachedWatchlist()
          if (cached) {
            setWatchlist(cached.items)
            setStats(cached.stats)
          }
        }
      }
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }

  // ============================================
  // ADD TO WATCHLIST
  // ============================================

  const addToWatchlist = async (anime: { id: number; title: string; image: string; status?: string }) => {
    // Check if already in watchlist
    if (watchlist.some(item => item.animeId === anime.id)) {
      toast('Already in watchlist', { icon: '📚' })
      return false
    }

    try {
      const response = await api.post('/watchlist', {
        animeId: anime.id,
        title: anime.title,
        image: anime.image,
        status: anime.status || 'planning'
      })

      if (response.data.success) {
        const newItem = response.data.item
        const updatedItems = [newItem, ...watchlist]
        setWatchlist(updatedItems)
        
        const updatedStats = calculateStats(updatedItems)
        setStats(updatedStats)
        updateCache(updatedItems, updatedStats)
        
        toast.success('Added to watchlist!', { icon: '📚' })
        return true
      }
      return false
    } catch (error: any) {
      console.error('Add to watchlist error:', error)
      // Only show toast for non-429 errors
      if (error.response?.status !== 429) {
        toast.error(error.response?.data?.error || 'Failed to add to watchlist')
      }
      return false
    }
  }

  // ============================================
  // REMOVE FROM WATCHLIST
  // ============================================

  const removeFromWatchlist = async (animeId: number) => {
    try {
      const response = await api.delete(`/watchlist/${animeId}`)
      
      if (response.data.success) {
        const updatedItems = watchlist.filter(item => item.animeId !== animeId)
        setWatchlist(updatedItems)
        
        const updatedStats = calculateStats(updatedItems)
        setStats(updatedStats)
        updateCache(updatedItems, updatedStats)
        
        toast.success('Removed from watchlist')
        return true
      }
      return false
    } catch (error: any) {
      console.error('Remove from watchlist error:', error)
      if (error.response?.status !== 429) {
        toast.error(error.response?.data?.error || 'Failed to remove from watchlist')
      }
      return false
    }
  }

  // ============================================
  // UPDATE WATCHLIST ITEM
  // ============================================

  const updateWatchlistItem = async (animeId: number, updates: { status?: string; score?: number; progress?: number }) => {
    try {
      const response = await api.put(`/watchlist/${animeId}`, updates)
      
      if (response.data.success) {
        const updatedItem = response.data.item
        const updatedItems = watchlist.map(item => 
          item.animeId === animeId ? updatedItem : item
        )
        setWatchlist(updatedItems)
        
        const updatedStats = calculateStats(updatedItems)
        setStats(updatedStats)
        updateCache(updatedItems, updatedStats)
        
        toast.success('Watchlist updated')
        return true
      }
      return false
    } catch (error: any) {
      console.error('Update watchlist error:', error)
      if (error.response?.status !== 429) {
        toast.error(error.response?.data?.error || 'Failed to update watchlist')
      }
      return false
    }
  }

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const isInWatchlist = (animeId: number) => {
    return watchlist.some(item => item.animeId === animeId)
  }

  const getWatchlistItem = (animeId: number) => {
    return watchlist.find(item => item.animeId === animeId)
  }

  const refresh = () => {
    loadWatchlist(true)
  }

  return {
    watchlist,
    loading,
    stats,
    addToWatchlist,
    removeFromWatchlist,
    updateWatchlistItem,
    isInWatchlist,
    getWatchlistItem,
    refresh
  }
}