import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, RefreshCw, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function VerifyOTP() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [countdown, setCountdown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Get email and userId from location state or localStorage
  useEffect(() => {
    const pendingEmail = state?.email || localStorage.getItem('pendingVerificationEmail')
    const pendingUserId = state?.userId || localStorage.getItem('pendingUserId')
    
    if (pendingEmail) setEmail(pendingEmail)
    if (pendingUserId) setUserId(pendingUserId)
    
    if (!state?.email) {
      localStorage.removeItem('pendingVerificationEmail')
    }
    if (!state?.userId) {
      localStorage.removeItem('pendingUserId')
    }
    
    if (!pendingUserId) {
      toast.error('No verification session found')
      navigate('/login')
    }
  }, [state, navigate])

  // Verify OTP mutation
  const verifyMutation = useMutation({
    mutationFn: async () => {
      const otpString = otp.join('')
      
      // Validate OTP
      if (otpString.length !== 6) {
        throw new Error('Please enter all 6 digits')
      }

      // Validate email and userId
      if (!email || !userId) {
        throw new Error('Missing verification information. Please try logging in again.')
      }

      // FIX: Send proper payload for email verification
      const payload = {
        email: email.trim(),
        otp: otpString,
        userId: userId.trim()
      }

      console.log('Sending verification payload:', payload) // For debugging

      const response = await api.post('/auth/verify-email-otp', payload)
      return response.data
    },
    onSuccess: (data) => {
      toast.success('Email verified successfully!')
      
      localStorage.removeItem('pendingVerificationEmail')
      localStorage.removeItem('pendingUserId')
      
      if (data.token) {
        localStorage.setItem('token', data.token)
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken)
        }
        setAuth(data.user, data.token, data.refreshToken)
        navigate('/feed')
      } else {
        toast.success('Email verified! Please login.')
        navigate('/login')
      }
    },
    onError: (error: any) => {
      console.error('Verification error:', error)
      
      // Handle different error scenarios
      const errorMessage = error?.response?.data?.message || error?.message || 'Invalid or expired code'
      
      // Check if it's an expired code
      if (errorMessage.toLowerCase().includes('expired')) {
        toast.error('Verification code has expired. Please request a new one.')
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        // Automatically trigger resend
        if (email) {
          setTimeout(() => resendMutation.mutate(), 1000)
        }
      } 
      // Check if it's an invalid code
      else if (errorMessage.toLowerCase().includes('invalid')) {
        toast.error('Invalid verification code. Please check and try again.')
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      } 
      // Check if it's a rate limit error
      else if (error?.response?.status === 429) {
        toast.error('Too many attempts. Please wait a moment before trying again.')
      } 
      // Check if it's a session error
      else if (errorMessage.toLowerCase().includes('session') || errorMessage.toLowerCase().includes('not found')) {
        toast.error('Verification session expired. Please login again.')
        localStorage.removeItem('pendingVerificationEmail')
        localStorage.removeItem('pendingUserId')
        navigate('/login')
      }
      // Generic error
      else {
        toast.error(errorMessage)
      }
    },
  })

  // Resend OTP mutation
  const resendMutation = useMutation({
    mutationFn: async () => {
      if (!email) {
        throw new Error('Email address not found. Please try logging in again.')
      }
      
      const response = await api.post('/auth/resend-verification-otp', { 
        email: email.trim(),
        userId: userId.trim() // Add userId if your backend expects it
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('New verification code sent!')
      setCountdown(60)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    },
    onError: (error: any) => {
      console.error('Resend error:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to resend code'
      
      if (error?.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment before trying again.')
      } else if (errorMessage.toLowerCase().includes('not found')) {
        toast.error('Email not found. Please register again.')
        navigate('/register')
      } else {
        toast.error(errorMessage)
      }
    },
  })

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (value && !/^\d+$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter' && otp.every(d => d)) {
      verifyMutation.mutate()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    if (pastedData && /^\d+$/.test(pastedData) && pastedData.length <= 6) {
      const digits = pastedData.split('').slice(0, 6)
      const newOtp = [...otp]
      for (let i = 0; i < digits.length; i++) {
        newOtp[i] = digits[i]
      }
      setOtp(newOtp)
      const lastIndex = Math.min(digits.length - 1, 5)
      inputRefs.current[lastIndex]?.focus()
    }
  }

  const handleResend = () => {
    if (countdown === 0 && email) {
      resendMutation.mutate()
    }
  }

  // Clear all states if no userId
  if (!userId) return null

  const isOtpComplete = otp.every(d => d)
  const isVerifying = verifyMutation.isPending
  const isResending = resendMutation.isPending

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'linear-gradient(135deg, #FFF8EE 0%, #FFE8E8 100%)' }}>
      <div className="max-w-md w-full rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(230,57,70,0.08)' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-1 text-sm transition-all hover:opacity-70 active:scale-95"
          style={{ color: '#999' }}
        >
          <ArrowLeft size={16} /> Back to login
        </button>

        <div className="text-center my-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(230,57,70,0.1)' }}>
            <Mail size={28} style={{ color: '#E63946' }} />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>Verify Your Email</h2>
          <p className="text-sm mt-2" style={{ color: '#999' }}>
            We sent a 6-digit code to
          </p>
          <p className="text-sm font-semibold mt-1" style={{ color: '#E63946' }}>
            {email || 'your email'}
          </p>
        </div>

        <div className="space-y-6">
          {/* OTP Input */}
          <div onPaste={handlePaste} className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
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
                  boxShadow: digit ? '0 0 0 3px rgba(230,57,70,0.1)' : 'none',
                }}
                autoFocus={index === 0}
                disabled={isVerifying}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={() => verifyMutation.mutate()}
            disabled={!isOtpComplete || isVerifying}
            className="w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: isOtpComplete ? '#E63946' : 'rgba(230,57,70,0.3)', color: '#fff' }}
          >
            {isVerifying ? (
              <>
                <Spinner size={18} color="white" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Verify Email
              </>
            )}
          </button>

          {/* Error Message Display */}
          {verifyMutation.error && (
            <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">
                {verifyMutation.error?.response?.data?.message || 
                 verifyMutation.error?.message || 
                 'Verification failed. Please try again.'}
              </p>
            </div>
          )}

          {/* Resend Section */}
          <div className="text-center">
            <p className="text-sm" style={{ color: '#999' }}>
              Didn't receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={isResending || countdown > 0}
                className="font-medium transition-all hover:underline disabled:opacity-50 inline-flex items-center gap-1"
                style={{ color: countdown > 0 ? '#999' : '#E63946' }}
              >
                {isResending ? (
                  <>
                    <Spinner size={14} color="#E63946" />
                    <span>Sending...</span>
                  </>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  'Resend Code'
                )}
              </button>
            </p>
            <div className="flex items-center justify-center gap-1 mt-3 text-xs" style={{ color: 'accent' }}>
              <AlertCircle size={12} />
              <span>Check your spam folder if you don't see the email</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}