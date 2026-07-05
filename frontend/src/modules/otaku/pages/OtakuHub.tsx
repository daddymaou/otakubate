import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Search, Plus, Users, Sparkles, TrendingUp, 
  Shuffle, ArrowRight, Loader2, X, Camera
} from 'lucide-react'
import { useClubs } from '../hooks/useClubs'
import Avatar from '../../../components/ui/Avatar'
import Spinner from '../../../components/ui/Spinner'
import toast from 'react-hot-toast'
import api from '../../../lib/api'

export default function OtakuHub() {
  const navigate = useNavigate()
  const { clubs, randomClubs, loading, create, refresh } = useClubs()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newClub, setNewClub] = useState({ 
    name: '', 
    description: '', 
    avatar: null as File | null, 
    banner: null as File | null,
    avatarPreview: '',
    bannerPreview: ''
  })
  const [isCreating, setIsCreating] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const filteredClubs = clubs.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  )

  const trendingClubs = [...clubs]
    .sort((a, b) => (b.membersCount || 0) - (a.membersCount || 0))
    .slice(0, 3)

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewClub({ 
          ...newClub, 
          avatar: file, 
          avatarPreview: reader.result as string 
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewClub({ 
          ...newClub, 
          banner: file, 
          bannerPreview: reader.result as string 
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreate = async () => {
    if (!newClub.name.trim()) {
      toast.error('Club name is required')
      return
    }
    if (!newClub.avatar) {
      toast.error('Club avatar is required')
      return
    }
    
    setIsCreating(true)
    try {
      let avatarUrl = ''
      const avatarFormData = new FormData()
      avatarFormData.append('image', newClub.avatar)
      const avatarRes = await api.post('/upload/image', avatarFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      avatarUrl = avatarRes.data.url

      let bannerUrl = ''
      if (newClub.banner) {
        const bannerFormData = new FormData()
        bannerFormData.append('image', newClub.banner)
        const bannerRes = await api.post('/upload/image', bannerFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        bannerUrl = bannerRes.data.url
      }

      const club = await create({
        name: newClub.name,
        description: newClub.description || '',
        avatar: avatarUrl,
        banner: bannerUrl
      })
      
      toast.success('Club created! 🎉')
      setShowCreate(false)
      setNewClub({ 
        name: '', 
        description: '', 
        avatar: null, 
        banner: null,
        avatarPreview: '',
        bannerPreview: ''
      })
      navigate(`/clubs/${club.slug}`)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create club')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #F5F0E8 0%, #FFE8E8 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 py-5 sm:py-6" style={{ background: 'rgba(255, 248, 238, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(230,57,70,0.1)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-xl opacity-50" style={{ background: '#E63946' }} />
                <img 
                  src="https://files.catbox.moe/8anicu.png" 
                  alt="OtakuBate Logo" 
                  className="relative h-10 w-auto object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: '#1a1a2e', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
                  Otaku<span style={{ color: '#E63946' }}>Hub</span>
                </h1>
                <p className="text-sm" style={{ color: '#999' }}>Discover and join anime clubs</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{ background: '#E63946', boxShadow: '0 4px 16px rgba(230,57,70,0.3)' }}
            >
              <Plus size={18} /> Create Club
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-2xl blur-2xl opacity-20" style={{ background: '#E63946' }} />
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#999' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clubs..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none transition-all duration-200 bg-white shadow-sm"
              style={{ border: '1px solid rgba(230,57,70,0.12)', color: '#1a1a2e' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#E63946'
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(230,57,70,0.08)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(230,57,70,0.12)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={40} /></div>
        ) : (
          <>
            {/* Trending Clubs */}
            {trendingClubs.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-2 rounded-xl" style={{ background: 'rgba(230,57,70,0.08)' }}>
                    <TrendingUp size={16} style={{ color: '#E63946' }} />
                  </div>
                  <h2 className="text-sm font-semibold tracking-wide" style={{ color: '#1a1a2e' }}>Trending Clubs</h2>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(230,57,70,0.1), transparent)' }} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {trendingClubs.map((club, index) => (
                    <Link
                      key={club._id}
                      to={`/clubs/${club.slug}`}
                      className="group p-4 rounded-2xl bg-white transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-98"
                      style={{ border: '1px solid rgba(230,57,70,0.06)' }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={club.avatar} name={club.name} size={44} className="rounded-full flex-shrink-0 ring-2 ring-[rgba(230,57,70,0.06)]" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm truncate" style={{ color: '#1a1a2e' }}>{club.name}</h3>
                          <div className="flex items-center gap-2 text-xs" style={{ color: '#999' }}>
                            <span className="flex items-center gap-0.5"><Users size={12} /> {club.membersCount || 0}</span>
                            <span className="w-0.5 h-3 rounded-full" style={{ background: 'rgba(26,26,46,0.06)' }} />
                            <span>{club.discussionsCount || 0} discussions</span>
                          </div>
                        </div>
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 group-hover:translate-x-0" style={{ color: '#E63946' }} />
                      </div>
                      {index === 0 && (
                        <div className="mt-2.5 text-[10px] font-medium flex items-center gap-1.5" style={{ color: '#E63946' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#E63946' }} />
                          Most Popular
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Random Recommendations */}
            {randomClubs.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-2 rounded-xl" style={{ background: 'rgba(230,57,70,0.08)' }}>
                    <Shuffle size={16} style={{ color: '#E63946' }} />
                  </div>
                  <h2 className="text-sm font-semibold tracking-wide" style={{ color: '#1a1a2e' }}>Recommended for You</h2>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(230,57,70,0.1), transparent)' }} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {randomClubs.map((club) => (
                    <Link
                      key={club._id}
                      to={`/clubs/${club.slug}`}
                      className="group p-4 rounded-2xl bg-white transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-98 text-center"
                      style={{ border: '1px solid rgba(230,57,70,0.06)' }}
                    >
                      <Avatar src={club.avatar} name={club.name} size={52} className="rounded-full mx-auto mb-2.5 ring-2 ring-[rgba(230,57,70,0.06)]" />
                      <h3 className="font-medium text-xs truncate" style={{ color: '#1a1a2e' }}>{club.name}</h3>
                      <p className="text-[10px]" style={{ color: '#999' }}>{club.membersCount || 0} members</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* All Clubs */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-xl" style={{ background: 'rgba(230,57,70,0.08)' }}>
                  <Users size={16} style={{ color: '#E63946' }} />
                </div>
                <h2 className="text-sm font-semibold tracking-wide" style={{ color: '#1a1a2e' }}>All Clubs</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(230,57,70,0.06)', color: '#999' }}>
                  {clubs.length}
                </span>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(230,57,70,0.1), transparent)' }} />
              </div>
              {filteredClubs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl" style={{ border: '1px solid rgba(230,57,70,0.06)' }}>
                  <Sparkles size={36} className="mx-auto mb-3" style={{ color: '#ccc' }} />
                  <p className="text-sm font-medium" style={{ color: '#999' }}>No clubs found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredClubs.map((club) => (
                    <Link
                      key={club._id}
                      to={`/clubs/${club.slug}`}
                      className="group flex items-center justify-between p-4 rounded-2xl bg-white transition-all duration-300 hover:shadow-lg hover:scale-[1.01] active:scale-98"
                      style={{ border: '1px solid rgba(230,57,70,0.06)' }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={club.avatar} name={club.name} size={44} className="rounded-full flex-shrink-0 ring-2 ring-[rgba(230,57,70,0.06)]" />
                        <div>
                          <h3 className="font-bold text-sm" style={{ color: '#1a1a2e' }}>{club.name}</h3>
                          {club.description && (
                            <p className="text-xs line-clamp-1" style={{ color: '#999' }}>{club.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: '#999' }}>
                            <span className="flex items-center gap-0.5"><Users size={12} /> {club.membersCount || 0}</span>
                            <span className="w-0.5 h-3 rounded-full" style={{ background: 'rgba(26,26,46,0.06)' }} />
                            <span>{club.discussionsCount || 0} discussions</span>
                            {club.isAdmin && (
                              <>
                                <span className="w-0.5 h-3 rounded-full" style={{ background: 'rgba(26,26,46,0.06)' }} />
                                <span style={{ color: '#60A5FA' }}>Admin</span>
                              </>
                            )}
                            {club.isOwner && (
                              <>
                                <span className="w-0.5 h-3 rounded-full" style={{ background: 'rgba(26,26,46,0.06)' }} />
                                <span style={{ color: '#FBBF24' }}>Owner</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 group-hover:translate-x-0" style={{ color: '#E63946' }} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Create Club Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={() => setShowCreate(false)}>
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-10 blur-xl" />
            <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(230,57,70,0.08)' }}>
                    <Sparkles size={16} style={{ color: '#E63946' }} />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>Create Club</h3>
                </div>
                <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-black/5 transition-colors" style={{ color: '#999' }}>
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: '#666' }}>
                    Club Name <span style={{ color: '#E63946' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={newClub.name}
                    onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                    placeholder="Enter club name..."
                    className="w-full px-4 py-2.5 rounded-xl focus:outline-none transition-all duration-200 text-sm bg-white"
                    style={{ border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: '#666' }}>
                    Avatar <span style={{ color: '#E63946' }}>*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    {newClub.avatarPreview ? (
                      <div className="relative">
                        <img 
                          src={newClub.avatarPreview} 
                          alt="Avatar preview" 
                          className="w-20 h-20 rounded-full object-cover ring-2 ring-[#E63946]/20"
                        />
                        <button
                          onClick={() => setNewClub({ ...newClub, avatar: null, avatarPreview: '' })}
                          className="absolute -top-1 -right-1 p-0.5 rounded-full bg-red-500 text-white hover:scale-110 transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        className="w-20 h-20 rounded-full flex flex-col items-center justify-center border-2 border-dashed transition-all hover:scale-105"
                        style={{ borderColor: 'rgba(230,57,70,0.3)', background: 'rgba(230,57,70,0.04)' }}
                      >
                        <Camera size={20} style={{ color: '#E63946' }} />
                        <span className="text-[8px] mt-0.5" style={{ color: '#999' }}>Upload</span>
                      </button>
                    )}
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
                  <label className="text-xs font-medium block mb-1.5" style={{ color: '#666' }}>Banner (optional)</label>
                  <div className="flex flex-col gap-3">
                    {newClub.bannerPreview ? (
                      <div className="relative">
                        <img 
                          src={newClub.bannerPreview} 
                          alt="Banner preview" 
                          className="w-full h-24 object-cover rounded-xl"
                        />
                        <button
                          onClick={() => setNewClub({ ...newClub, banner: null, bannerPreview: '' })}
                          className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:scale-110 transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => bannerInputRef.current?.click()}
                        className="w-full h-24 rounded-xl flex flex-col items-center justify-center border-2 border-dashed transition-all hover:scale-[1.01]"
                        style={{ borderColor: 'rgba(230,57,70,0.2)', background: 'rgba(230,57,70,0.02)' }}
                      >
                        <Camera size={24} style={{ color: '#999' }} />
                        <span className="text-xs mt-1" style={{ color: '#999' }}>Click to upload banner</span>
                      </button>
                    )}
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
                    value={newClub.description}
                    onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                    placeholder="What is this club about?"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl focus:outline-none transition-all duration-200 text-sm bg-white resize-none"
                    style={{ border: '1px solid rgba(230,57,70,0.15)', color: '#555' }}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-black/5" style={{ color: '#666' }}>
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isCreating || !newClub.name.trim() || !newClub.avatar}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#E63946' }}
                >
                  {isCreating ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Create'}
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
        .active\\:scale-98:active { transform: scale(0.98); }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  )
}