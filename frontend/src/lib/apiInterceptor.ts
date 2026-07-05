import api from './api'
import { toast } from 'react-hot-toast'

// ============================================
// REQUEST QUEUE - Prevents duplicate requests
// ============================================
const pendingRequests = new Map<string, Promise<any>>()

// ============================================
// CACHE - Simple in-memory cache
// ============================================
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60000 // 60 seconds default

// ============================================
// RATE LIMIT TRACKING
// ============================================
const requestTimestamps: number[] = []
const MAX_REQUESTS_PER_SECOND = 15 // Increased from 10
const RATE_LIMIT_WINDOW = 1000 // 1 second

// ============================================
// GENERATE CACHE KEY
// ============================================
const getCacheKey = (url: string, params?: any) => {
  return `${url}${params ? JSON.stringify(params) : ''}`
}

// ============================================
// CHECK IF REQUEST SHOULD BE CACHED
// ============================================
const shouldCache = (url: string) => {
  const cacheableEndpoints = [
    '/users/',
    '/posts',
    '/notifications',
    '/messages/conversations',
    '/communities',
    '/anime'
  ]
  return cacheableEndpoints.some(endpoint => url.includes(endpoint))
}

// ============================================
// GET CACHE TTL FOR SPECIFIC ENDPOINTS
// ============================================
const getCacheTTL = (url: string) => {
  if (url.includes('/users/')) return 120000 // 2 minutes for user data
  if (url.includes('/posts')) return 60000 // 1 minute for posts
  if (url.includes('/notifications')) return 30000 // 30 seconds for notifications
  if (url.includes('/messages')) return 30000 // 30 seconds for messages
  if (url.includes('/watchlist')) return 300000 // 5 minutes for watchlist
  return CACHE_TTL
}

// ============================================
// RATE LIMIT CHECK
// ============================================
const checkRateLimit = () => {
  const now = Date.now()
  // Remove old timestamps
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_LIMIT_WINDOW) {
    requestTimestamps.shift()
  }
  
  if (requestTimestamps.length >= MAX_REQUESTS_PER_SECOND) {
    return false
  }
  
  requestTimestamps.push(now)
  return true
}

// ============================================
// MAIN API INTERCEPTOR
// ============================================
export const setupApiInterceptor = () => {
  
  // ============================================
  // REQUEST INTERCEPTOR
  // ============================================
  api.interceptors.request.use(
    async (config) => {
      // Skip rate limiting for certain endpoints
      const skipRateLimit = [
        '/auth/me',
        '/auth/login',
        '/auth/register',
        '/auth/verify-otp',
        '/health'
      ]
      
      if (skipRateLimit.some(endpoint => config.url?.includes(endpoint))) {
        return config
      }
      
      // Check rate limit
      if (!checkRateLimit()) {
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, 500))
        return config
      }
      
      // Check if this is a duplicate request
      const requestKey = `${config.method}:${config.url}`
      
      if (pendingRequests.has(requestKey)) {
        // Return existing promise if duplicate
        return pendingRequests.get(requestKey)
      }
      
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // ============================================
  // RESPONSE INTERCEPTOR
  // ============================================
  api.interceptors.response.use(
    (response) => {
      const requestKey = `${response.config.method}:${response.config.url}`
      
      // Remove from pending requests
      if (pendingRequests.has(requestKey)) {
        pendingRequests.delete(requestKey)
      }
      
      // Cache GET requests
      if (response.config.method === 'get' && shouldCache(response.config.url || '')) {
        const cacheKey = getCacheKey(response.config.url || '', response.config.params)
        const ttl = getCacheTTL(response.config.url || '')
        cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now() + ttl
        })
      }
      
      return response
    },
    (error) => {
      // Handle rate limiting errors - SILENT FAIL, NO TOAST
      if (error.response?.status === 429) {
        console.warn('⏳ Rate limited, using cached data if available')
        
        // Try to get from cache
        const cacheKey = getCacheKey(error.config?.url || '', error.config?.params)
        const cached = cache.get(cacheKey)
        
        if (cached && cached.timestamp > Date.now()) {
          // Return cached data
          return Promise.resolve({
            data: cached.data,
            status: 200,
            statusText: 'OK (cached)',
            headers: {},
            config: error.config,
            request: {}
          })
        }
        
        // NO TOAST - just reject and let the hook handle it
        return Promise.reject(error)
      }
      
      // Remove from pending requests
      if (error.config) {
        const requestKey = `${error.config.method}:${error.config.url}`
        if (pendingRequests.has(requestKey)) {
          pendingRequests.delete(requestKey)
        }
      }
      
      return Promise.reject(error)
    }
  )
}

// ============================================
// CLEAR CACHE
// ============================================
export const clearApiCache = () => {
  cache.clear()
  console.log('🗑️ API cache cleared')
}

// ============================================
// CLEAR SPECIFIC CACHE
// ============================================
export const clearApiCacheByPrefix = (prefix: string) => {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key)
    }
  }
}

// ============================================
// GET CACHE SIZE
// ============================================
export const getApiCacheSize = () => {
  return cache.size
}

// ============================================
// INVALIDATE CACHE BY URL
// ============================================
export const invalidateCache = (url: string) => {
  for (const [key, value] of cache) {
    if (key.includes(url)) {
      cache.delete(key)
    }
  }
}

export default api