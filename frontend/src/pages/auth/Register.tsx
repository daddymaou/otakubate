import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, Send, Shield, Sparkles, Home } from 'lucide-react'
import api from '../../lib/api'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

// ✅ FIXED: Hardcoded backend URL
const API_BASE = 'https://otakubate.onrender.com'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [tempUserId, setTempUserId] = useState('')
  const [tempEmail, setTempEmail] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const registerMutation = useMutation({
    mutationFn: () => api.post('/auth/register', {
      username: form.username,
      email: form.email,
      password: form.password,
      displayName: form.displayName || form.username
    }),
    onSuccess: (data) => {
      const userId = data.data.userId || data.data.user?.id
      setTempUserId(userId)
      setTempEmail(form.email)
      setShowOtpInput(true)
      setResendCountdown(60)
      toast.success('Verification code sent to your email!')
      
      const timer = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    },
    onError: (err: any) => {
      if (err.response?.data?.message?.toLowerCase().includes('already registered')) {
        toast.error('This email is already registered but not verified. Please check your email or request a new code.')
      } else {
        toast.error(err.response?.data?.message || 'Registration failed')
      }
    }
  })

  const resendOtpMutation = useMutation({
    mutationFn: () => api.post('/auth/resend-verification-otp', { 
      email: tempEmail || form.email,
      userId: tempUserId
    }),
    onSuccess: (data) => {
      toast.success('New verification code sent!')
      setResendCountdown(60)
      setOtpCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      
      const timer = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.message || 'Failed to resend code'
      
      if (errorMsg.toLowerCase().includes('already verified')) {
        toast.success('Email already verified! Please login.')
        navigate('/login')
        return
      }
      
      if (errorMsg.toLowerCase().includes('not found') || errorMsg.toLowerCase().includes('no user')) {
        toast.error('No account found with this email. Please register first.')
        setShowOtpInput(false)
        setOtpCode(['', '', '', '', '', ''])
        return
      }
      
      toast.error(errorMsg)
    }
  })

  const verifyOtpMutation = useMutation({
    mutationFn: () => api.post('/auth/verify-email-otp', { 
      userId: tempUserId, 
      otp: otpCode.join(''),
      email: tempEmail || form.email
    }),
    onSuccess: (data) => {
      setIsEmailVerified(true)
      setShowOtpInput(false)
      if (data.data.token) {
        localStorage.setItem('token', data.data.token)
        toast.success('Email verified! Welcome to OtakuBate!')
        navigate('/feed')
      } else {
        toast.success('Email verified! Please login.')
        navigate('/login')
      }
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.message || 'Invalid verification code'
      
      if (errorMsg.toLowerCase().includes('expired')) {
        toast.error('Code expired. Request a new one.')
        setTimeout(() => resendOtpMutation.mutate(), 1000)
      } else {
        toast.error(errorMsg)
      }
      
      setOtpCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  })

  const handleGoogleRegister = () => {
    window.location.href = `${API_BASE}/api/auth/google`
  }

  const handleSendCode = () => {
    if (!form.email) {
      toast.error('Please enter your email address')
      return
    }
    if (!form.username) {
      toast.error('Please enter a username')
      return
    }
    if (!form.password) {
      toast.error('Please enter a password')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    registerMutation.mutate()
  }

  const handleResendCode = () => {
    if (resendCountdown === 0) {
      resendOtpMutation.mutate()
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (value && !/^\d+$/.test(value)) return
    const newOtp = [...otpCode]
    newOtp[index] = value
    setOtpCode(newOtp)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter' && otpCode.every(d => d)) {
      verifyOtpMutation.mutate()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    if (pastedData && /^\d+$/.test(pastedData) && pastedData.length <= 6) {
      const digits = pastedData.split('').slice(0, 6)
      const newOtp = [...otpCode]
      for (let i = 0; i < digits.length; i++) {
        newOtp[i] = digits[i]
      }
      setOtpCode(newOtp)
      const lastIndex = Math.min(digits.length - 1, 5)
      inputRefs.current[lastIndex]?.focus()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'linear-gradient(135deg, #FFF8EE 0%, #FFE8E8 100%)' }}>
      <div className="max-w-md w-full rounded-2xl p-6 sm:p-8 relative" style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(230,57,70,0.08)' }}>
        
        {/* 🔥 Home Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 p-2 rounded-xl hover:bg-black/5 transition-all duration-200 hover:scale-105"
          style={{ color: '#666' }}
          title="Go to Home"
        >
          <Home size={20} />
        </button>

        <div className="text-center mb-6">
          <img src="https://files.catbox.moe/8anicu.png" alt="OtakuBate" className="w-16 h-16 mx-auto mb-3" />
          <h2 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>Create Account</h2>
          <p className="text-sm mt-1" style={{ color: '#999' }}>Join the anime community</p>
        </div>

        {/* Google Register Button */}
        <button
          onClick={handleGoogleRegister}
          className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.02] active:scale-95"
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

        {!showOtpInput ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSendCode() }} className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#666' }}>Username</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#999' }} />
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value.toLowerCase() })}
                  className="w-full rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                  placeholder="username"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#666' }}>Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#999' }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#666' }}>Display Name</label>
              <input
                type="text"
                value={form.displayName}
                onChange={e => setForm({ ...form, displayName: e.target.value })}
                className="w-full rounded-xl px-4 py-3 focus:outline-none transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                placeholder="How others see you"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#666' }}>Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#999' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl pl-10 pr-12 py-3 focus:outline-none transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff size={18} style={{ color: '#999' }} /> : <Eye size={18} style={{ color: '#999' }} />}
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: '#bbb' }}>Min 6 characters with uppercase, lowercase, number</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#666' }}>Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#999' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full rounded-xl pl-10 pr-12 py-3 focus:outline-none transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showConfirmPassword ? <EyeOff size={18} style={{ color: '#999' }} /> : <Eye size={18} style={{ color: '#999' }} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              style={{ background: '#1a1a2e', color: '#fff' }}
            >
              {registerMutation.isPending ? <Spinner size={18} color="white" /> : <>Send Code <Send size={16} /></>}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.1)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Shield size={16} style={{ color: '#E63946' }} />
                <span className="text-xs" style={{ color: '#666' }}>Enter verification code sent to <strong style={{ color: '#E63946' }}>{tempEmail || form.email}</strong></span>
              </div>
              
              <div onPaste={handlePaste} className="flex justify-center gap-2 sm:gap-3 mb-4">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 focus:outline-none transition-all duration-200"
                    style={{
                      background: '#fff',
                      borderColor: digit ? '#E63946' : 'rgba(230,57,70,0.2)',
                      color: '#1a1a2e',
                      boxShadow: digit ? '0 0 0 3px rgba(230,57,70,0.1)' : 'none'
                    }}
                    autoFocus={index === 0}
                    disabled={verifyOtpMutation.isPending || resendOtpMutation.isPending}
                  />
                ))}
              </div>
              
              <button
                onClick={() => verifyOtpMutation.mutate()}
                disabled={verifyOtpMutation.isPending || otpCode.some(d => !d) || resendOtpMutation.isPending}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: '#E63946', color: '#fff' }}
              >
                {verifyOtpMutation.isPending ? <Spinner size={16} color="white" /> : 'Verify & Create Account'}
              </button>
              
              <button
                onClick={handleResendCode}
                disabled={resendCountdown > 0 || resendOtpMutation.isPending || verifyOtpMutation.isPending}
                className="w-full mt-2 py-2 text-xs transition-all duration-200 hover:underline disabled:opacity-50 flex items-center justify-center gap-1"
                style={{ color: resendCountdown > 0 || resendOtpMutation.isPending ? '#bbb' : '#E63946' }}
              >
                {resendOtpMutation.isPending ? (
                  <>
                    <Spinner size={12} color="accent" />
                    <span>Sending...</span>
                  </>
                ) : resendCountdown > 0 ? (
                  `Resend in ${resendCountdown}s`
                ) : (
                  'Resend code'
                )}
              </button>
            </div>
            
            <button
              onClick={() => {
                setShowOtpInput(false)
                setOtpCode(['', '', '', '', '', ''])
                setTempUserId('')
                setTempEmail('')
              }}
              className="w-full text-center text-xs transition-all duration-200 hover:underline"
              style={{ color: '#999' }}
            >
              ← Back to registration
            </button>
          </div>
        )}

        {!showOtpInput && (
          <p className="text-center text-sm mt-6" style={{ color: '#999' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium hover:underline" style={{ color: '#E63946' }}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  )
}