import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft, Mail, KeyRound, Trash2, Shield, Lock, 
  Globe, MessageSquare, Eye, Check, X, Send, ArrowRight,
  Fingerprint, Verified, AlertTriangle, Save, Spinner as SpinnerIcon,
  EyeOff, Lock as LockIcon, Smartphone, Info, Ban
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import Spinner from '../components/ui/Spinner'
import BlockedUsers from '../components/Settings/BlockedUsers'
import toast from 'react-hot-toast'

// ============================================
// OTP MODAL - Only for Email, Password, Delete Account
// ============================================
function OTPModal({ purpose, label, onVerified, onClose, email }: {
  purpose: string; label: string; onVerified: () => void; onClose: () => void; email?: string
}) {
  const { user } = useAuthStore()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [sent, setSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const sendMutation = useMutation({
    mutationFn: () => api.post('/auth/send-action-otp', { purpose }),
    onSuccess: () => { 
      setSent(true)
      setCountdown(60)
      toast.success('Code sent to your email!')
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
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to send code'),
  })

  const verifyMutation = useMutation({
    mutationFn: () => api.post('/auth/verify-action-otp', { otp: otp.join(''), purpose }),
    onSuccess: () => { 
      toast.success('Verified successfully!')
      onVerified()
      onClose()
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Invalid or expired code')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
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
      for (let i = 0; i < digits.length; i++) newOtp[i] = digits[i]
      setOtp(newOtp)
      inputRefs.current[Math.min(digits.length - 1, 5)]?.focus()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="relative w-full max-w-[92%] sm:max-w-md overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl animate-scale-in">
        <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
        <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl sm:rounded-3xl p-5 sm:p-7">
          <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full hover:bg-black/5">
            <X size={16} className="sm:w-[18px] sm:h-[18px]" style={{ color: '#999' }} />
          </button>
          <div className="text-center mb-5 sm:mb-6">
            <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] to-[#FF6B7A] rounded-full animate-pulse opacity-30" />
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#E63946] to-[#FF6B7A] flex items-center justify-center shadow-lg">
                <Fingerprint size={22} className="text-white" />
              </div>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold mb-1" style={{ color: '#1a1a2e' }}>{label}</h3>
            <p className="text-xs sm:text-sm" style={{ color: '#999' }}>
              Enter the 6-digit code sent to <br className="sm:hidden" />
              <span className="font-semibold" style={{ color: '#E63946' }}>{email || user?.email}</span>
            </p>
          </div>
          {!sent ? (
            <button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending}
              className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 active:scale-98 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)', color: '#fff' }}>
              {sendMutation.isPending ? <Spinner size={18} color="white" /> : <><Send size={16} /> Send Code</>}
            </button>
          ) : (
            <>
              <div onPaste={handlePaste} className="flex justify-center gap-2 sm:gap-3 mb-4">
                {otp.map((digit, index) => (
                  <input key={index} ref={el => inputRefs.current[index] = el} type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(index, e.target.value)} onKeyDown={e => handleKeyDown(index, e)}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 focus:outline-none"
                    style={{ background: '#fff', borderColor: digit ? '#E63946' : 'rgba(230,57,70,0.2)', color: '#1a1a2e' }} autoFocus={index === 0} />
                ))}
              </div>
              <button onClick={() => verifyMutation.mutate()} disabled={verifyMutation.isPending || otp.some(d => !d)}
                className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 active:scale-98 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #E63946 0%, #FF6B7A 100%)', color: '#fff' }}>
                {verifyMutation.isPending ? <Spinner size={18} color="white" /> : <><Verified size={16} /> Verify</>}
              </button>
              <button onClick={() => { setSent(false); sendMutation.mutate() }} disabled={countdown > 0}
                className="w-full mt-3 py-2 text-xs transition-all hover:underline disabled:opacity-50"
                style={{ color: countdown > 0 ? '#bbb' : '#E63946' }}>
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// CHANGE EMAIL MODAL
// ============================================
function ChangeEmailModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user, updateUser } = useAuthStore()
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newEmail, setNewEmail] = useState('')
  const [sent, setSent] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const sendOtpMutation = useMutation({
    mutationFn: () => api.post('/auth/send-action-otp', { purpose: 'EMAIL_CHANGE' }),
    onSuccess: () => { setSent(true); toast.success('Code sent to your current email!') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to send code'),
  })

  const verifyOtpMutation = useMutation({
    mutationFn: () => api.post('/auth/verify-action-otp', { otp: otp.join(''), purpose: 'EMAIL_CHANGE' }),
    onSuccess: () => { toast.success('Verified!'); setStep(2); setSent(false); setOtp(['', '', '', '', '', '']) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Invalid code'),
  })

  const changeEmailMutation = useMutation({
    mutationFn: () => api.put('/users/me/email', { newEmail }),
    onSuccess: ({ data }) => { updateUser(data.user); toast.success('Email changed!'); onSuccess(); onClose() },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to change email'),
  })

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (value && !/^\d+$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    if (pastedData && /^\d+$/.test(pastedData) && pastedData.length <= 6) {
      const digits = pastedData.split('').slice(0, 6)
      const newOtp = [...otp]
      for (let i = 0; i < digits.length; i++) newOtp[i] = digits[i]
      setOtp(newOtp)
      inputRefs.current[Math.min(digits.length - 1, 5)]?.focus()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="relative w-full max-w-[92%] sm:max-w-md overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl animate-scale-in">
        <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
        <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl sm:rounded-3xl p-5 sm:p-7">
          <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full hover:bg-black/5">
            <X size={16} style={{ color: '#999' }} />
          </button>
          <div className="text-center mb-5 sm:mb-6">
            <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] to-[#FF6B7A] rounded-full animate-pulse opacity-30" />
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#E63946] to-[#FF6B7A] flex items-center justify-center shadow-lg">
                {step === 1 ? <Mail size={22} className="text-white" /> : <ArrowRight size={22} className="text-white" />}
              </div>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold mb-1" style={{ color: '#1a1a2e' }}>{step === 1 ? 'Verify Current Email' : 'Enter New Email'}</h3>
            <p className="text-xs sm:text-sm" style={{ color: '#999' }}>{step === 1 ? `We sent a code to ${user?.email}` : 'Enter your new email address'}</p>
          </div>
          {step === 1 ? (
            !sent ? (
              <button onClick={() => sendOtpMutation.mutate()} disabled={sendOtpMutation.isPending}
                className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 active:scale-98 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)', color: '#fff' }}>
                {sendOtpMutation.isPending ? <Spinner size={18} color="white" /> : <><Send size={16} /> Send Code</>}
              </button>
            ) : (
              <>
                <div onPaste={handlePaste} className="flex justify-center gap-2 sm:gap-3 mb-4">
                  {otp.map((digit, index) => (
                    <input key={index} ref={el => inputRefs.current[index] = el} type="text" maxLength={1} value={digit}
                      onChange={e => handleOtpChange(index, e.target.value)} 
                      className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 focus:outline-none"
                      style={{ background: '#fff', borderColor: digit ? '#E63946' : 'rgba(230,57,70,0.2)', color: '#1a1a2e' }} />
                  ))}
                </div>
                <button onClick={() => verifyOtpMutation.mutate()} disabled={verifyOtpMutation.isPending || otp.some(d => !d)}
                  className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 active:scale-98 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #E63946 0%, #FF6B7A 100%)', color: '#fff' }}>
                  {verifyOtpMutation.isPending ? <Spinner size={18} color="white" /> : <><ArrowRight size={16} /> Verify & Continue</>}
                </button>
              </>
            )
          ) : (
            <>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="newemail@example.com"
                className="w-full rounded-xl sm:rounded-2xl px-4 py-3.5 sm:py-4 mb-4 text-sm sm:text-base focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }} autoFocus />
              <button onClick={() => changeEmailMutation.mutate()} disabled={changeEmailMutation.isPending || !newEmail}
                className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 active:scale-98 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #E63946 0%, #FF6B7A 100%)', color: '#fff' }}>
                {changeEmailMutation.isPending ? <Spinner size={18} color="white" /> : <><Save size={16} /> Change Email</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// CHANGE PASSWORD MODAL
// ============================================
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuthStore()
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleUser, setIsGoogleUser] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const sendOtpMutation = useMutation({
    mutationFn: () => api.post('/auth/send-action-otp', { purpose: 'PASSWORD_CHANGE' }),
    onSuccess: () => { setSent(true); toast.success('Code sent to your email!') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to send code'),
  })

  const verifyOtpMutation = useMutation({
    mutationFn: () => api.post('/auth/verify-action-otp', { otp: otp.join(''), purpose: 'PASSWORD_CHANGE' }),
    onSuccess: () => { toast.success('Verified!'); setStep(2) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Invalid code'),
  })

  const changePasswordMutation = useMutation({
    mutationFn: () => api.put('/users/me/password', { currentPassword, newPassword }),
    onSuccess: () => { 
      toast.success('Password changed! Please login again')
      setTimeout(() => { window.location.href = '/login' }, 1500)
    },
    onError: (e: any) => {
      const errorData = e.response?.data
      if (errorData?.isGoogleUser) {
        setIsGoogleUser(true)
        toast.error('This account uses Google Sign-In. You don\'t have a password to change.')
      } else {
        toast.error(errorData?.message || 'Current password is incorrect')
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

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    if (pastedData && /^\d+$/.test(pastedData) && pastedData.length <= 6) {
      const digits = pastedData.split('').slice(0, 6)
      const newOtp = [...otp]
      for (let i = 0; i < digits.length; i++) newOtp[i] = digits[i]
      setOtp(newOtp)
      inputRefs.current[Math.min(digits.length - 1, 5)]?.focus()
    }
  }

  if (isGoogleUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="relative w-full max-w-[92%] sm:max-w-md overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl animate-scale-in">
          <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#3B82F6] opacity-20 blur-xl" />
          <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl sm:rounded-3xl p-5 sm:p-7">
            <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full hover:bg-black/5">
              <X size={16} style={{ color: '#999' }} />
            </button>
            <div className="text-center mb-5 sm:mb-6">
              <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-3">
                <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] rounded-full animate-pulse opacity-30" />
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center shadow-lg">
                  <Info size={22} className="text-white" />
                </div>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold mb-1" style={{ color: '#1a1a2e' }}>Google Account</h3>
              <p className="text-xs sm:text-sm" style={{ color: '#666' }}>
                This account uses Google Sign-In. You don't have a password to change.
              </p>
            </div>
            <button onClick={onClose} className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold" style={{ background: '#3B82F6', color: '#fff' }}>
              Got it
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="relative w-full max-w-[92%] sm:max-w-md overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl animate-scale-in">
        <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
        <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl sm:rounded-3xl p-5 sm:p-7">
          <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full hover:bg-black/5">
            <X size={16} style={{ color: '#999' }} />
          </button>
          <div className="text-center mb-5 sm:mb-6">
            <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] to-[#FF6B7A] rounded-full animate-pulse opacity-30" />
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#E63946] to-[#FF6B7A] flex items-center justify-center shadow-lg">
                <KeyRound size={22} className="text-white" />
              </div>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold mb-1" style={{ color: '#1a1a2e' }}>{step === 1 ? 'Verify to Continue' : 'Create New Password'}</h3>
            {step === 1 && <p className="text-xs sm:text-sm" style={{ color: '#999' }}>We'll send a code to your email</p>}
          </div>
          {step === 1 ? (
            !sent ? (
              <button onClick={() => sendOtpMutation.mutate()} disabled={sendOtpMutation.isPending}
                className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 active:scale-98 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)', color: '#fff' }}>
                {sendOtpMutation.isPending ? <Spinner size={18} color="white" /> : <><Send size={16} /> Send Code</>}
              </button>
            ) : (
              <>
                <div onPaste={handlePaste} className="flex justify-center gap-2 sm:gap-3 mb-4">
                  {otp.map((digit, index) => (
                    <input key={index} ref={el => inputRefs.current[index] = el} type="text" maxLength={1} value={digit}
                      onChange={e => handleOtpChange(index, e.target.value)} 
                      className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 focus:outline-none"
                      style={{ background: '#fff', borderColor: digit ? '#E63946' : 'rgba(230,57,70,0.2)', color: '#1a1a2e' }} />
                  ))}
                </div>
                <button onClick={() => verifyOtpMutation.mutate()} disabled={verifyOtpMutation.isPending || otp.some(d => !d)}
                  className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 active:scale-98 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #E63946 0%, #FF6B7A 100%)', color: '#fff' }}>
                  {verifyOtpMutation.isPending ? <Spinner size={18} color="white" /> : <><ArrowRight size={16} /> Verify</>}
                </button>
              </>
            )
          ) : (
            <>
              <div className="relative mb-3">
                <input type={showPassword ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current password"
                  className="w-full rounded-xl px-4 py-3.5 sm:py-4 text-sm sm:text-base focus:outline-none pr-12"
                  style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <Eye size={18} /> : <LockIcon size={18} />}
                </button>
              </div>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)"
                className="w-full rounded-xl px-4 py-3.5 sm:py-4 mb-3 text-sm sm:text-base focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }} />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password"
                className="w-full rounded-xl px-4 py-3.5 sm:py-4 mb-4 text-sm sm:text-base focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }} />
              <button onClick={() => changePasswordMutation.mutate()} disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || newPassword !== confirmPassword}
                className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 active:scale-98 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #E63946 0%, #FF6B7A 100%)', color: '#fff' }}>
                {changePasswordMutation.isPending ? <Spinner size={18} color="white" /> : <><Save size={16} /> Change Password</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// DELETE ACCOUNT MODAL
// ============================================
function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const { logout } = useAuthStore()
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [confirmed, setConfirmed] = useState(false)
  const [sent, setSent] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const sendOtpMutation = useMutation({
    mutationFn: () => api.post('/auth/send-action-otp', { purpose: 'DELETE_ACCOUNT' }),
    onSuccess: () => { setSent(true); toast.success('Code sent to your email!') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to send code'),
  })

  const verifyOtpMutation = useMutation({
    mutationFn: () => api.post('/auth/verify-action-otp', { otp: otp.join(''), purpose: 'DELETE_ACCOUNT' }),
    onSuccess: () => { toast.success('Verified!'); setIsVerified(true); setStep(2) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Invalid code'),
  })

  const deleteAccountMutation = useMutation({
    mutationFn: () => api.delete('/users/me', { data: { actionVerified: true } }),
    onSuccess: () => { toast.success('Account deleted. Goodbye!'); setTimeout(() => { logout(); window.location.href = '/' }, 2000) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to delete account'),
  })

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (value && !/^\d+$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    if (pastedData && /^\d+$/.test(pastedData) && pastedData.length <= 6) {
      const digits = pastedData.split('').slice(0, 6)
      const newOtp = [...otp]
      for (let i = 0; i < digits.length; i++) newOtp[i] = digits[i]
      setOtp(newOtp)
      inputRefs.current[Math.min(digits.length - 1, 5)]?.focus()
    }
  }

  const handleFinalDelete = () => {
    if (confirmed && isVerified) deleteAccountMutation.mutate()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="relative w-full max-w-[92%] sm:max-w-md overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl animate-scale-in">
        <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
        <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl sm:rounded-3xl p-5 sm:p-7">
          <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full hover:bg-black/5">
            <X size={16} style={{ color: '#999' }} />
          </button>
          <div className="text-center mb-5 sm:mb-6">
            <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] to-[#FF6B7A] rounded-full animate-pulse opacity-30" />
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#E63946] to-[#FF6B7A] flex items-center justify-center shadow-lg">
                <AlertTriangle size={22} className="text-white" />
              </div>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold mb-1" style={{ color: '#1a1a2e' }}>{step === 1 ? 'Verify to Delete' : 'Confirm Deletion'}</h3>
            <p className="text-xs sm:text-sm" style={{ color: '#999' }}>{step === 1 ? 'We sent a code to your email' : 'This action cannot be undone'}</p>
          </div>
          {step === 1 ? (
            !sent ? (
              <button onClick={() => sendOtpMutation.mutate()} disabled={sendOtpMutation.isPending}
                className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 active:scale-98 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)', color: '#fff' }}>
                {sendOtpMutation.isPending ? <Spinner size={18} color="white" /> : <><Send size={16} /> Send Code</>}
              </button>
            ) : (
              <>
                <div onPaste={handlePaste} className="flex justify-center gap-2 sm:gap-3 mb-4">
                  {otp.map((digit, index) => (
                    <input key={index} ref={el => inputRefs.current[index] = el} type="text" maxLength={1} value={digit}
                      onChange={e => handleOtpChange(index, e.target.value)} 
                      className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 focus:outline-none"
                      style={{ background: '#fff', borderColor: digit ? '#E63946' : 'rgba(230,57,70,0.2)', color: '#1a1a2e' }} />
                  ))}
                </div>
                <button onClick={() => verifyOtpMutation.mutate()} disabled={verifyOtpMutation.isPending || otp.some(d => !d)}
                  className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 active:scale-98 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #E63946 0%, #FF6B7A 100%)', color: '#fff' }}>
                  {verifyOtpMutation.isPending ? <Spinner size={18} color="white" /> : <><ArrowRight size={16} /> Verify</>}
                </button>
              </>
            )
          ) : (
            <>
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl mb-4 text-center" style={{ background: 'rgba(230,57,70,0.08)' }}>
                <p className="text-sm sm:text-base mb-3" style={{ color: '#666' }}>Type <span className="font-bold text-lg" style={{ color: '#E63946' }}>DELETE</span> to confirm</p>
                <input type="text" onChange={e => setConfirmed(e.target.value === 'DELETE')} placeholder="DELETE"
                  className="w-full rounded-xl px-4 py-3 text-center text-base font-mono focus:outline-none"
                  style={{ background: '#fff', border: '2px solid rgba(230,57,70,0.2)', color: '#1a1a2e' }} />
              </div>
              <button onClick={handleFinalDelete} disabled={!confirmed || deleteAccountMutation.isPending}
                className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 active:scale-98 shadow-lg disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #E63946 0%, #FF6B7A 100%)', color: '#fff' }}>
                {deleteAccountMutation.isPending ? <Spinner size={18} color="white" /> : <><Trash2 size={16} /> Permanently Delete</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN PAGE
// ============================================
export default function PrivacySecurity() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showChangeEmail, setShowChangeEmail] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [showBlockedUsers, setShowBlockedUsers] = useState(false)

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #FFF8EE 0%, #FFE8E8 100%)' }}>
      {showChangeEmail && <ChangeEmailModal onClose={() => setShowChangeEmail(false)} onSuccess={() => { logout(); navigate('/login') }} />}
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
      {showDeleteAccount && <DeleteAccountModal onClose={() => setShowDeleteAccount(false)} />}

      {/* Header */}
      <div className="sticky top-0 z-20 px-4 py-4" style={{ background: 'rgba(255, 248, 238, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(230,57,70,0.1)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link to="/settings" className="p-2 rounded-xl hover:bg-black/5 transition-all">
            <ArrowLeft size={20} style={{ color: '#666' }} />
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: '#1a1a2e' }}>
            <Shield size={20} style={{ color: '#E63946' }} />
            Privacy & Security
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Blocked Users Section */}
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden" style={{ border: '1px solid rgba(230,57,70,0.08)' }}>
          <button
            onClick={() => setShowBlockedUsers(!showBlockedUsers)}
            className="w-full flex items-center justify-between p-4 transition-all hover:bg-black/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(230,57,70,0.08)', color: '#E63946' }}>
                <Ban size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>Blocked Users</p>
                <p className="text-xs" style={{ color: '#888' }}>Manage users you have blocked</p>
              </div>
            </div>
            <span className="text-xs" style={{ color: '#E63946' }}>{showBlockedUsers ? '▲' : '▼'}</span>
          </button>
          {showBlockedUsers && (
            <div className="px-4 pb-4">
              <BlockedUsers />
            </div>
          )}
        </div>

        {/* Security Section - Email & Password only */}
        <div className="rounded-2xl p-5 bg-white shadow-sm" style={{ border: '1px solid rgba(230,57,70,0.08)' }}>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#1a1a2e' }}>
            <Lock size={14} style={{ color: '#E63946' }} /> Security
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 cursor-pointer transition-all" onClick={() => setShowChangeEmail(true)}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(230,57,70,0.08)', color: '#E63946' }}><Mail size={16} /></div>
                <div><p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>Email Address</p><p className="text-xs" style={{ color: '#888' }}>{user?.email}</p></div>
              </div>
              <span className="text-xs" style={{ color: '#E63946' }}>Change →</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 cursor-pointer transition-all" onClick={() => setShowChangePassword(true)}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(230,57,70,0.08)', color: '#E63946' }}><KeyRound size={16} /></div>
                <div><p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>Password</p><p className="text-xs" style={{ color: '#888' }}>Change your password</p></div>
              </div>
              <span className="text-xs" style={{ color: '#E63946' }}>Change →</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl p-5" style={{ border: '2px solid rgba(230,57,70,0.2)', background: 'rgba(230,57,70,0.02)' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} style={{ color: '#E63946' }} />
            <h3 className="text-sm font-semibold" style={{ color: '#E63946' }}>Danger Zone</h3>
          </div>
          <button onClick={() => setShowDeleteAccount(true)} className="w-full flex items-center justify-between p-3 rounded-xl transition-all hover:bg-red-50" style={{ border: '1px solid rgba(230,57,70,0.2)', background: 'rgba(230,57,70,0.03)' }}>
            <div className="flex items-center gap-3"><Trash2 size={16} style={{ color: '#E63946' }} /><span className="text-sm font-medium" style={{ color: '#E63946' }}>Delete Account</span></div>
            <span className="text-xs" style={{ color: '#E63946' }}>Permanently delete →</span>
          </button>
          <p className="text-xs mt-3" style={{ color: '#999' }}>Once you delete your account, there is no going back. Please be certain.</p>
        </div>
      </div>

      <style>{`@keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-scale-in { animation: scale-in 0.2s ease-out; }`}</style>
    </div>
  )
}