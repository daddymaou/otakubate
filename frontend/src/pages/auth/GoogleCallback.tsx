import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function GoogleCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAuth } = useAuthStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    const refreshToken = searchParams.get('refreshToken')
    const errorParam = searchParams.get('error')

    console.log('🔐 Google Callback - Token:', token ? 'Present' : 'Missing')
    console.log('🔐 Google Callback - Error:', errorParam)

    if (errorParam) {
      setError(errorParam === 'google_not_configured' 
        ? 'Google Sign-In is not configured yet. Please use email login.'
        : 'Google Sign-In failed. Please try again.')
      toast.error(errorParam === 'google_not_configured' 
        ? 'Google Sign-In not configured' 
        : 'Google login failed')
      setTimeout(() => navigate('/login'), 2000)
      return
    }

    if (token && refreshToken) {
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      
      console.log('✅ Token saved, fetching user data...')
      
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          console.log('📡 /me response status:', res.status)
          return res.json()
        })
        .then(data => {
          console.log('📡 /me response data:', data)
          if (data.success && data.user) {
            console.log('✅ Setting user in store:', data.user.username)
            setAuth(data.user, token, refreshToken)
            toast.success('Logged in with Google!')
            navigate('/feed')
          } else {
            console.error('❌ No user in response:', data)
            throw new Error('Failed to get user data')
          }
        })
        .catch(err => {
          console.error('❌ Google login error:', err)
          toast.error('Failed to load user data. Please try logging in again.')
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          navigate('/login')
        })
    } else if (!token && !errorParam) {
      console.error('❌ No token and no error, something went wrong')
      toast.error('Google login failed. Please try again.')
      navigate('/login')
    }
  }, [searchParams, navigate, setAuth])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #FFF8EE 0%, #FFE8E8 100%)' }}>
        <div className="text-center max-w-sm w-full rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(230,57,70,0.08)' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(230,57,70,0.1)' }}>
            <svg className="w-10 h-10" fill="none" stroke="#E63946" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#1a1a2e' }}>Login Failed</h2>
          <p className="text-sm mb-6" style={{ color: '#666' }}>{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{ background: '#1a1a2e', color: '#fff' }}
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFF8EE 0%, #FFE8E8 100%)' }}>
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] to-[#FF6B7A] rounded-full animate-pulse opacity-30" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#E63946] to-[#FF6B7A] flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>
        <h2 className="text-lg font-semibold mb-1" style={{ color: '#1a1a2e' }}>Completing sign in...</h2>
        <p className="text-sm" style={{ color: '#999' }}>Please wait while we verify your Google account</p>
      </div>
    </div>
  )
}