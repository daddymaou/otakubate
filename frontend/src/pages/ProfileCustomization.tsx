import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Camera, Upload, Check, X, Image as ImageIcon, ArrowLeft, Save, 
  Palette, Image, User, Sparkles, Trash2, ZoomIn, AtSign, 
  MapPin, Link as LinkIcon, Edit2, Clock, AlertCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

const DEFAULT_AVATARS = Array.from({ length: 12 }, (_, i) => ({
  id: `avatar${i + 1}`,
  path: `/defaults/avatars/avatar${i + 1}.png`,
  type: 'default' as const
}))

const DEFAULT_BANNERS = Array.from({ length: 6 }, (_, i) => ({
  id: `banner${i + 1}`,
  path: `/defaults/banners/banner${i + 1}.jpg`,
  type: 'default' as const
}))

export default function ProfileCustomization() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  const qc = useQueryClient()
  
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    user?.avatar || DEFAULT_AVATARS[0].path
  )
  const [selectedBanner, setSelectedBanner] = useState<string>(
    user?.banner || DEFAULT_BANNERS[0].path
  )
  const [avatarType, setAvatarType] = useState<'default' | 'custom'>(
    user?.avatarType || 'default'
  )
  const [bannerType, setBannerType] = useState<'default' | 'custom'>(
    user?.bannerType || 'default'
  )
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || '')
  const [bannerPreview, setBannerPreview] = useState<string>(user?.banner || '')
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'avatar' | 'banner' | 'info'>('info')
  const [zoomModal, setZoomModal] = useState<string | null>(null)

  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState(user?.username || '')
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  
  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    gender: user?.gender || 'prefer-not-to-say',
    pronouns: user?.pronouns || '',
    location: user?.location || '',
    website: user?.website || '',
    favoriteGenres: user?.favoriteGenres?.join(', ') || '',
    favoriteAnime: user?.favoriteAnime?.join(', ') || '',
  })

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const canChangeUsername = () => {
    const lastChange = localStorage.getItem('lastUsernameChange')
    if (!lastChange) return true
    const daysSince = (Date.now() - new Date(lastChange).getTime()) / (1000 * 60 * 60 * 24)
    return daysSince >= 3
  }

  const getRemainingDays = () => {
    const lastChange = localStorage.getItem('lastUsernameChange')
    if (!lastChange) return 0
    const daysSince = (Date.now() - new Date(lastChange).getTime()) / (1000 * 60 * 60 * 24)
    return Math.ceil(3 - daysSince)
  }

  const checkUsername = async (username: string) => {
    if (username === user?.username) {
      setUsernameAvailable(true)
      return
    }
    if (username.length < 3) {
      setUsernameAvailable(false)
      return
    }
    setCheckingUsername(true)
    try {
      const { data } = await api.get(`/users/check-username?username=${username}`)
      setUsernameAvailable(data.available)
    } catch {
      setUsernameAvailable(false)
    } finally {
      setCheckingUsername(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (newUsername && isEditingUsername) {
        checkUsername(newUsername)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [newUsername, isEditingUsername])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || !user) {
      toast.error('Please login first')
      navigate('/login')
    }
  }, [])

  useEffect(() => {
    if (user) {
      setSelectedAvatar(user.avatar || DEFAULT_AVATARS[0].path)
      setSelectedBanner(user.banner || DEFAULT_BANNERS[0].path)
      setAvatarType(user.avatarType || 'default')
      setBannerType(user.bannerType || 'default')
      setAvatarPreview(user.avatar || '')
      setBannerPreview(user.banner || '')
      setForm({
        displayName: user.displayName || '',
        bio: user.bio || '',
        gender: user.gender || 'prefer-not-to-say',
        pronouns: user.pronouns || '',
        location: user.location || '',
        website: user.website || '',
        favoriteGenres: user.favoriteGenres?.join(', ') || '',
        favoriteAnime: user.favoriteAnime?.join(', ') || '',
      })
      setNewUsername(user.username || '')
    }
  }, [user])

  const updateUsernameMutation = useMutation({
    mutationFn: (username: string) => api.put('/users/me/username', { username, actionVerified: true }),
    onSuccess: ({ data }) => {
      updateUser(data.user)
      localStorage.setItem('lastUsernameChange', new Date().toISOString())
      toast.success('Username changed! Next change available in 3 days')
      setIsEditingUsername(false)
      setUsernameAvailable(null)
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Username already taken')
      setUsernameAvailable(false)
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => api.put('/users/me', data),
    onSuccess: ({ data }) => {
      updateUser(data.user)
      qc.invalidateQueries({ queryKey: ['user', user?.username] })
      toast.success('Profile updated successfully')
      setIsSaving(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
      setIsSaving(false)
    }
  })

  const uploadImage = async (file: File, type: 'avatar' | 'banner') => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please login to upload images')
      navigate('/login')
      return
    }

    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', type)

    try {
      setIsUploading(true)
      const { data } = await api.post('/upload/image', formData)
      
      if (type === 'avatar') {
        setAvatarPreview(data.url)
        setSelectedAvatar(data.url)
        setAvatarType('custom')
        toast.success('Avatar uploaded')
      } else {
        setBannerPreview(data.url)
        setSelectedBanner(data.url)
        setBannerType('custom')
        toast.success('Banner uploaded')
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        localStorage.removeItem('token')
        navigate('/login')
      } else {
        toast.error(error.response?.data?.message || `Failed to upload ${type}`)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      uploadImage(file, 'avatar')
    }
  }

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB')
        return
      }
      uploadImage(file, 'banner')
    }
  }

  const handleSave = () => {
    if (!hasChanges()) return
    setIsSaving(true)
    updateProfileMutation.mutate({
      displayName: form.displayName,
      bio: form.bio,
      gender: form.gender,
      pronouns: form.pronouns,
      location: form.location,
      website: form.website,
      favoriteGenres: form.favoriteGenres.split(',').map((s: string) => s.trim()).filter(Boolean),
      favoriteAnime: form.favoriteAnime.split(',').map((s: string) => s.trim()).filter(Boolean),
      avatar: selectedAvatar,
      avatarType,
      banner: selectedBanner,
      bannerType
    })
  }

  const handleSelectDefaultAvatar = (avatarPath: string) => {
    setSelectedAvatar(avatarPath)
    setAvatarPreview(avatarPath)
    setAvatarType('default')
  }

  const handleSelectDefaultBanner = (bannerPath: string) => {
    setSelectedBanner(bannerPath)
    setBannerPreview(bannerPath)
    setBannerType('default')
  }

  const handleUsernameSave = () => {
    if (!canChangeUsername()) {
      toast.error(`You can change your username again in ${getRemainingDays()} days`)
      return
    }
    if (newUsername === user?.username) {
      setIsEditingUsername(false)
      return
    }
    if (newUsername.length < 3) {
      toast.error('Username must be at least 3 characters')
      return
    }
    if (!usernameAvailable) {
      toast.error('Username is not available')
      return
    }
    updateUsernameMutation.mutate(newUsername)
  }

  const hasChanges = () => {
    return (
      selectedAvatar !== (user?.avatar || DEFAULT_AVATARS[0].path) ||
      selectedBanner !== (user?.banner || DEFAULT_BANNERS[0].path) ||
      avatarType !== (user?.avatarType || 'default') ||
      bannerType !== (user?.bannerType || 'default') ||
      form.displayName !== (user?.displayName || '') ||
      form.bio !== (user?.bio || '') ||
      form.gender !== (user?.gender || 'prefer-not-to-say') ||
      form.pronouns !== (user?.pronouns || '') ||
      form.location !== (user?.location || '') ||
      form.website !== (user?.website || '') ||
      form.favoriteGenres !== (user?.favoriteGenres?.join(', ') || '') ||
      form.favoriteAnime !== (user?.favoriteAnime?.join(', ') || '')
    )
  }

  return (
    <div className="min-h-screen pb-32" style={{ background: 'linear-gradient(135deg, #FFF8EE 0%, #FFE8E8 100%)' }}>
      {/* Zoom Modal */}
      {zoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)' }} onClick={() => setZoomModal(null)}>
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={zoomModal} className="w-full rounded-2xl" alt="Zoom" />
            <button onClick={() => setZoomModal(null)} className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-20 px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(255, 248, 238, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(230, 57, 70, 0.1)' }}>
        <button
          onClick={() => navigate('/settings')}
          className="p-2 rounded-full transition-all duration-200 hover:scale-105 hover:bg-black/5 active:bg-black/10"
          style={{ color: '#1a1a2e' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: '#1a1a2e' }}>
          <Palette size={18} style={{ color: '#E63946' }} />
          <span className="hidden xs:inline">Personal Data</span>
          <span className="xs:hidden">Profile</span>
        </h1>
        <button
          onClick={handleSave}
          disabled={!hasChanges() || isSaving}
          className="px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 disabled:opacity-40 hover:scale-105 active:scale-95"
          style={{
            background: hasChanges() ? '#E63946' : 'rgba(230, 57, 70, 0.2)',
            color: hasChanges() ? '#fff' : '#999'
          }}
        >
          {isSaving ? <Spinner size={14} color="white" /> : 'Save'}
        </button>
      </div>

      <div className="max-w-lg mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-32">
        {/* Live Preview Card */}
        <div className="mb-6 sm:mb-8 rounded-2xl overflow-hidden shadow-xl" style={{ background: '#fff', border: '1px solid rgba(230, 57, 70, 0.1)' }}>
          <div className="relative h-20 sm:h-28">
            <img 
              src={bannerPreview || DEFAULT_BANNERS[0].path} 
              className="w-full h-full object-cover"
              alt="Banner preview"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_BANNERS[0].path
              }}
            />
            <button 
              onClick={() => setZoomModal(bannerPreview || DEFAULT_BANNERS[0].path)}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 hover:opacity-100 transition"
            >
              <ZoomIn size={12} />
            </button>
          </div>
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 relative">
            <div className="absolute -top-8 left-3 sm:left-4">
              <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <img
                  src={avatarPreview || DEFAULT_AVATARS[0].path}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-white shadow-md transition-all duration-300 group-hover:scale-105"
                  alt="Avatar preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_AVATARS[0].path
                  }}
                />
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <Camera size={14} className="text-white" />
                </div>
              </div>
            </div>
            <div className="pl-[70px] sm:pl-20 pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg" style={{ color: '#1a1a2e' }}>{form.displayName || user?.username}</h3>
                {user?.isVerified && <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-600">✓</span>}
              </div>
              <p className="text-xs" style={{ color: '#999' }}>@{user?.username}</p>
              {form.bio && <p className="text-xs mt-1 line-clamp-1" style={{ color: '#666' }}>{form.bio}</p>}
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 p-1 rounded-full" style={{ background: 'rgba(0,0,0,0.03)' }}>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
              activeTab === 'info' ? 'shadow-md' : ''
            }`}
            style={{
              background: activeTab === 'info' ? '#fff' : 'transparent',
              color: activeTab === 'info' ? '#E63946' : '#999'
            }}
          >
            <User size={15} className="sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Profile Info</span>
            <span className="xs:hidden">Info</span>
          </button>
          <button
            onClick={() => setActiveTab('avatar')}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
              activeTab === 'avatar' ? 'shadow-md' : ''
            }`}
            style={{
              background: activeTab === 'avatar' ? '#fff' : 'transparent',
              color: activeTab === 'avatar' ? '#E63946' : '#999'
            }}
          >
            <Image size={15} className="sm:w-4 sm:h-4" />
            Avatar
          </button>
          <button
            onClick={() => setActiveTab('banner')}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
              activeTab === 'banner' ? 'shadow-md' : ''
            }`}
            style={{
              background: activeTab === 'banner' ? '#fff' : 'transparent',
              color: activeTab === 'banner' ? '#E63946' : '#999'
            }}
          >
            <ImageIcon size={15} className="sm:w-4 sm:h-4" />
            Banner
          </button>
        </div>

        {/* Profile Info Tab - With proper scrolling */}
        {activeTab === 'info' && (
          <div className="space-y-3 sm:space-y-4 pb-4">
            {/* Username Section */}
            <div className="rounded-2xl p-4 sm:p-5 bg-white shadow-sm" style={{ border: '1px solid rgba(230,57,70,0.08)' }}>
              <div className="flex items-center gap-2 mb-1">
                <AtSign size={14} style={{ color: '#E63946' }} />
                <label className="text-sm font-medium" style={{ color: '#666' }}>Username</label>
              </div>
              {isEditingUsername ? (
                <div className="mt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative flex-1 min-w-[140px]">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#999' }}>@</span>
                      <input
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value.toLowerCase())}
                        className="w-full pl-7 pr-3 py-2 rounded-xl text-sm focus:outline-none"
                        style={{ background: '#F5F0E8', border: '1px solid rgba(230,57,70,0.2)', color: '#1a1a2e' }}
                        autoFocus
                      />
                    </div>
                    <button onClick={handleUsernameSave} disabled={updateUsernameMutation.isPending || !usernameAvailable} 
                      className="p-2 rounded-lg hover:bg-black/5 disabled:opacity-50">
                      <Check size={16} style={{ color: usernameAvailable ? '#10B981' : '#999' }} />
                    </button>
                    <button onClick={() => { setIsEditingUsername(false); setNewUsername(user?.username || ''); setUsernameAvailable(null) }} 
                      className="p-2 rounded-lg hover:bg-black/5">
                      <X size={16} style={{ color: '#E63946' }} />
                    </button>
                  </div>
                  {checkingUsername && <p className="text-xs mt-2" style={{ color: '#999' }}>Checking availability...</p>}
                  {usernameAvailable === false && newUsername !== user?.username && (
                    <p className="text-xs mt-2" style={{ color: '#E63946' }}>Username not available</p>
                  )}
                  {usernameAvailable === true && newUsername !== user?.username && (
                    <p className="text-xs mt-2" style={{ color: '#10B981' }}>Username available</p>
                  )}
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <p className="font-mono text-base" style={{ color: '#1a1a2e' }}>@{user?.username}</p>
                  <button onClick={() => setIsEditingUsername(true)} className="p-1 rounded-lg hover:bg-black/5">
                    <Edit2 size={14} style={{ color: '#999' }} />
                  </button>
                </div>
              )}
              {!canChangeUsername() && (
                <p className="text-xs mt-2 flex items-center gap-1" style={{ color: '#F59E0B' }}>
                  <Clock size={10} /> Can change again in {getRemainingDays()} days
                </p>
              )}
            </div>

            {/* Display Name */}
            <div className="rounded-2xl p-4 sm:p-5 bg-white shadow-sm">
              <label className="text-sm font-medium block mb-2" style={{ color: '#666' }}>Display Name</label>
              <input
                value={form.displayName}
                onChange={e => setForm({ ...form, displayName: e.target.value })}
                className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                style={{ background: '#F5F0E8', border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                maxLength={50}
                placeholder="Your display name"
              />
            </div>

            {/* Bio */}
            <div className="rounded-2xl p-4 sm:p-5 bg-white shadow-sm">
              <label className="text-sm font-medium block mb-2" style={{ color: '#666' }}>Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none resize-none"
                style={{ background: '#F5F0E8', border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e', minHeight: '80px' }}
                maxLength={500}
                placeholder="Tell the community about yourself..."
              />
              <p className="text-xs mt-1 text-right" style={{ color: '#bbb' }}>{form.bio.length}/500</p>
            </div>

            {/* Gender & Pronouns */}
            <div className="rounded-2xl p-4 sm:p-5 bg-white shadow-sm">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: '#666' }}>Gender</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm({ ...form, gender: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                    style={{ background: '#F5F0E8', border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: '#666' }}>Pronouns</label>
                  <input
                    value={form.pronouns}
                    onChange={e => setForm({ ...form, pronouns: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                    style={{ background: '#F5F0E8', border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                    placeholder="e.g., he/him, she/her"
                    maxLength={30}
                  />
                </div>
              </div>
            </div>

            {/* Location & Website */}
            <div className="rounded-2xl p-4 sm:p-5 bg-white shadow-sm">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={14} style={{ color: '#E63946' }} />
                    <label className="text-sm font-medium" style={{ color: '#666' }}>Location</label>
                  </div>
                  <input
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                    style={{ background: '#F5F0E8', border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                    placeholder="City, Country"
                    maxLength={100}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <LinkIcon size={14} style={{ color: '#E63946' }} />
                    <label className="text-sm font-medium" style={{ color: '#666' }}>Website</label>
                  </div>
                  <input
                    value={form.website}
                    onChange={e => setForm({ ...form, website: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                    style={{ background: '#F5F0E8', border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                    placeholder="https://yourwebsite.com"
                    maxLength={200}
                  />
                </div>
              </div>
            </div>

            {/* Favorite Genres & Anime */}
            <div className="rounded-2xl p-4 sm:p-5 bg-white shadow-sm">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: '#666' }}>Favorite Genres <span className="text-xs text-[#bbb]">(comma-separated)</span></label>
                  <input
                    value={form.favoriteGenres}
                    onChange={e => setForm({ ...form, favoriteGenres: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                    style={{ background: '#F5F0E8', border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                    placeholder="Action, Romance, Isekai"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: '#666' }}>Favorite Anime <span className="text-xs text-[#bbb]">(comma-separated)</span></label>
                  <input
                    value={form.favoriteAnime}
                    onChange={e => setForm({ ...form, favoriteAnime: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                    style={{ background: '#F5F0E8', border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                    placeholder="Naruto, AOT, One Piece"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Avatar Tab */}
        {activeTab === 'avatar' && (
          <div className="space-y-4 sm:space-y-5 pb-4">
            <div 
              onClick={() => avatarInputRef.current?.click()}
              className="relative rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 hover:scale-105 group overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(230,57,70,0.05) 0%, rgba(230,57,70,0.02) 100%)',
                border: '2px dashed rgba(230,57,70,0.3)'
              }}
            >
              <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              {isUploading ? (
                <div className="flex justify-center"><Spinner size={32} /></div>
              ) : (
                <>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: 'rgba(230,57,70,0.1)' }}>
                    <Upload size={24} className="sm:w-7 sm:h-7" style={{ color: '#E63946' }} />
                  </div>
                  <p className="font-medium text-sm sm:text-base mb-1" style={{ color: '#1a1a2e' }}>Upload Custom Avatar</p>
                  <p className="text-xs" style={{ color: '#999' }}>PNG, JPG, GIF up to 5MB</p>
                </>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: 'rgba(230,57,70,0.1)' }} /></div>
              <div className="relative flex justify-center text-xs"><span className="px-3 py-1 rounded-full text-xs" style={{ background: '#FFF8EE', color: '#999' }}>OR CHOOSE DEFAULT</span></div>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {DEFAULT_AVATARS.map((avatar) => (
                <button key={avatar.id} onClick={() => handleSelectDefaultAvatar(avatar.path)} className="relative group">
           <div 
  className={`rounded-full transition-all duration-200 ${selectedAvatar === avatar.path && avatarType === 'default' ? 'ring-2 ring-offset-2' : 'hover:scale-105'}`} 
  style={{ outlineColor: '#E63946' }}
>
  <img src={avatar.path} className="w-full aspect-square rounded-full object-cover" alt="" />
</div>
                  {selectedAvatar === avatar.path && avatarType === 'default' && <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E63946] flex items-center justify-center shadow-md"><Check size={12} className="text-white" /></div>}
                </button>
              ))}
            </div>
            {avatarType === 'custom' && selectedAvatar && selectedAvatar !== DEFAULT_AVATARS[0].path && (
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(230,57,70,0.05)' }}>
                <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full overflow-hidden"><img src={selectedAvatar} className="w-full h-full object-cover" alt="" /></div><span className="text-xs" style={{ color: '#666' }}>Custom avatar selected</span></div>
                <button onClick={() => { setSelectedAvatar(DEFAULT_AVATARS[0].path); setAvatarPreview(DEFAULT_AVATARS[0].path); setAvatarType('default') }} className="p-1.5 rounded-full hover:bg-black/5 transition"><Trash2 size={14} style={{ color: '#E63946' }} /></button>
              </div>
            )}
          </div>
        )}

        {/* Banner Tab */}
        {activeTab === 'banner' && (
          <div className="space-y-4 sm:space-y-5 pb-4">
            <div onClick={() => bannerInputRef.current?.click()} className="relative rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 hover:scale-105 group overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(230,57,70,0.05) 0%, rgba(230,57,70,0.02) 100%)', border: '2px dashed rgba(230,57,70,0.3)' }}>
              <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
              {isUploading ? <div className="flex justify-center"><Spinner size={32} /></div> : (
                <>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: 'rgba(230,57,70,0.1)' }}><ImageIcon size={24} className="sm:w-7 sm:h-7" style={{ color: '#E63946' }} /></div>
                  <p className="font-medium text-sm sm:text-base mb-1" style={{ color: '#1a1a2e' }}>Upload Custom Banner</p>
                  <p className="text-xs" style={{ color: '#999' }}>PNG, JPG up to 10MB • Recommended: 1500x500px</p>
                </>
              )}
            </div>
            <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: 'rgba(230,57,70,0.1)' }} /></div><div className="relative flex justify-center text-xs"><span className="px-3 py-1 rounded-full text-xs" style={{ background: '#FFF8EE', color: '#999' }}>OR CHOOSE DEFAULT</span></div></div>
            <div className="space-y-2 sm:space-y-3">
              {DEFAULT_BANNERS.map((banner) => (
                <button key={banner.id} onClick={() => handleSelectDefaultBanner(banner.path)} className={`relative w-full h-20 sm:h-24 rounded-xl overflow-hidden transition-all duration-200 ${selectedBanner === banner.path && bannerType === 'default' ? 'ring-2' : 'hover:scale-[1.02]'}`} style={{ outlineColor: '#E63946' }}>
                  <img src={banner.path} className="w-full h-full object-cover" alt="" />
                  {selectedBanner === banner.path && bannerType === 'default' && <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#E63946] flex items-center justify-center shadow-md"><Check size={12} className="text-white" /></div>}
                </button>
              ))}
            </div>
            {bannerType === 'custom' && selectedBanner && selectedBanner !== DEFAULT_BANNERS[0].path && (
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(230,57,70,0.05)' }}>
                <div className="flex items-center gap-2"><div className="w-12 h-8 rounded overflow-hidden"><img src={selectedBanner} className="w-full h-full object-cover" alt="" /></div><span className="text-xs" style={{ color: '#666' }}>Custom banner selected</span></div>
                <button onClick={() => { setSelectedBanner(DEFAULT_BANNERS[0].path); setBannerPreview(DEFAULT_BANNERS[0].path); setBannerType('default') }} className="p-1.5 rounded-full hover:bg-black/5 transition"><Trash2 size={14} style={{ color: '#E63946' }} /></button>
              </div>
            )}
          </div>
        )}

        {/* Unsaved Changes Bar */}
        {hasChanges() && (
          <div className="fixed bottom-0 left-0 right-0 p-3 animate-slide-up z-30" style={{ background: 'rgba(255, 248, 238, 0.98)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(230, 57, 70, 0.1)' }}>
            <div className="flex items-center justify-between max-w-lg mx-auto gap-2">
              <p className="text-xs sm:text-sm font-medium flex items-center gap-1" style={{ color: '#E63946' }}>
                <span className="hidden xs:inline">You have unsaved changes</span>
                <span className="xs:hidden">Unsaved changes</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedAvatar(user?.avatar || DEFAULT_AVATARS[0].path)
                    setSelectedBanner(user?.banner || DEFAULT_BANNERS[0].path)
                    setAvatarType(user?.avatarType || 'default')
                    setBannerType(user?.bannerType || 'default')
                    setAvatarPreview(user?.avatar || '')
                    setBannerPreview(user?.banner || '')
                    setForm({
                      displayName: user?.displayName || '',
                      bio: user?.bio || '',
                      gender: user?.gender || 'prefer-not-to-say',
                      pronouns: user?.pronouns || '',
                      location: user?.location || '',
                      website: user?.website || '',
                      favoriteGenres: user?.favoriteGenres?.join(', ') || '',
                      favoriteAnime: user?.favoriteAnime?.join(', ') || '',
                    })
                    toast.success('Changes discarded')
                  }}
                  className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 hover:bg-black/5 active:scale-95"
                  style={{ background: 'rgba(0,0,0,0.05)', color: '#666' }}
                >
                  Discard
                </button>
                <button onClick={handleSave} disabled={isSaving} className="px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95" style={{ background: '#E63946', color: '#fff' }}>
                  {isSaving ? <Spinner size={14} color="white" /> : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (min-width: 480px) {
          .xs\\:inline { display: inline; }
          .xs\\:hidden { display: none; }
          .xs\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 479px) {
          .xs\\:inline { display: none; }
          .xs\\:hidden { display: inline; }
          .xs\\:grid-cols-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}