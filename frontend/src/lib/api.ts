import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

// ✅ DIRECT: Use Render URL directly
const API_BASE_URL = 'https://otakubate.onrender.com/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
})

// Request interceptor - Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    config.headers['Cache-Control'] = 'no-cache'
    return config
  },
  (error) => {
    console.error('📡 Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Flag to prevent multiple refresh token calls
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
  config: any
}> = []

const processQueue = (error: any | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.config.headers.Authorization = `Bearer ${token}`
      prom.resolve(api(prom.config))
    }
  })
  failedQueue = []
}

// Response interceptor - Handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Prevent infinite loops
    if (originalRequest._retry) {
      return Promise.reject(error)
    }
    
    // Don't treat network errors as auth errors
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
      console.log('🔴 Network error - not an auth issue')
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your connection.'
      })
    }
    
    // ===== FIX: Handle 403 with verification check =====
    if (error.response?.status === 403) {
      const errorData = error.response?.data
      
      // If it's a verification required error, DON'T logout
      if (errorData?.requiresVerification) {
        console.log('🔴 Email verification required - not logging out')
        return Promise.reject(error)
      }
      
      // Only logout for real forbidden errors (suspended account, etc.)
      console.log('🔴 403 Forbidden, logging out')
      useAuthStore.getState().logoutAndRedirect()
      return Promise.reject(error)
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (!refreshToken) {
        console.log('🔴 No refresh token, logging out')
        useAuthStore.getState().logoutAndRedirect()
        return Promise.reject(error)
      }
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest })
        })
      }
      
      originalRequest._retry = true
      isRefreshing = true
      
      try {
        // ✅ Use the same base URL for refresh
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { timeout: 5000 }
        )
        
        if (data.success && data.token) {
          localStorage.setItem('token', data.token)
          if (data.user) {
            useAuthStore.getState().refreshSession(data.token, data.user)
          }
          processQueue(null, data.token)
          originalRequest.headers.Authorization = `Bearer ${data.token}`
          return api(originalRequest)
        } else {
          throw new Error('Refresh failed')
        }
      } catch (refreshError) {
        console.log('🔴 Token refresh failed, logging out')
        processQueue(refreshError, null)
        useAuthStore.getState().logoutAndRedirect()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    return Promise.reject(error)
  }
)

export default api