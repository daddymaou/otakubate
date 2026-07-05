import { useState } from 'react'
import { X, Copy, Check, Share2, Link, Mail, Download, Image, FileText, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

// Social Media Icons
const FacebookIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path d="M16,2c-7.732,0-14,6.268-14,14,0,6.566,4.52,12.075,10.618,13.588v-9.31h-2.887v-4.278h2.887v-1.843c0-4.765,2.156-6.974,6.835-6.974,.887,0,2.417,.174,3.043,.348v3.878c-.33-.035-.904-.052-1.617-.052-2.296,0-3.183,.87-3.183,3.13v1.513h4.573l-.786,4.278h-3.787v9.619c6.932-.837,12.304-6.74,12.304-13.897,0-7.732-6.268-14-14-14Z" fill="#1877F2"/></svg>)
const WhatsAppIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path d="M25.873,6.069c-2.619-2.623-6.103-4.067-9.814-4.069C8.411,2,2.186,8.224,2.184,15.874c-.001,2.446,.638,4.833,1.852,6.936l-1.969,7.19,7.355-1.929c2.026,1.106,4.308,1.688,6.63,1.689h.006c7.647,0,13.872-6.224,13.874-13.874,.001-3.708-1.44-7.193-4.06-9.815h0Zm-9.814,21.347h-.005c-2.069,0-4.099-.557-5.87-1.607l-.421-.25-4.365,1.145,1.165-4.256-.274-.436c-1.154-1.836-1.764-3.958-1.763-6.137,.003-6.358,5.176-11.531,11.537-11.531,3.08,.001,5.975,1.202,8.153,3.382,2.177,2.179,3.376,5.077,3.374,8.158-.003,6.359-5.176,11.532-11.532,11.532h0Zm6.325-8.636c-.347-.174-2.051-1.012-2.369-1.128-.318-.116-.549-.174-.78,.174-.231,.347-.895,1.128-1.098,1.359-.202,.232-.405,.26-.751,.086-.347-.174-1.464-.54-2.788-1.72-1.03-.919-1.726-2.054-1.929-2.402-.202-.347-.021-.535,.152-.707,.156-.156,.347-.405,.52-.607,.174-.202,.231-.347,.347-.578,.116-.232,.058-.434-.029-.607-.087-.174-.78-1.88-1.069-2.574-.281-.676-.567-.584-.78-.595-.202-.01-.433-.012-.665-.012s-.607,.086-.925,.434c-.318,.347-1.213,1.186-1.213,2.892s1.242,3.355,1.416,3.587c.174,.232,2.445,3.733,5.922,5.235,.827,.357,1.473,.571,1.977,.73,.83,.264,1.586,.227,2.183,.138,.666-.1,2.051-.839,2.34-1.649,.289-.81,.289-1.504,.202-1.649s-.318-.232-.665-.405h0Z" fill="#25D366"/></svg>)
const TelegramIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path d="M16,2c-7.732,0-14,6.268-14,14s6.268,14,14,14,14-6.268,14-14S23.732,2,16,2Zm6.489,9.521c-.211,2.214-1.122,7.586-1.586,10.065-.196,1.049-.583,1.401-.957,1.435-.813,.075-1.43-.537-2.218-1.053-1.232-.808-1.928-1.311-3.124-2.099-1.382-.911-.486-1.412,.302-2.23,.206-.214,3.788-3.472,3.858-3.768,.009-.037,.017-.175-.065-.248-.082-.073-.203-.048-.29-.028-.124,.028-2.092,1.329-5.905,3.903-.559,.384-1.065,.571-1.518,.561-.5-.011-1.461-.283-2.176-.515-.877-.285-1.574-.436-1.513-.92,.032-.252,.379-.51,1.042-.773,4.081-1.778,6.803-2.95,8.164-3.517,3.888-1.617,4.696-1.898,5.222-1.907,.116-.002,.375,.027,.543,.163,.142,.115,.181,.27,.199,.379,.019,.109,.042,.357,.023,.551Z" fill="#0088cc"/></svg>)
const TwitterIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path d="M24.309,6.816l-8.189,9.519,8.126,11.848h-3.916l-6.074-8.913-7.027,8.913h-3.743l8.554-9.944-7.704-11.424h4.032l5.557,8.245,6.652-8.245h3.732Zm-1.695,22.737l-12.44-18.143h2.447l12.446,18.143h-2.453Z" fill="#000000"/></svg>)

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  post: {
    _id: string
    title: string
    content?: string
    image?: string | null
    communityId?: {
      slug: string
    }
    authorId?: {
      displayName?: string
      username?: string
    }
  }
}

export default function ShareModal({ isOpen, onClose, post }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false)

  if (!isOpen) return null

  const postUrl = `${window.location.origin}/clubs/${post.communityId?.slug || 'club'}/discussion/${post._id}`
  const shareText = post.title || 'Check out this discussion'
  const fullShareText = `${shareText}${post.content ? `\n\n${post.content.slice(0, 150)}${post.content.length > 150 ? '...' : ''}` : ''}`
  const encodedUrl = encodeURIComponent(postUrl)
  const encodedText = encodeURIComponent(fullShareText)

  const shareLinks = [
    { name: 'Twitter', icon: <TwitterIcon />, color: '#000000', url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` },
    { name: 'Facebook', icon: <FacebookIcon />, color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: 'WhatsApp', icon: <WhatsAppIcon />, color: '#25D366', url: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { name: 'Telegram', icon: <TelegramIcon />, color: '#0088cc', url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
  ]

  const handleCopy = () => {
    navigator.clipboard.writeText(postUrl)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Download functions
  const downloadImage = () => {
    if (!post.image) {
      toast.error('No image to download')
      return
    }
    const link = document.createElement('a')
    link.href = post.image
    link.download = `otakubate-${post.title.slice(0, 20)}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Image downloading...')
    setShowDownloadDropdown(false)
  }

  const downloadText = () => {
    const text = `${post.title}\n\n${post.content || ''}\n\nShared via OtakuBate`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `otakubate-${post.title.slice(0, 20)}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Text downloaded!')
    setShowDownloadDropdown(false)
  }

  const downloadPost = () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>${post.title}</title></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; background: #FFF8EE;">
        <div style="background: white; padding: 24px; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
          <h1 style="color: #1a1a2e;">${post.title}</h1>
          ${post.content ? `<p style="color: #555; line-height: 1.6;">${post.content}</p>` : ''}
          ${post.image ? `<img src="${post.image}" style="max-width: 100%; border-radius: 8px; margin-top: 16px;" />` : ''}
          <p style="color: #999; font-size: 12px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px;">Shared via OtakuBate</p>
        </div>
      </body>
      </html>
    `
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `otakubate-${post.title.slice(0, 20)}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Post downloaded!')
    setShowDownloadDropdown(false)
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ 
        background: 'rgba(26,26,46,0.85)',
        backdropFilter: 'blur(20px)'
      }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
        
        <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center" style={{ background: 'rgba(230,57,70,0.1)' }}>
                <Share2 size={20} style={{ color: '#E63946' }} />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: '#1a1a2e' }}>Share Discussion</h3>
                <p className="text-xs" style={{ color: '#999' }}>Share with your friends</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-black/5 transition"
              style={{ color: '#999' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Post Preview */}
          <div className="mb-5 p-3 rounded-2xl" style={{ background: 'rgba(230,57,70,0.04)', border: '1px solid rgba(230,57,70,0.1)' }}>
            <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{post.title}</p>
            {post.content && (
              <p className="text-xs mt-1 line-clamp-2" style={{ color: '#666' }}>
                {post.content}
              </p>
            )}
            {post.image && (
              <div className="mt-2">
                <img 
                  src={post.image} 
                  alt="Post image" 
                  className="w-full max-h-[120px] object-cover rounded-lg"
                />
              </div>
            )}
            {post.authorId && (
              <p className="text-xs mt-2" style={{ color: '#999' }}>
                Posted by {post.authorId.displayName || post.authorId.username}
              </p>
            )}
          </div>

          {/* Share Links */}
          <p className="text-xs font-medium mb-3" style={{ color: '#666' }}>Share via</p>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {shareLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center justify-center gap-2 py-3 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-105" 
                style={{ 
                  background: `${link.color}10`, 
                  border: `1px solid ${link.color}30`, 
                  color: link.color 
                }}
              >
                {link.icon}
                <span className="text-[10px]">{link.name}</span>
              </a>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Copy Link */}
            <button 
              onClick={handleCopy} 
              className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02]" 
              style={{ background: '#1a1a2e', color: '#fff' }}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>

            {/* Download Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                className="py-3 px-4 rounded-xl text-sm font-medium flex items-center gap-1 transition-all duration-200 hover:scale-[1.02]"
                style={{ background: '#E63946', color: '#fff' }}
              >
                <Download size={18} />
                <ChevronDown size={14} />
              </button>

              {showDownloadDropdown && (
                <div 
                  className="absolute bottom-full right-0 mb-1 rounded-xl shadow-lg border py-1 min-w-[180px] z-10"
                  style={{ background: '#1a1a2e', borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  {post.image && (
                    <button
                      onClick={downloadImage}
                      className="w-full px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-2 text-left"
                    >
                      <Image size={12} /> Download Image
                    </button>
                  )}
                  <button
                    onClick={downloadText}
                    className="w-full px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-2 text-left"
                  >
                    <FileText size={12} /> Download as Text
                  </button>
                  <button
                    onClick={downloadPost}
                    className="w-full px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-2 text-left"
                  >
                    <Download size={12} /> Download Post
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-center mt-3" style={{ color: '#999' }}>
            Anyone with the link can view this discussion
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}