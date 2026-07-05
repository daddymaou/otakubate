import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, Plus, Users, Lock, Globe, Sparkles, 
  MessageCircle, ChevronRight, TrendingUp, Flame,
  Crown, Shield, Zap, Hash
} from 'lucide-react'
import { useCommunities } from '../hooks/useClubs'  // FIXED: Changed from useCommunity to useClubs
import Avatar from '../components/ui/Avatar'  // FIXED: Changed path
import Modal from '../components/ui/Modal'    // FIXED: Changed path
import Spinner from '../components/ui/Spinner' // FIXED: Changed path
import toast from 'react-hot-toast'

export default function CommunityList() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    isPrivate: false 
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { communities, loading, create, refresh } = useCommunities(searchQuery)

  const handleCommunityClick = (slug: string) => {
    navigate(`/communities/${slug}`)
  }

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error('Community name is required')
      return
    }

    setIsSubmitting(true)
    try {
      await create({
        name: form.name,
        description: form.description,
        isPrivate: form.isPrivate
      })
      setShowCreate(false)
      setForm({ name: '', description: '', isPrivate: false })
      refresh()
      toast.success('Community created! 🎉')
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get random gradient for community cards
  const getGradient = (index: number) => {
    const gradients = [
      'linear-gradient(135deg, rgba(230,57,70,0.08) 0%, rgba(139,92,246,0.04) 100%)',
      'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(230,57,70,0.04) 100%)',
      'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.04) 100%)',
      'linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(230,57,70,0.04) 100%)',
      'linear-gradient(135deg, rgba(251,146,60,0.08) 0%, rgba(139,92,246,0.04) 100%)',
      'linear-gradient(135deg, rgba(230,57,70,0.06) 0%, rgba(251,191,36,0.06) 100%)'
    ]
    return gradients[index % gradients.length]
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFF8EE' }}>
      {/* Background Decorations */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(80vw, 600px)',
        height: 'auto',
        opacity: 0.02,
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <img 
          src="https://files.catbox.moe/8anicu.png" 
          alt="OtakuBate Logo"
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ background: 'rgba(230,57,70,0.1)' }}>
                <Users size={24} style={{ color: '#E63946' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>
                  Communities
                </h1>
                <p className="text-sm" style={{ color: '#999' }}>
                  {communities.length} communities available
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowCreate(true)} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: '#1a1a2e',
              color: '#fff',
              boxShadow: '0 2px 12px rgba(26,26,46,0.15)'
            }}
          >
            <Plus size={16} />
            Create Community
          </button>
        </div>

        {/* Search */}
        <div 
          className="relative mb-8 rounded-xl transition-all duration-200"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(230, 57, 70, 0.06)'
          }}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: '#999' }} />
          <input 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="Search communities by name or description..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl focus:outline-none transition-all duration-200 text-sm"
            style={{
              background: 'transparent',
              color: '#1a1a2e'
            }}
            onFocus={e => {
              e.currentTarget.parentElement!.style.borderColor = '#E63946'
              e.currentTarget.parentElement!.style.boxShadow = '0 0 0 3px rgba(230,57,70,0.06)'
            }}
            onBlur={e => {
              e.currentTarget.parentElement!.style.borderColor = 'rgba(230,57,70,0.06)'
              e.currentTarget.parentElement!.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <Spinner size={40} />
          </div>
        )}

        {/* Communities Grid */}
        {!loading && communities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map((c: any, index: number) => (
              <div 
                key={c._id} 
                className="group rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl"
                style={{
                  background: 'rgba(255,255,255,0.5)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(26,26,46,0.06)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
                onClick={() => handleCommunityClick(c.slug)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(230,57,70,0.15)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.06)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(26,26,46,0.06)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                {/* Decorative gradient header */}
                <div 
                  className="h-1 w-full transition-all duration-300 group-hover:h-1.5"
                  style={{ background: 'linear-gradient(90deg, #E63946, #8B5CF6)' }}
                />

                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Avatar 
                        src={c.avatar} 
                        name={c.name} 
                        size={56} 
                        className="ring-2 ring-[rgba(230,57,70,0.08)] transition-all duration-200 group-hover:ring-[rgba(230,57,70,0.2)]"
                      />
                      {c.isOwner && (
                        <div className="absolute -top-1 -right-1 p-0.5 rounded-full" style={{ background: '#FFF8EE' }}>
                          <div className="p-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.15)' }}>
                            <Crown size={10} style={{ color: '#FBBF24' }} fill="#FBBF24" />
                          </div>
                        </div>
                      )}
                      {c.isAdmin && !c.isOwner && (
                        <div className="absolute -top-1 -right-1 p-0.5 rounded-full" style={{ background: '#FFF8EE' }}>
                          <div className="p-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.15)' }}>
                            <Shield size={10} style={{ color: '#60A5FA' }} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-base truncate" style={{ color: '#1a1a2e' }}>
                          {c.name}
                        </h3>
                        <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                          {c.isPrivate ? (
                            <Lock size={11} style={{ color: '#999' }} />
                          ) : (
                            <Globe size={11} style={{ color: '#999' }} />
                          )}
                        </div>
                      </div>
                      
                      {c.description && (
                        <p className="text-sm mt-1 line-clamp-2" style={{ color: '#666' }}>
                          {c.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(26,26,46,0.05)' }}>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Users size={12} style={{ color: '#999' }} />
                            <span className="text-xs" style={{ color: '#999' }}>
                              {c.membersCount || 0}
                            </span>
                          </div>
                          {c.isMember && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(46,213,115,0.12)', color: '#2ED573' }}>
                              Member
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!c.isMember ? (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCommunityClick(c.slug)
                              }}
                              className="text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                              style={{
                                background: '#1a1a2e',
                                color: '#fff'
                              }}
                            >
                              Join
                            </button>
                          ) : (
                            <span className="text-xs px-3.5 py-1.5 rounded-lg font-medium" style={{
                              background: 'rgba(230,57,70,0.06)',
                              color: '#E63946'
                            }}>
                              Joined
                            </span>
                          )}
                          <ChevronRight size={14} style={{ color: '#ccc' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && communities.length === 0 && (
          <div 
            className="text-center py-20 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(230,57,70,0.06)'
            }}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(230,57,70,0.06)' }}>
              <Users size={32} style={{ color: '#E63946' }} />
            </div>
            <p className="text-base font-medium mb-1" style={{ color: '#1a1a2e' }}>
              {searchQuery ? 'No communities found' : 'No communities yet'}
            </p>
            <p className="text-sm mb-4" style={{ color: '#999' }}>
              {searchQuery ? 'Try a different search term' : 'Be the first to create one!'}
            </p>
            {!searchQuery && (
              <button 
                onClick={() => setShowCreate(true)} 
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: '#1a1a2e',
                  color: '#fff',
                  boxShadow: '0 2px 12px rgba(26,26,46,0.15)'
                }}
              >
                <Plus size={16} />
                Create Community
              </button>
            )}
          </div>
        )}
      </div>

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
              className="w-full rounded-xl px-4 py-2.5 focus:outline-none transition-all duration-200 text-sm"
              style={{
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(230,57,70,0.15)',
                color: '#1a1a2e'
              }}
              placeholder="e.g., Naruto Fans"
              onFocus={e => {
                e.currentTarget.style.borderColor = '#E63946'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230,57,70,0.06)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(230,57,70,0.15)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: '#666' }}>
              Description
            </label>
            <textarea 
              value={form.description} 
              onChange={e => setForm(p => ({...p, description: e.target.value}))} 
              className="w-full rounded-xl px-4 py-2.5 focus:outline-none transition-all duration-200 resize-none text-sm"
              style={{
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(230,57,70,0.15)',
                color: '#1a1a2e',
                minHeight: '80px'
              }}
              placeholder="What's this community about?"
              maxLength={500}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#E63946'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230,57,70,0.06)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(230,57,70,0.15)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            <p className="text-xs mt-1" style={{ color: '#999' }}>
              {form.description.length}/500
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all duration-200 hover:bg-black/5" style={{ background: 'rgba(230,57,70,0.03)' }}>
            <input 
              type="checkbox" 
              checked={form.isPrivate} 
              onChange={e => setForm(p => ({...p, isPrivate: e.target.checked}))} 
              className="w-4 h-4 rounded cursor-pointer"
              style={{ accentColor: '#E63946' }}
            />
            <div>
              <span className="text-sm font-medium block" style={{ color: '#1a1a2e' }}>Private community</span>
              <span className="text-xs" style={{ color: '#999' }}>Only approved members can join</span>
            </div>
          </label>

          <button 
            onClick={handleCreate} 
            disabled={!form.name.trim() || isSubmitting} 
            className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-98"
            style={{
              background: form.name.trim() && !isSubmitting ? 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)' : '#ccc',
              color: '#fff',
              boxShadow: form.name.trim() && !isSubmitting ? '0 2px 16px rgba(26,26,46,0.2)' : 'none'
            }}
          >
            {isSubmitting ? <Spinner size={18} color="white" /> : 'Create Community'}
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
      `}</style>
    </div>
  )
}