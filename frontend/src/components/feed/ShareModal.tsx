import { useState } from 'react'
import { X, Copy, Check, Share2, Facebook, Twitter, Send } from 'lucide-react'
import toast from 'react-hot-toast'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  post: {
    _id: string
    title?: string
    content?: string
    image?: string
    communityId?: { slug: string }
  }
}

export default function ShareModal({ isOpen, onClose, post }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const postUrl = `${window.location.origin}/clubs/${post.communityId?.slug || 'feed'}/discussion/${post._id}`
  const text = post.title || post.content || 'Check this out on OtakuBate'

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const shareLinks = [
    {
      name: 'Twitter',
      icon: <Twitter size={20} />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`,
      color: '#1DA1F2'
    },
    {
      name: 'Facebook',
      icon: <Facebook size={20} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
      color: '#1877F2'
    },
    {
      name: 'Telegram',
      icon: <Send size={20} />,
      url: `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(text)}`,
      color: '#0088cc'
    }
  ]

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
        <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg flex items-center justify-center" style={{ background: 'rgba(230,57,70,0.08)', color: '#E63946' }}>
                <Share2 size={18} />
              </div>
              <h3 className="font-bold text-lg" style={{ color: '#1a1a2e' }}>Share</h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition">
              <X size={18} style={{ color: '#999' }} />
            </button>
          </div>

          {/* Preview */}
          <div 
            className="mb-4 p-3 rounded-xl overflow-hidden"
            style={{ 
              background: 'rgba(230,57,70,0.04)', 
              border: '1px solid rgba(230,57,70,0.1)',
              maxHeight: '150px'
            }}
          >
            {post.image && (
              <img 
                src={post.image} 
                alt="Post preview" 
                className="w-full h-20 object-cover rounded-lg mb-2"
              />
            )}
            <p className="text-sm line-clamp-2" style={{ color: '#666' }}>
              {post.title || post.content?.substring(0, 100) || 'Check this out on OtakuBate'}
            </p>
          </div>

          {/* Share buttons */}
          <div className="flex justify-around mb-4">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{ 
                  background: `${link.color}15`, 
                  color: link.color,
                  border: `1px solid ${link.color}30`
                }}
              >
                {link.icon}
              </a>
            ))}
          </div>

          {/* Copy link */}
          <button
            onClick={handleCopyLink}
            className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
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