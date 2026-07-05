import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../lib/api'
import { CheckCircle, XCircle } from 'lucide-react'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (token) {
      api.get(`/auth/verify-email?token=${token}`)
        .then(() => {
          setStatus('success')
          setMessage('Email verified successfully! You can now login.')
        })
        .catch((err) => {
          setStatus('error')
          setMessage(err.response?.data?.message || 'Verification failed. Please request a new link.')
        })
    } else {
      setStatus('error')
      setMessage('No verification token provided.')
    }
  }, [token])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E63946] mx-auto mb-4"></div>
          <p className="text-gray-500">Verifying your email...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #FFF8EE 0%, #FFE8E8 100%)' }}>
      <div className="max-w-md w-full rounded-2xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(230,57,70,0.08)' }}>
        {status === 'success' ? (
          <>
            <CheckCircle size={64} className="mx-auto mb-4" style={{ color: '#10B981' }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#1a1a2e' }}>Email Verified!</h2>
            <p className="text-sm mb-6" style={{ color: '#666' }}>{message}</p>
            <Link to="/login" className="px-6 py-2 rounded-xl text-sm font-bold inline-block" style={{ background: '#E63946', color: '#fff' }}>
              Go to Login
            </Link>
          </>
        ) : (
          <>
            <XCircle size={64} className="mx-auto mb-4" style={{ color: '#E63946' }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#1a1a2e' }}>Verification Failed</h2>
            <p className="text-sm mb-6" style={{ color: '#666' }}>{message}</p>
            <Link to="/login" className="px-6 py-2 rounded-xl text-sm font-bold inline-block mr-3" style={{ background: '#1a1a2e', color: '#fff' }}>
              Go to Login
            </Link>
            <Link to="/resend-verification" className="px-6 py-2 rounded-xl text-sm font-medium inline-block" style={{ border: '1px solid #E63946', color: '#E63946' }}>
              Resend Link
            </Link>
          </>
        )}
      </div>
    </div>
  )
}