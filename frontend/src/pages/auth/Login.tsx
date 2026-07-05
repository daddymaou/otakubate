import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Mail, Lock, Eye, EyeOff, ArrowRight, RefreshCw } from 'lucide-react'
import api from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || ''

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isVerificationPending, setIsVerificationPending] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')
  const [pendingUserId, setPendingUserId] = useState('')

  const googleError = searchParams.get('error')

  useEffect(() => {
    if (googleError === 'google_failed') {
      toast.error('Google login failed. Please try again.')
    } else if (googleError === 'google_not_configured') {
      toast.error('Google login is not configured yet.')
    }
  }, [googleError])

  // --- FIX: Resend OTP mutation ---
  const resendOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/resend-verification-otp', { 
        email: pendingEmail 
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('New verification code sent to your email!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to resend code')
    }
  })

  const loginMutation = useMutation({
    mutationFn: async () => {
      console.log('Attempting login with:', { email, password: '***' })
      const response = await api.post('/auth/login', { email, password })
      console.log('Login response:', response.data)
      return response.data
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem('token', data.token)
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken)
        }
        login(data.user, data.token)
        toast.success('Welcome back!')
        navigate('/feed')
      } else {
        toast.error('No token received')
      }
    },
    onError: (err: any) => {
      console.error('Login error:', err.response?.data || err.message)
      const errorData = err.response?.data
      const message = errorData?.message || 'Login failed'
      
      // --- FIX: Handle unverified user ---
      if (errorData?.requiresVerification) {
        setIsVerificationPending(true)
        setPendingEmail(errorData.email || email)
        setPendingUserId(errorData.userId)
        toast.error(message || 'Please verify your email')
      } 
      // --- FIX: Handle Google user ---
      else if (errorData?.isGoogleUser) {
        toast.error('This account uses Google Sign-In. Please continue with Google.')
      }
      // --- FIX: Handle rate limit ---
      else if (message.includes('Too many auth attempts')) {
        toast.error('Too many login attempts. Please wait 15 minutes and try again.')
      }
      // --- FIX: Handle other errors ---
      else {
        toast.error(message)
      }
    }
  })

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/google`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }
    // Reset verification state on new attempt
    setIsVerificationPending(false)
    loginMutation.mutate()
  }

  const handleResendOTP = () => {
    if (pendingEmail) {
      resendOtpMutation.mutate()
    }
  }

  const handleVerifyNow = () => {
    if (pendingEmail) {
      navigate('/verify-otp', { 
        state: { 
          email: pendingEmail, 
          userId: pendingUserId,
          fromLogin: true 
        } 
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #FFF8EE 0%, #FFE8E8 100%)' }}>
      <div className="max-w-md w-full rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(230,57,70,0.08)' }}>
        <div className="text-center mb-6">
          <img 
            src="https://files.catbox.moe/8anicu.png" 
            alt="OtakuBate" 
            className="w-16 h-16 mx-auto mb-3"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <h2 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>Welcome Back</h2>
          <p className="text-sm mt-1" style={{ color: '#999' }}>Sign in to your account</p>
        </div>

        {/* --- FIX: Verification Pending Banner --- */}
        {isVerificationPending && (
          <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.15)' }}>
            <p className="text-sm font-medium" style={{ color: '#E63946' }}>
              ⚠️ Please verify your email first
            </p>
            <p className="text-xs mt-1" style={{ color: '#666' }}>
              We sent a verification code to <span style={{ color: '#E63946' }}>{pendingEmail}</span>
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleVerifyNow}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105"
                style={{ background: '#E63946', color: '#fff' }}
              >
                Enter Code
              </button>
              <button
                onClick={handleResendOTP}
                disabled={resendOtpMutation.isPending}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105 flex items-center justify-center gap-1 disabled:opacity-50"
                style={{ background: 'rgba(0,0,0,0.05)', color: '#666' }}
              >
                {resendOtpMutation.isPending ? (
                  <Spinner size={14} color="dark" />
                ) : (
                  <>
                    <RefreshCw size={12} /> Resend Code
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-3 transition-all duration-200 hover:scale-105 mb-4"
          style={{ background: '#fff', color: '#1a1a2e', border: '1px solid rgba(230,57,70,0.2)' }}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'rgba(230,57,70,0.15)' }} />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 py-1 rounded-full" style={{ background: '#FFF8EE', color: '#999' }}>OR</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: '#666' }}>Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#999' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: '#666' }}>Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#999' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl pl-10 pr-12 py-3 focus:outline-none transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={18} style={{ color: '#999' }} /> : <Eye size={18} style={{ color: '#999' }} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs hover:underline" style={{ color: '#E63946' }}>Forgot password?</Link>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 disabled:opacity-50"
            style={{ background: '#1a1a2e', color: '#fff' }}
          >
            {loginMutation.isPending ? <Spinner size={18} color="white" /> : <>Sign In <ArrowRight size={16} /></>}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: '#999' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-medium hover:underline" style={{ color: '#E63946' }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}