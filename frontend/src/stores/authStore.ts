import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { disconnectSocket } from '../lib/socket'

interface User {
  _id: string
  username: string
  email: string
  displayName: string
  avatar: string
  banner: string
  bio: string
  isAdmin: boolean
  isPremium: boolean
  isVerified: boolean
  emailVerified: boolean
  followersCount: number
  followingCount: number
  postsCount: number
  favoriteAnime: string[]
  favoriteGenres: string[]
  avatarType: 'default' | 'custom'
  bannerType: 'default' | 'custom'
  gender?: string
  pronouns?: string
  location?: string
  website?: string
  notificationSettings?: {
    newFollowers?: boolean
    postLikes?: boolean
    comments?: boolean
    mentions?: boolean
    directMessages?: boolean
    emailNotifications?: boolean
    pushNotifications?: boolean
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isSessionExpired: boolean
  setAuth: (user: User, token: string, refreshToken?: string) => void
  login: (user: User, token: string) => void
  logout: (redirect?: boolean) => void
  logoutAndRedirect: () => void
  updateUser: (user: Partial<User>) => void
  setLoading: (loading: boolean) => void
  setSessionExpired: (expired: boolean) => void
  refreshSession: (token: string, user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      isSessionExpired: false,
      
      setAuth: (user: User, token: string, refreshToken?: string) => {
        console.log('🔐 setAuth called - User:', user.username)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }
        localStorage.setItem('token', token)
        set({ user, token, isLoading: false, isSessionExpired: false })
      },
      
      login: (user: User, token: string) => {
        console.log('🔐 login called - User:', user.username)
        localStorage.setItem('token', token)
        set({ user, token, isLoading: false, isSessionExpired: false })
      },
      
      logout: (redirect = false) => {
        console.log('🚪 Logout called')
        
        // 🔌 Disconnect socket on logout
        disconnectSocket()
        
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        set({ user: null, token: null, isLoading: false, isSessionExpired: false })
        
        if (redirect) {
          window.location.href = '/login'
        }
      },
      
      logoutAndRedirect: () => {
        console.log('🚪 Logout and redirect called')
        
        // 🔌 Disconnect socket on logout
        disconnectSocket()
        
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        set({ user: null, token: null, isLoading: false, isSessionExpired: true })
        
        setTimeout(() => {
          window.location.href = '/login?session=expired'
        }, 100)
      },
      
      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        }))
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
      
      setSessionExpired: (expired: boolean) => {
        set({ isSessionExpired: expired })
      },
      
      refreshSession: (token: string, user: User) => {
        console.log('🔄 Session refreshed')
        localStorage.setItem('token', token)
        set({ user, token, isSessionExpired: false, isLoading: false })
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage), 
    }
  )
)