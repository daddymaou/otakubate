import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Send, KeyRound, Home } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import api from '../../lib/api'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email')
  const [userId, setUserId] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: () => api.post('/auth/forgot-password', { email }),
    onSuccess: (response) => {
      setStep('otp')
      setUserId(response.data.userId || '')
      toast.success('Reset code sent to your email!')
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Email not found')
    },
  })

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: () => api.post('/auth/verify-reset-otp', { email, otp: otp.join('') }),
    onSuccess: () => {
      setStep('reset')
      toast.success('Code verified! Set your new password.')
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Invalid or expired code')
      setOtp(['', '', '', '', '', ''])
    },
  })

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: () => api.post('/auth/reset-password', { 
      email, 
      otp: otp.join(''), 
      newPassword 
    }),
    onSuccess: () => {
      toast.success('Password reset successfully! Please login.')
      navigate('/login')
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Failed to reset password')
    },
  })

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }
    sendOtpMutation.mutate()
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit code')
      return
    }
    verifyOtpMutation.mutate()
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    resetPasswordMutation.mutate()
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #FFF8EE 0%, #FFE8E8 100%)' }}>
      <div className="max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm transition-colors hover:text-[#E63946]" style={{ color: '#666' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
          
          {/* 🔥 Home Button */}
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl hover:bg-black/5 transition-all duration-200 hover:scale-105"
            style={{ color: '#666' }}
            title="Go to Home"
          >
            <Home size={20} />
          </button>
        </div>

        <div className="rounded-2xl p-8 shadow-xl" style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(230,57,70,0.08)' }}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(230,57,70,0.1)' }}>
              {step === 'email' && <Mail size={28} style={{ color: '#E63946' }} />}
              {step === 'otp' && <KeyRound size={28} style={{ color: '#E63946' }} />}
              {step === 'reset' && <CheckCircle size={28} style={{ color: '#E63946' }} />}
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#1a1a2e' }}>
              {step === 'email' && 'Reset Password'}
              {step === 'otp' && 'Enter Verification Code'}
              {step === 'reset' && 'Create New Password'}
            </h1>
            <p className="text-sm" style={{ color: '#999' }}>
              {step === 'email' && 'Enter your email to receive a reset code'}
              {step === 'otp' && `We sent a 6-digit code to ${email}`}
              {step === 'reset' && 'Your new password must be at least 6 characters'}
            </p>
          </div>

          {step === 'email' && (
            <form onSubmit={handleSendOtp}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-xl px-4 py-3 mb-4 focus:outline-none transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                onFocus={e => e.currentTarget.style.borderColor = '#E63946'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(230,57,70,0.15)'}
              />
              <button
                type="submit"
                disabled={sendOtpMutation.isPending}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: '#1a1a2e', color: '#fff' }}
              >
                {sendOtpMutation.isPending ? <Spinner size={18} color="white" /> : <><Send size={16} /> Send Reset Code</>}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              <div className="flex justify-center gap-3 mb-6">
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
                    className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 focus:outline-none transition-all duration-200"
                    style={{
                      background: '#fff',
                      borderColor: digit ? '#E63946' : 'rgba(230,57,70,0.2)',
                      color: '#1a1a2e'
                    }}
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={verifyOtpMutation.isPending || otp.some(d => !d)}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: '#E63946', color: '#fff' }}
              >
                {verifyOtpMutation.isPending ? <Spinner size={18} color="white" /> : <><CheckCircle size={16} /> Verify Code</>}
              </button>
              <button
                type="button"
                onClick={() => sendOtpMutation.mutate()}
                className="w-full mt-3 py-2 rounded-xl text-sm transition-all duration-200"
                style={{ color: '#E63946' }}
              >
                Resend code
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword}>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full rounded-xl px-4 py-3 mb-3 focus:outline-none transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                onFocus={e => e.currentTarget.style.borderColor = '#E63946'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(230,57,70,0.15)'}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-xl px-4 py-3 mb-4 focus:outline-none transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                onFocus={e => e.currentTarget.style.borderColor = '#E63946'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(230,57,70,0.15)'}
              />
              <button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: '#E63946', color: '#fff' }}
              >
                {resetPasswordMutation.isPending ? <Spinner size={18} color="white" /> : <><CheckCircle size={16} /> Reset Password</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}