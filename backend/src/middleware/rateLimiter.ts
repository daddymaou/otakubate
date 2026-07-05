import rateLimit from 'express-rate-limit'

// General API rate limiter - 200 requests per minute
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/api/health' || 
           req.path.startsWith('/defaults') || 
           req.path.startsWith('/og') ||
           req.path.startsWith('/api/watchlist')
  },
  keyGenerator: (req) => {
    const userId = (req as any).user?._id?.toString()
    return userId || req.ip || 'unknown'
  }
})

// Auth limiter - 30 requests per minute
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
})

// Anime API limiter - 50 requests per minute
export const animeRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: {
    success: false,
    error: 'Too many anime requests, please slow down.',
    code: 'ANIME_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return !!(req as any).user
  }
})

// Default export for backward compatibility
export default rateLimiter