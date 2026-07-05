import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import api from './lib/api'
import { setupApiInterceptor } from './lib/apiInterceptor'
import { connectSocket, disconnectSocket } from './lib/socket'
import AppLayout from './components/layout/AppLayout'
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyOTP from './pages/auth/VerifyOTP'
import ForgotPassword from './pages/auth/ForgotPassword'
import GoogleCallback from './pages/auth/GoogleCallback'
import Feed from './pages/Feed'
import Explore from './pages/Explore'
import Profile from './pages/Profile'
import Followers from './pages/Followers'
import Following from './pages/Following'
import ProfileCustomization from './pages/ProfileCustomization'
import Messages from './pages/Messages'
import MessageInbox from './pages/MessageInbox'
import Notifications from './pages/Notifications'
import PostDetail from './pages/PostDetail'
import Settings from './pages/Settings'
import PrivacySecurity from './pages/PrivacySecurity'
import NotificationSettings from './pages/NotificationSettings'
import LegalCookies from './pages/LegalCookies'
import HelpSupport from './pages/HelpSupport'
import AdminPanel from './pages/AdminPanel'
import AnimeSearch from './pages/AnimeSearch'
import Watchlist from './pages/Watchlist'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import Spinner from './components/ui/Spinner'
import toast from 'react-hot-toast'

// ============================================
// OTAKU MODULE IMPORTS
// ============================================
import { OtakuHub, ClubFeed, DiscussionDetail } from './modules/otaku'

// ============================================
// ROUTE GUARDS
// ============================================

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF8EE' }}>
        <Spinner size={48} />
      </div>
    )
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF8EE' }}>
        <Spinner size={48} />
      </div>
    )
  }
  
  return !user ? <>{children}</> : <Navigate to="/feed" replace />
}

// ============================================
// MAIN APP
// ============================================

export default function App() {
  const { setAuth, setLoading, isLoading, user } = useAuthStore()
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    setupApiInterceptor()
    console.log('🛡️ API interceptor initialized')
  }, [])

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token')
      console.log('🔍 App loading - Token:', token ? `${token.substring(0, 30)}...` : 'NO TOKEN')
      
      if (!token) {
        console.log('❌ No token found, skipping user load')
        setLoading(false)
        setInitialLoad(false)
        return
      }

      try {
        console.log('📡 Fetching user data from /auth/me')
        const response = await api.get('/auth/me')
        console.log('✅ /auth/me response:', response.data)
        
        if (response.data.success && response.data.user) {
          console.log('✅ Setting user in store:', response.data.user.username)
          setAuth(response.data.user, token)
          
          if (response.data.user._id) {
            console.log('🔌 Connecting socket for user:', response.data.user._id)
            connectSocket(response.data.user._id)
          }
        } else {
          console.log('⚠️ No user in response or success false')
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          if (!initialLoad) {
            toast.error('Session expired. Please login again.')
          }
        }
      } catch (error: any) {
        console.error('❌ Failed to load user:', error.response?.status, error.response?.data)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        if (!initialLoad && error.response?.status !== 401) {
          toast.error('Failed to load user data. Please refresh the page.')
        }
      } finally {
        setLoading(false)
        setInitialLoad(false)
      }
    }

    loadUser()

    return () => {
      disconnectSocket()
    }
  }, [setAuth, setLoading])

  useEffect(() => {
    if (user?._id) {
      console.log('🔌 User detected, ensuring socket connection')
      connectSocket(user._id)
    } else {
      disconnectSocket()
    }
  }, [user])

  if (initialLoad && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF8EE' }}>
        <Spinner size={48} />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ========== PUBLIC ROUTES ========== */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/verify-otp" element={<PublicRoute><VerifyOTP /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        
        {/* ========== PROTECTED ROUTES (with sidebar) ========== */}
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          {/* Social Feed */}
          <Route path="/feed" element={<Feed />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          
          {/* Direct Messages */}
          <Route path="/messages" element={<MessageInbox />} />
          <Route path="/messages/:userId" element={<Messages />} />
          
          {/* Notifications */}
          <Route path="/notifications" element={<Notifications />} />
          
          {/* Profile */}
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/profile/:username/followers" element={<Followers />} />
          <Route path="/profile/:username/following" element={<Following />} />
          <Route path="/profile/customize" element={<ProfileCustomization />} />
          
          {/* Settings */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/privacy-security" element={<PrivacySecurity />} />
          <Route path="/notification-settings" element={<NotificationSettings />} />
          <Route path="/legal-cookies" element={<LegalCookies />} />
          <Route path="/help-support" element={<HelpSupport />} />
          
          {/* 🎬 ANIME DISCOVERY HUB */}
          <Route path="/anime" element={<AnimeSearch />} />
          
          {/* 📚 WATCHLIST */}
          <Route path="/watchlist" element={<Watchlist />} />
          
          {/* 🎌 OTAKU HUB - Anime Clubs */}
          <Route path="/clubs" element={<OtakuHub />} />
          <Route path="/clubs/:slug" element={<ClubFeed />} />
          <Route path="/clubs/:slug/discussion/:discussionId" element={<DiscussionDetail />} />
          
          {/* Admin */}
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
        
        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}