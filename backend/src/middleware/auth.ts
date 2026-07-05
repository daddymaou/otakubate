import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

export interface AuthRequest extends Request {
  user?: any
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.accessToken
    
    console.log('🔍 protect - token present:', !!token)
    console.log('🔍 protect - path:', req.path)
    console.log('🔍 protect - method:', req.method)
    
    if (!token) {
      console.log('❌ protect - No token found')
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated. Please login.',
        code: 'NO_TOKEN'
      })
    }
    
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
      console.log('✅ protect - Token verified, userId:', decoded.id)
    } catch (error: any) {
      console.log('❌ protect - JWT Error:', error.name, error.message)
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Session expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        })
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token. Please login again.',
          code: 'INVALID_TOKEN'
        })
      }
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication failed. Please login again.',
        code: 'AUTH_ERROR'
      })
    }
    
    const user = await User.findById(decoded.id).select('-password -otp -otpExpires -verificationToken -verificationOtp -verificationOtpExpires -actionOtp')
    
    if (!user) {
      console.log('❌ protect - User not found:', decoded.id)
      return res.status(401).json({ 
        success: false, 
        message: 'User not found. Please login again.',
        code: 'USER_NOT_FOUND'
      })
    }
    
    if (!user.isActive) {
      console.log('❌ protect - Account inactive:', decoded.id)
      return res.status(403).json({ 
        success: false, 
        message: 'Account is deactivated. Please contact support.',
        code: 'ACCOUNT_INACTIVE'
      })
    }
    
    console.log('✅ protect - User authenticated:', user.username || user._id)
    req.user = user
    next()
  } catch (error) {
    console.error('❌ Auth middleware error:', error)
    res.status(401).json({ 
      success: false, 
      message: 'Authentication failed. Please login again.',
      code: 'AUTH_ERROR'
    })
  }
}

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.accessToken
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        const user = await User.findById(decoded.id).select('-password -otp -otpExpires')
        if (user && user.isActive) {
          req.user = user
        }
      } catch (tokenError) {
        // Token invalid but continue without user
        console.log('Optional auth: Invalid token, continuing without user')
      }
    }
    next()
  } catch (error) {
    // Just continue without user
    next()
  }
}

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required',
      code: 'ADMIN_REQUIRED'
    })
  }
  next()
}