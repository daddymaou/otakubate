import React from 'react'
import { X, Copy, Check } from 'lucide-react'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  url: string
  title: string
}

export default function ShareModal({ isOpen, onClose, url, title }: ShareModalProps) {
  const [copied, setCopied] = React.useState(false)

  if (!isOpen) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={onClose}>
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
        <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg" style={{ color: '#1a1a2e' }}>Share</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition">
              <X size={18} style={{ color: '#999' }} />
            </button>
          </div>
          <p className="text-sm mb-4" style={{ color: '#666' }}>{title}</p>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(230,57,70,0.04)', border: '1px solid rgba(230,57,70,0.1)' }}>
            <p className="text-xs break-all" style={{ color: '#999' }}>{url}</p>
          </div>
          <button
            onClick={handleCopy}
            className="w-full mt-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
            style={{ background: '#1a1a2e', color: '#fff' }}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  )
}