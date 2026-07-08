import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, AlertTriangle, Sparkles, X, Check, Copy, Download, Trash2, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import api from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import Avatar from '../ui/Avatar'
import MentionText from './MentionText'
import toast from 'react-hot-toast'

interface Props { 
  post: any; 
  queryKey?: any[];
  onDelete?: () => void;
}

// Social Media Icons (unchanged)
const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 32 32">
    <path d="M16,2c-7.732,0-14,6.268-14,14,0,6.566,4.52,12.075,10.618,13.588v-9.31h-2.887v-4.278h2.887v-1.843c0-4.765,2.156-6.974,6.835-6.974,.887,0,2.417,.174,3.043,.348v3.878c-.33-.035-.904-.052-1.617-.052-2.296,0-3.183,.87-3.183,3.13v1.513h4.573l-.786,4.278h-3.787v9.619c6.932-.837,12.304-6.74,12.304-13.897,0-7.732-6.268-14-14-14Z" fill="#1877F2"/>
  </svg>
)

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 32 32">
    <path d="M25.873,6.069c-2.619-2.623-6.103-4.069-9.814-4.069C8.411,2,2.186,8.224,2.184,15.874c-.001,2.446,.638,4.833,1.852,6.936l-1.969,7.19,7.355-1.929c2.026,1.106,4.308,1.688,6.63,1.689h.006c7.647,0,13.872-6.224,13.874-13.874,.001-3.708-1.44-7.193-4.06-9.815h0Zm-9.814,21.347h-.005c-2.069,0-4.099-.557-5.87-1.607l-.421-.25-4.365,1.145,1.165-4.256-.274-.436c-1.154-1.836-1.764-3.958-1.763-6.137,.003-6.358,5.176-11.531,11.537-11.531,3.08,.001,5.975,1.202,8.153,3.382,2.177,2.179,3.376,5.077,3.374,8.158-.003,6.359-5.176,11.532-11.532,11.532h0Zm6.325-8.636c-.347-.174-2.051-1.012-2.369-1.128-.318-.116-.549-.174-.78,.174-.231,.347-.895,1.128-1.098,1.359-.202,.232-.405,.26-.751,.086-.347-.174-1.464-.54-2.788-1.72-1.03-.919-1.726-2.054-1.929-2.402-.202-.347-.021-.535,.152-.707,.156-.156,.347-.405,.52-.607,.174-.202,.231-.347,.347-.578,.116-.232,.058-.434-.029-.607-.087-.174-.78-1.88-1.069-2.574-.281-.676-.567-.584-.78-.595-.202-.01-.433-.012-.665-.012s-.607,.086-.925,.434c-.318,.347-1.213,1.186-1.213,2.892s1.242,3.355,1.416,3.587c.174,.232,2.445,3.733,5.922,5.235,.827,.357,1.473,.571,1.977,.73,.83,.264,1.586,.227,2.183,.138,.666-.1,2.051-.839,2.34-1.649,.289-.81,.289-1.504,.202-1.649s-.318-.232-.665-.405h0Z" fill="#25D366"/>
  </svg>
)

const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 32 32">
    <path d="M16,2c-7.732,0-14,6.268-14,14s6.268,14,14,14,14-6.268,14-14S23.732,2,16,2Zm6.489,9.521c-.211,2.214-1.122,7.586-1.586,10.065-.196,1.049-.583,1.401-.957,1.435-.813,.075-1.43-.537-2.218-1.053-1.232-.808-1.928-1.311-3.124-2.099-1.382-.911-.486-1.412,.302-2.23,.206-.214,3.788-3.472,3.858-3.768,.009-.037,.017-.175-.065-.248-.082-.073-.203-.048-.29-.028-.124,.028-2.092,1.329-5.905,3.903-.559,.384-1.065,.571-1.518,.561-.5-.011-1.461-.283-2.176-.515-.877-.285-1.574-.436-1.513-.92,.032-.252,.379-.51,1.042-.773,4.081-1.778,6.803-2.95,8.164-3.517,3.888-1.617,4.696-1.898,5.222-1.907,.116-.002,.375,.027,.543,.163,.142,.115,.181,.27,.199,.379,.019,.109,.042,.357,.023,.551Z" fill="#0088cc"/>
  </svg>
)

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L.826 2.25H10.68l4.652 6.131L18.244 2.25z"/>
  </svg>
)

// Delete Confirmation Modal with Spinner
function DeleteConfirmModal({ isOpen, onClose, onConfirm, isDeleting }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; isDeleting: boolean }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={onClose}>
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
        <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-3xl p-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(230,57,70,0.1)' }}>
              <Trash2 size={28} style={{ color: '#E63946' }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1a2e' }}>Delete Post?</h3>
            <p className="text-sm" style={{ color: '#666' }}>This action cannot be undone. The post will be permanently removed.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={isDeleting} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ background: 'rgba(0,0,0,0.05)', color: '#666' }}>
              Cancel
            </button>
            <button 
              onClick={onConfirm} 
              disabled={isDeleting}
              className="flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50" 
              style={{ background: '#E63946', color: '#fff' }}
            >
              {isDeleting ? <Loader2 size={16} className="animate-spin" /> : null}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Share Modal Component (unchanged)
function ShareModal({ isOpen, onClose, postId, content, images }: { isOpen: boolean; onClose: () => void; postId: string; content: string; images: string[] }) {
  const [copied, setCopied] = useState(false)
  const postUrl = `${window.location.origin}/posts/${postId}`
  const encodedUrl = encodeURIComponent(postUrl)
  const encodedText = encodeURIComponent(content.substring(0, 100) + '... on OtakuBate')

  const shareLinks = [
    { name: 'WhatsApp', icon: <WhatsAppIcon />, color: '#25D366', url: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { name: 'Telegram', icon: <TelegramIcon />, color: '#0088cc', url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
    { name: 'Twitter', icon: <TwitterIcon />, color: '#1DA1F2', url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` },
    { name: 'Facebook', icon: <FacebookIcon />, color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
  ]

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={onClose}>
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
        <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-3xl p-6">
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg" style={{ color: '#1a1a2e' }}>Share Post</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition">
              <X size={18} style={{ color: '#999' }} />
            </button>
          </div>

          <div className="mb-5 p-3 rounded-2xl" style={{ background: 'rgba(230,57,70,0.04)', border: '1px solid rgba(230,57,70,0.1)' }}>
            {images.length > 0 && (
              <div className="mb-2 rounded-xl overflow-hidden">
                <img src={images[0]} className="w-full h-32 object-cover" alt="Post preview" />
              </div>
            )}
            <p className="text-sm line-clamp-2" style={{ color: '#666' }}>{content.substring(0, 100)}...</p>
            <div className="mt-2 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.5)' }}>
              <p className="text-xs break-all" style={{ color: '#999' }}>{postUrl}</p>
            </div>
          </div>

          <div className="flex justify-around gap-3 mb-5">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 hover:scale-110"
                style={{ background: `${link.color}15`, border: `1px solid ${link.color}30` }}
              >
                {link.icon}
              </a>
            ))}
          </div>

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

// Image Lightbox Modal with Download (unchanged)
function ImageLightbox({ image, onClose }: { image: string | null; onClose: () => void }) {
  const [downloading, setDownloading] = useState(false)

  const downloadImage = async () => {
    if (!image) return
    setDownloading(true)
    try {
      const response = await fetch(image)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `otakubate-image-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Image downloaded!')
    } catch (error) {
      toast.error('Failed to download image')
    }
    setDownloading(false)
  }

  if (!image) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.95)' }} onClick={onClose}>
      <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
        <img src={image} className="w-full h-auto rounded-2xl max-h-[90vh] object-contain" alt="Full size" />
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={downloadImage} 
            disabled={downloading}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition disabled:opacity-50"
          >
            <Download size={20} />
          </button>
          <button onClick={onClose} className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition">
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PostCard({ post, queryKey = ['posts'], onDelete }: Props) {
  const { user: currentUser } = useAuthStore()
  const [showSpoiler, setShowSpoiler] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()

  const isOwnPost = currentUser?._id === post.author?._id

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const likeMutation = useMutation({
    mutationFn: () => api.post(`/posts/${post._id}/like`),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey })
      const prev = qc.getQueryData(queryKey)
      qc.setQueryData(queryKey, (old: any) => {
        if (!old) return old
        const updater = (p: any) => p._id === post._id ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 } : p
        if (Array.isArray(old.posts)) return { ...old, posts: old.posts.map(updater) }
        return old
      })
      return { prev }
    },
    onError: (_e, _v, ctx) => { 
      if (ctx?.prev) qc.setQueryData(queryKey, ctx.prev) 
      toast.error('Failed to like post')
    },
  })

  const bookmarkMutation = useMutation({
    mutationFn: () => api.post(`/posts/${post._id}/bookmark`),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey })
      const prev = qc.getQueryData(queryKey)
      qc.setQueryData(queryKey, (old: any) => {
        if (!old) return old
        const updater = (p: any) => p._id === post._id ? { ...p, isBookmarked: !p.isBookmarked } : p
        if (Array.isArray(old.posts)) return { ...old, posts: old.posts.map(updater) }
        return old
      })
      return { prev }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-saved'] })
    },
    onError: (_e, _v, ctx) => { 
      if (ctx?.prev) qc.setQueryData(queryKey, ctx.prev) 
      toast.error('Failed to save post')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/posts/${post._id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey })
      qc.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post deleted successfully!')
      setShowDeleteConfirm(false)
      if (onDelete) {
        onDelete()
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete post')
      setShowDeleteConfirm(false)
    },
  })

  const copyLink = () => {
    const url = `${window.location.origin}/posts/${post._id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied!')
    setShowMenu(false)
  }

  const reportPost = () => {
    toast.success('Report submitted. We will review it.')
    setShowMenu(false)
  }

  const handleDeleteClick = () => {
    setShowMenu(false)
    setShowDeleteConfirm(true)
  }

  const handleRemoveFromSaved = () => {
    bookmarkMutation.mutate()
    setShowMenu(false)
  }

  return (
    <>
      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postId={post._id}
        content={post.content}
        images={post.images || []}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteMutation.mutate()}
        isDeleting={deleteMutation.isPending}
      />

      <ImageLightbox image={selectedImage} onClose={() => setSelectedImage(null)} />

      <article 
        className="p-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(230, 57, 70, 0.08)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div className="flex items-start gap-3">
          <Link to={`/profile/${post.author?.username}`} className="flex-shrink-0 transition-transform duration-200 hover:scale-105">
            <Avatar 
              src={post.author?.avatar} 
              name={post.author?.displayName || post.author?.username} 
              size={44} 
            />
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                <Link 
                  to={`/profile/${post.author?.username}`} 
                  className="font-semibold text-sm transition-colors truncate hover:underline"
                  style={{ color: '#1a1a2e' }}
                >
                  {post.author?.displayName || post.author?.username}
                </Link>
                {/* ✅ REMOVED: isVerified checkmark */}
                {post.author?.isPremium && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5" style={{ background: 'linear-gradient(135deg, #E63946, #FF6B7A)', color: '#fff' }}>
                    <Sparkles size={8} /> PRO
                  </span>
                )}
                <span className="text-xs" style={{ color: '#999' }}>· {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              </div>
              
              <div className="relative" ref={menuRef}>
                <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-lg transition-all duration-200" style={{ color: '#999' }}>
                  <MoreHorizontal size={16} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-44 rounded-xl py-1 z-20 shadow-lg animate-fade-in" style={{ background: '#FFF8EE', border: '1px solid rgba(230, 57, 70, 0.1)' }}>
                    <button onClick={copyLink} className="w-full px-3 py-2 text-xs text-left hover:bg-black/5 transition flex items-center gap-2" style={{ color: '#666' }}>
                      <Copy size={12} /> Copy Link
                    </button>
                    
                    {post.isBookmarked && (
                      <button onClick={handleRemoveFromSaved} className="w-full px-3 py-2 text-xs text-left hover:bg-black/5 transition flex items-center gap-2" style={{ color: '#E63946' }}>
                        <Bookmark size={12} /> Remove from Saved
                      </button>
                    )}
                    
                    {isOwnPost && (
                      <button onClick={handleDeleteClick} className="w-full px-3 py-2 text-xs text-left hover:bg-black/5 transition flex items-center gap-2" style={{ color: '#E63946' }}>
                        <Trash2 size={12} /> Delete Post
                      </button>
                    )}
                    <button onClick={reportPost} className="w-full px-3 py-2 text-xs text-left hover:bg-black/5 transition flex items-center gap-2" style={{ color: '#E63946' }}>
                      <AlertTriangle size={12} /> Report
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {post.community && (
              <Link to={`/communities/${post.community.slug}`} className="text-xs hover:underline inline-block mt-0.5" style={{ color: '#E63946' }}>
                r/{post.community.name}
              </Link>
            )}
            
            <Link to={`/posts/${post._id}`} className="block">
              {post.spoilerWarning && !showSpoiler ? (
                <div onClick={e => { e.preventDefault(); setShowSpoiler(true) }} className="mt-2 rounded-xl p-3 flex items-center gap-2 cursor-pointer transition-all duration-200" style={{ background: 'rgba(230, 57, 70, 0.05)', border: '1px solid rgba(230, 57, 70, 0.1)' }}>
                  <AlertTriangle size={16} style={{ color: '#E63946' }} />
                  <span className="text-sm" style={{ color: '#999' }}>Spoiler — click to reveal</span>
                </div>
              ) : (
                <div className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap break-words" style={{ color: '#1a1a2e' }}>
                  <MentionText content={post.content} />
                </div>
              )}
              
              {post.images?.length > 0 && !(post.spoilerWarning && !showSpoiler) && (
                <div className={`mt-3 gap-2 ${post.images.length === 1 ? 'grid grid-cols-1' : post.images.length === 2 ? 'grid grid-cols-2' : 'grid grid-cols-2'}`}>
                  {post.images.map((img: string, i: number) => (
                    <div key={i} className="relative group overflow-hidden rounded-xl cursor-pointer" onClick={(e) => { e.preventDefault(); setSelectedImage(img); }}>
                      <img src={img} className="w-full rounded-xl transition-transform duration-300 group-hover:scale-105" style={{ border: '1px solid rgba(230, 57, 70, 0.08)', maxHeight: '400px', objectFit: 'contain', background: 'rgba(0,0,0,0.02)' }} alt="" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                        <span className="text-white text-xs px-2 py-1 rounded-full bg-black/50">Click to expand</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Link>
            
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {post.tags.map((t: string) => (
                  <Link key={t} to={`/explore?tag=${t}`} className="text-xs px-2 py-0.5 rounded-full transition-all duration-200 hover:scale-105" style={{ background: 'rgba(230, 57, 70, 0.08)', color: '#E63946' }}>
                    #{t}
                  </Link>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-1 mt-3">
              <button 
                onClick={() => likeMutation.mutate()} 
                disabled={likeMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50" 
                style={{ color: post.isLiked ? '#E63946' : '#999', background: post.isLiked ? 'rgba(230, 57, 70, 0.1)' : 'transparent' }}
              >
                {likeMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Heart size={16} fill={post.isLiked ? 'currentColor' : 'none'} />}
                <span>{post.likesCount || 0}</span>
              </button>
              
              <Link to={`/posts/${post._id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all duration-200 hover:scale-105" style={{ color: '#999', background: 'transparent' }}>
                <MessageCircle size={16} /> <span>{post.commentsCount || 0}</span>
              </Link>
              
              <button onClick={() => setShowShareModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all duration-200 hover:scale-105" style={{ color: '#999', background: 'transparent' }}>
                <Share2 size={16} />
              </button>

              <button 
                onClick={() => bookmarkMutation.mutate()} 
                disabled={bookmarkMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all duration-200 hover:scale-105 ml-auto disabled:opacity-50" 
                style={{ color: post.isBookmarked ? '#E63946' : '#999', background: post.isBookmarked ? 'rgba(230, 57, 70, 0.1)' : 'transparent' }}
              >
                {bookmarkMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Bookmark size={16} fill={post.isBookmarked ? 'currentColor' : 'none'} />}
              </button>
            </div>
          </div>
        </div>
      </article>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  )
}