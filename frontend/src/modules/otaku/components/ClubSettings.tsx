import { useState, useRef } from 'react'
import { 
  X, Settings as SettingsIcon, Sparkles, 
  Loader2, AlertTriangle, Crown, Users, Edit3,
  Camera, Trash2 
} from 'lucide-react'
import Avatar from '../../../components/ui/Avatar'
import toast from 'react-hot-toast'
import api from '../../../lib/api'
import Spinner from '../../../components/ui/Spinner'

interface ClubSettingsProps {
  club: any
  isOwner: boolean
  isAdmin: boolean
  onClose: () => void
  onUpdate: () => void
  onDelete?: () => void
}

export default function ClubSettings({
  club,
  isOwner,
  isAdmin,
  onClose,
  onUpdate,
  onDelete
}: ClubSettingsProps) {
  const [name, setName] = useState(club.name || '')
  const [description, setDescription] = useState(club.description || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(club.avatar || '')
  const [bannerPreview, setBannerPreview] = useState(club.banner || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [confirmUsername, setConfirmUsername] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const canEdit = isAdmin || isOwner

  const stats = [
    { label: 'Members', value: club.membersCount || 0, icon: <Users size={14} /> },
    { label: 'Discussions', value: club.discussionsCount || 0, icon: <Edit3 size={14} /> },
  ]

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBannerFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Club name is required')
      return
    }

    setIsSubmitting(true)
    try {
      let avatarUrl = club.avatar
      let bannerUrl = club.banner

      if (avatarFile) {
        const formData = new FormData()
        formData.append('image', avatarFile)
        const res = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        avatarUrl = res.data.url
      }

      if (bannerFile) {
        const formData = new FormData()
        formData.append('image', bannerFile)
        const res = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        bannerUrl = res.data.url
      }

      await api.put(`/otaku/clubs/${club._id}`, {
        name: name.trim(),
        description: description.trim(),
        avatar: avatarUrl,
        banner: bannerUrl
      })
      
      toast.success('Club settings updated!')
      onUpdate()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update club')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (confirmUsername !== club?.name) {
      toast.error('Club name does not match')
      return
    }
    
    setIsDeleting(true)
    try {
      const clubId = club?._id
      
      // ✅ FIXED: Use api instance instead of fetch with localhost
      await api.delete(`/otaku/clubs/${clubId}`)
      
      toast.success('Club deleted successfully')
      setShowDeleteConfirm(false)
      setConfirmUsername('')
      setIsDeleting(false)
      onClose()
      if (onDelete) {
        onDelete()
      } else {
        window.location.href = '/clubs'
      }
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error.response?.data?.error || 'Failed to delete club')
      setIsDeleting(false)
    }
  }

  if (!canEdit) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={onClose}>
        <div className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
          <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(230,57,70,0.1)' }}>
              <Crown size={28} style={{ color: '#E63946' }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1a2e' }}>Access Denied</h3>
            <p className="text-sm mb-4" style={{ color: '#666' }}>Only admins can edit club settings.</p>
            <button onClick={onClose} className="px-6 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105" style={{ background: '#E63946' }}>
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={onClose}>
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-10 blur-xl" />
          
          <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 px-6 py-5" style={{ background: 'rgba(255, 248, 238, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(230,57,70,0.1)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-block animate-spin-slow">
                    <SettingsIcon size={22} style={{ color: '#E63946' }} />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: '#1a1a2e' }}>Club Settings</h2>
                    <p className="text-xs" style={{ color: '#999' }}>Manage your club</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 transition-colors" style={{ color: '#999' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              {/* Club Summary */}
              <div className="mb-6 p-4 rounded-2xl bg-white shadow-sm" style={{ border: '1px solid rgba(230,57,70,0.08)' }}>
                <div className="flex items-center gap-4">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-14 h-14 rounded-full object-cover ring-2 ring-[#E63946]/20" />
                  ) : club.avatar ? (
                    <img src={club.avatar} alt="Avatar" className="w-14 h-14 rounded-full object-cover ring-2 ring-[#E63946]/20" />
                  ) : (
                    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(230,57,70,0.08)' }}>
                      <span className="text-2xl">🎌</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>{club.name}</h3>
                    {club.description && (
                      <p className="text-xs mt-1 max-w-md line-clamp-1" style={{ color: '#666' }}>{club.description}</p>
                    )}
                  </div>
                  {isOwner && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24' }}>
                      Owner
                    </span>
                  )}
                  {isAdmin && !isOwner && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA' }}>
                      Admin
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {stats.map((stat, index) => (
                  <div key={index} className="p-3 rounded-xl text-center bg-white shadow-sm" style={{ border: '1px solid rgba(230,57,70,0.08)' }}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span style={{ color: '#E63946' }}>{stat.icon}</span>
                      <span className="text-xl font-bold" style={{ color: '#1a1a2e' }}>{stat.value}</span>
                    </div>
                    <p className="text-xs" style={{ color: '#999' }}>{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Edit Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: '#666' }}>
                    Club Name <span style={{ color: '#E63946' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Club name"
                    className="w-full px-4 py-2.5 rounded-xl focus:outline-none transition-all duration-200 text-sm bg-white"
                    style={{ border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: '#666' }}>Avatar</label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-16 h-16 rounded-full object-cover ring-2 ring-[#E63946]/20" />
                      ) : club.avatar ? (
                        <img src={club.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover ring-2 ring-[#E63946]/20" />
                      ) : (
                        <div className="w-16 h-16 rounded-full flex items-center justify-center ring-2 ring-[#E63946]/20" style={{ background: 'rgba(230,57,70,0.08)' }}>
                          <span className="text-2xl">🎌</span>
                        </div>
                      )}
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#E63946] text-white hover:scale-110 transition"
                      >
                        <Camera size={12} />
                      </button>
                    </div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <span className="text-[10px]" style={{ color: '#999' }}>PNG, JPG, GIF up to 5MB</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: '#666' }}>Banner</label>
                  <div className="relative">
                    {bannerPreview ? (
                      <img src={bannerPreview} alt="Banner" className="w-full h-24 object-cover rounded-xl" />
                    ) : club.banner ? (
                      <img src={club.banner} alt="Banner" className="w-full h-24 object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-24 rounded-xl flex items-center justify-center" style={{ background: 'rgba(230,57,70,0.04)', border: '1px dashed rgba(230,57,70,0.2)' }}>
                        <span className="text-xs" style={{ color: '#999' }}>No banner uploaded</span>
                      </div>
                    )}
                    <button
                      onClick={() => bannerInputRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition rounded-xl"
                    >
                      <Camera size={24} className="text-white" />
                    </button>
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: '#666' }}>Description (optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Club description"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl focus:outline-none transition-all duration-200 text-sm bg-white resize-none"
                    style={{ border: '1px solid rgba(230,57,70,0.15)', color: '#555' }}
                  />
                </div>

                {/* Danger Zone - Owner Only */}
                {isOwner && (
                  <div className="mt-6 p-4 rounded-2xl" style={{ background: 'rgba(230,57,70,0.04)', border: '1px solid rgba(230,57,70,0.1)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={16} style={{ color: '#E63946' }} />
                      <h4 className="text-sm font-bold" style={{ color: '#E63946' }}>Danger Zone</h4>
                    </div>
                    <p className="text-xs mb-3" style={{ color: '#666' }}>Once you delete this club, there is no going back.</p>
                    <button
                      onClick={handleDeleteClick}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02]"
                      style={{ background: '#E63946' }}
                    >
                      <Trash2 size={14} /> Delete Club
                    </button>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'rgba(26,26,46,0.06)' }}>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-black/5"
                  style={{ color: '#666' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !name.trim()}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: '#E63946' }}
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal - Centered */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={() => setShowDeleteConfirm(false)}>
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
            <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(230,57,70,0.1)' }}>
                <Trash2 size={28} style={{ color: '#E63946' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1a2e' }}>Delete {club.name}?</h3>
              <p className="text-sm mb-4" style={{ color: '#666' }}>Type <strong>{club.name}</strong> to confirm deletion.</p>
              <input
                type="text"
                value={confirmUsername}
                onChange={(e) => setConfirmUsername(e.target.value)}
                placeholder={`Type "${club.name}"`}
                className="w-full px-4 py-2 rounded-xl focus:outline-none text-sm bg-white mb-4"
                style={{ border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                disabled={isDeleting}
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => { setShowDeleteConfirm(false); setConfirmUsername('') }} 
                  className="flex-1 py-2 rounded-xl text-sm font-medium transition-all hover:bg-black/5" 
                  style={{ color: '#666' }} 
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete} 
                  className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2" 
                  style={{ background: '#E63946' }} 
                  disabled={confirmUsername !== club.name || isDeleting}
                >
                  {isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </>
  )
}