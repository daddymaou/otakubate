import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Users, Lock, Globe, Sparkles, MessageCircle, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function Communities() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', isPrivate: false })
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const qc = useQueryClient()

  // Debounced search
  const handleSearchChange = (value: string) => {
    setQ(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setDebouncedQ(value.trim())
    }, 500)
  }

  // Fetch communities
  const { data, isLoading } = useQuery({
    queryKey: ['communities', debouncedQ],
    queryFn: async () => {
      try {
        const response = await api.get(`/communities?q=${encodeURIComponent(debouncedQ)}`)
        return response.data
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.warn('Rate limited, using cached communities')
          return { communities: [] }
        }
        throw error
      }
    },
    staleTime: 60000,
    gcTime: 120000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 5000,
  })

  // Join/Leave mutation
  const joinMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'join' | 'leave' }) => 
      api.post(`/communities/${id}/${action}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['communities'] })
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Action failed'),
  })

  // Create community mutation - FIXED with ownerId
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user?._id) {
        toast.error('You must be logged in to create a community')
        throw new Error('Not authenticated')
      }
      
      const response = await api.post('/communities', {
        name: form.name,
        description: form.description,
        isPrivate: form.isPrivate,
        ownerId: user._id
      })
      return response.data
    },
    onSuccess: () => { 
      toast.success('コミュニティが作成されました！ 🎉'); 
      setShowCreate(false); 
      setForm({ name: '', description: '', isPrivate: false }); 
      qc.invalidateQueries({ queryKey: ['communities'] }) 
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create community'),
  })

  const handleJoinToggle = (communityId: string, isMember: boolean, e: React.MouseEvent) => {
    e.stopPropagation()
    joinMutation.mutate({ 
      id: communityId, 
      action: isMember ? 'leave' : 'join' 
    })
  }

  const handleCommunityClick = (slug: string) => {
    navigate(`/communities/${slug}`)
  }

  const communities = data?.communities || []

  return (
    <div className="min-h-screen" style={{ background: '#FFF8EE' }}>
      {/* Background Logo */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(80vw, 600px)',
        height: 'auto',
        opacity: 0.03,
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <img 
          src="https://files.catbox.moe/8anicu.png" 
          alt="OtakuBate Logo"
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Blob Decorations */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'absolute',
          width: '500px', height: '500px',
          borderRadius: '50%',
          filter: 'blur(100px)',
          background: 'rgba(230,57,70,0.05)',
          top: '-150px', right: '-100px',
          animation: 'blobFloat1 12s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          width: '400px', height: '400px',
          borderRadius: '50%',
          filter: 'blur(100px)',
          background: 'rgba(26,26,46,0.04)',
          bottom: '-100px', left: '-80px',
          animation: 'blobFloat2 15s ease-in-out infinite'
        }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#1a1a2e' }}>
              <Users size={24} style={{ color: '#E63946' }} />
              コミュニティ (Communities)
            </h1>
            <p className="text-sm mt-1" style={{ color: '#999' }}>
              アニメコミュニティを探索 (Discover anime communities)
            </p>
          </div>
          <button 
            onClick={() => setShowCreate(true)} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: '#1a1a2e',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(26,26,46,0.2)'
            }}
          >
            <Plus size={16} />
            作成 (Create)
          </button>
        </div>

        {/* Search Bar */}
        <div 
          className="relative mb-6 rounded-xl transition-all duration-200"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(230, 57, 70, 0.08)'
          }}
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: '#999' }} />
          <input 
            value={q} 
            onChange={e => handleSearchChange(e.target.value)} 
            placeholder="コミュニティを検索 (Search communities)..."
            className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none transition-all duration-200"
            style={{
              background: 'transparent',
              color: '#1a1a2e',
              fontSize: '14px'
            }}
            onFocus={e => {
              e.currentTarget.parentElement!.style.borderColor = '#E63946'
              e.currentTarget.parentElement!.style.boxShadow = '0 0 0 3px rgba(230,57,70,0.08)'
            }}
            onBlur={e => {
              e.currentTarget.parentElement!.style.borderColor = 'rgba(230,57,70,0.08)'
              e.currentTarget.parentElement!.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner size={36} />
          </div>
        )}

        {/* Communities Grid */}
        {!isLoading && communities.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {communities.map((c: any) => (
              <div 
                key={c._id} 
                className="group p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                style={{
                  background: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(230, 57, 70, 0.06)'
                }}
                onClick={() => handleCommunityClick(c.slug)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(230,57,70,0.2)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(230,57,70,0.06)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div className="flex items-start gap-3">
                  <Avatar 
                    src={c.avatar} 
                    name={c.name} 
                    size={56} 
                    className="flex-shrink-0 ring-2 ring-[rgba(230,57,70,0.1)] transition-all duration-200 group-hover:ring-[rgba(230,57,70,0.3)]"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold truncate text-base" style={{ color: '#1a1a2e' }}>
                        {c.name}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                        {c.isPrivate ? (
                          <Lock size={10} style={{ color: '#999' }} />
                        ) : (
                          <Globe size={10} style={{ color: '#999' }} />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm mt-1 line-clamp-2" style={{ color: '#666' }}>
                      {c.description || 'No description yet'}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3 pt-2 border-t" style={{ borderColor: 'rgba(230,57,70,0.06)' }}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Users size={12} style={{ color: '#999' }} />
                          <span className="text-xs" style={{ color: '#999' }}>
                            {c.membersCount || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle size={12} style={{ color: '#999' }} />
                          <span className="text-xs" style={{ color: '#999' }}>
                            {c.messagesCount || 0}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => handleJoinToggle(c._id, c.isMember, e)}
                          disabled={joinMutation.isPending}
                          className="text-xs px-3 py-1 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                          style={{
                            background: c.isMember ? 'rgba(230,57,70,0.1)' : '#1a1a2e',
                            color: c.isMember ? '#E63946' : '#fff',
                            border: c.isMember ? '1px solid rgba(230,57,70,0.2)' : 'none'
                          }}
                        >
                          {c.isMember ? 'Joined' : 'Join'}
                        </button>
                        <ChevronRight size={16} style={{ color: '#ccc' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && communities.length === 0 && (
          <div 
            className="text-center py-16 rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(230, 57, 70, 0.06)'
            }}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(230,57,70,0.1)' }}>
              <Users size={36} style={{ color: '#E63946' }} />
            </div>
            <p className="text-base font-medium mb-1" style={{ color: '#1a1a2e' }}>
              {debouncedQ ? 'No communities found' : 'No communities yet'}
            </p>
            <p className="text-sm mb-4" style={{ color: '#999' }}>
              {debouncedQ ? 'Try a different search term' : 'Be the first to create a community!'}
            </p>
            {!debouncedQ && (
              <button 
                onClick={() => setShowCreate(true)} 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: '#1a1a2e',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(26,26,46,0.2)'
                }}
              >
                <Plus size={16} />
                Create Community
              </button>
            )}
          </div>
        )}

        {/* Create Community Modal */}
        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Community">
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: '#666' }}>
                Community Name <span style={{ color: '#E63946' }}>*</span>
              </label>
              <input 
                value={form.name} 
                onChange={e => setForm(p => ({...p, name: e.target.value}))} 
                className="w-full rounded-xl px-4 py-2.5 focus:outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(230,57,70,0.2)',
                  color: '#1a1a2e',
                  fontSize: '14px'
                }}
                placeholder="e.g., Naruto Fans"
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#E63946'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230,57,70,0.1)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(230,57,70,0.2)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                autoFocus
              />
              <p className="text-xs mt-1" style={{ color: '#999' }}>
                URL: /communities/{form.name.toLowerCase().replace(/\s+/g, '-') || 'community-name'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: '#666' }}>
                Description
              </label>
              <textarea 
                value={form.description} 
                onChange={e => setForm(p => ({...p, description: e.target.value}))} 
                className="w-full rounded-xl px-4 py-2.5 focus:outline-none transition-all duration-200 resize-none"
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(230,57,70,0.2)',
                  color: '#1a1a2e',
                  minHeight: '90px',
                  fontSize: '14px'
                }}
                placeholder="What's this community about? Share the theme, rules, or purpose..."
                maxLength={500}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#E63946'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230,57,70,0.1)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(230,57,70,0.2)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <p className="text-xs mt-1" style={{ color: '#999' }}>
                {form.description.length}/500 characters
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all duration-200 hover:bg-black/5" style={{ background: 'rgba(230,57,70,0.04)' }}>
              <input 
                type="checkbox" 
                checked={form.isPrivate} 
                onChange={e => setForm(p => ({...p, isPrivate: e.target.checked}))} 
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: '#E63946' }}
              />
              <div>
                <span className="text-sm font-medium block" style={{ color: '#1a1a2e' }}>Private community</span>
                <span className="text-xs" style={{ color: '#999' }}>Only approved members can see and join</span>
              </div>
            </label>

            <button 
              onClick={() => createMutation.mutate()} 
              disabled={!form.name.trim() || createMutation.isPending} 
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-98"
              style={{
                background: form.name.trim() && !createMutation.isPending ? 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)' : '#ccc',
                color: '#fff',
                boxShadow: form.name.trim() && !createMutation.isPending ? '0 2px 12px rgba(26,26,46,0.3)' : 'none'
              }}
            >
              {createMutation.isPending ? <Spinner size={18} color="white" /> : 'Create Community'}
            </button>
          </div>
        </Modal>

        <style>{`
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          @keyframes blobFloat1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -30px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          @keyframes blobFloat2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-40px, 20px) scale(1.05); }
            66% { transform: translate(30px, -40px) scale(0.95); }
          }
        `}</style>
      </div>
    </div>
  )
}