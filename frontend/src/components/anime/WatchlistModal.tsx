import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  X, Eye, Clock, CheckCircle, Bookmark, Trash2, 
  Film, Sparkles, Search, List, Grid, Heart,
  ChevronDown
} from 'lucide-react'
import { useWatchlist } from '../../hooks/useWatchlist'
import Spinner from '../ui/Spinner'
import toast from 'react-hot-toast'

interface WatchlistModalProps {
  isOpen: boolean
  onClose: () => void
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', icon: Heart },
  { value: 'watching', label: 'Watching', icon: Eye },
  { value: 'planning', label: 'Planning', icon: Clock },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
  { value: 'on_hold', label: 'On Hold', icon: Bookmark },
  { value: 'dropped', label: 'Dropped', icon: X },
]

const STATUS_COLORS: Record<string, string> = {
  watching: '#E63946',
  planning: '#FBBF24',
  completed: '#2ED573',
  on_hold: '#FF9F43',
  dropped: '#999'
}

const STATUS_LABELS: Record<string, string> = {
  watching: 'Watching',
  planning: 'Planning',
  completed: 'Completed',
  on_hold: 'On Hold',
  dropped: 'Dropped'
}

export default function WatchlistModal({ isOpen, onClose }: WatchlistModalProps) {
  const navigate = useNavigate()
  const { watchlist, loading, removeFromWatchlist, updateWatchlistItem, refresh } = useWatchlist()
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [updating, setUpdating] = useState<number | null>(null)

  if (!isOpen) return null

  const filteredItems = watchlist.filter(item => {
    // Filter by status
    if (filter !== 'all' && item.status !== filter) return false
    
    // Filter by search
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    
    return true
  })

  const handleRemove = async (animeId: number, title: string) => {
    if (window.confirm(`Remove "${title}" from your watchlist?`)) {
      await removeFromWatchlist(animeId)
      refresh()
    }
  }

  const handleStatusChange = async (animeId: number, status: string) => {
    setUpdating(animeId)
    try {
      await updateWatchlistItem(animeId, { status })
      refresh()
      toast.success(`Updated to "${STATUS_LABELS[status]}"`)
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const handleViewAnime = (animeId: number) => {
    onClose()
    navigate('/anime')
    // You can pass the anime ID via state or URL params
  }

  const getStatusBadge = (status: string) => {
    const color = STATUS_COLORS[status] || '#999'
    const label = STATUS_LABELS[status] || status
    return (
      <span
        className="px-2.5 py-1 rounded-full text-xs font-medium"
        style={{
          background: `${color}20`,
          color: color,
          border: `1px solid ${color}40`
        }}
      >
        {label}
      </span>
    )
  }

  const getStatusOptions = (currentStatus: string) => {
    return STATUS_OPTIONS.filter(opt => opt.value !== 'all' && opt.value !== currentStatus)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden"
        style={{ 
          background: '#FFF8EE',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-5 flex items-center justify-between flex-shrink-0" style={{ 
          background: '#FFF8EE',
          borderBottom: '1px solid rgba(26,26,46,0.06)'
        }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(230,57,70,0.1)' }}>
              <Heart size={20} style={{ color: '#E63946' }} fill="#E63946" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1a1a2e]">My Watchlist</h2>
              <p className="text-xs text-gray-500">
                {watchlist.length} {watchlist.length === 1 ? 'anime' : 'animes'} saved
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/50 transition-colors"
            style={{ color: '#1a1a2e' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            {/* Search */}
            <div
              className="relative flex-1 rounded-xl transition-all duration-200"
              style={{ 
                background: 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(26,26,46,0.06)'
              }}
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: '#999' }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search your watchlist..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl focus:outline-none text-sm"
                style={{ 
                  background: 'transparent', 
                  color: '#1a1a2e'
                }}
                onFocus={e => {
                  e.currentTarget.parentElement!.style.borderColor = '#E63946'
                }}
                onBlur={e => {
                  e.currentTarget.parentElement!.style.borderColor = 'rgba(26,26,46,0.06)'
                }}
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className="p-2 rounded-xl transition-colors"
                style={{ 
                  background: viewMode === 'grid' ? 'rgba(255,255,255,0.6)' : 'transparent', 
                  color: viewMode === 'grid' ? '#1a1a2e' : '#999' 
                }}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="p-2 rounded-xl transition-colors"
                style={{ 
                  background: viewMode === 'list' ? 'rgba(255,255,255,0.6)' : 'transparent', 
                  color: viewMode === 'list' ? '#1a1a2e' : '#999' 
                }}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {STATUS_OPTIONS.map((option) => {
              const Icon = option.icon
              const count = option.value === 'all' 
                ? watchlist.length 
                : watchlist.filter(item => item.status === option.value).length
              
              if (count === 0 && option.value !== 'all') return null
              
              return (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    filter === option.value ? 'text-white' : 'text-[#1a1a2e]'
                  }`}
                  style={{
                    background: filter === option.value ? '#E63946' : 'rgba(255,255,255,0.5)',
                    border: filter === option.value ? 'none' : '1px solid rgba(26,26,46,0.06)',
                  }}
                >
                  <Icon size={12} />
                  {option.label}
                  <span style={{ 
                    opacity: 0.6,
                    fontSize: '10px',
                    fontWeight: 400
                  }}>
                    ({count})
                  </span>
                </button>
              )
            })}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-16">
              <Spinner size={48} />
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredItems.length === 0 && (
            <div
              className="text-center py-16 rounded-2xl"
              style={{ 
                background: 'rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(26,26,46,0.06)'
              }}
            >
              <Heart size={48} className="mx-auto mb-4" style={{ color: '#ccc' }} />
              <p className="text-base font-medium text-[#1a1a2e]">
                {watchlist.length === 0 ? 'Your watchlist is empty' : `No ${filter} anime in your watchlist`}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {watchlist.length === 0 
                  ? 'Start adding anime you want to watch!' 
                  : `Try changing the filter to see other anime`}
              </p>
              {watchlist.length === 0 && (
                <button
                  onClick={() => {
                    onClose()
                    navigate('/anime')
                  }}
                  className="mt-4 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{ background: '#E63946', color: '#fff' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(230,57,70,0.3)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <Sparkles size={16} className="inline mr-2" />
                  Discover Anime
                </button>
              )}
            </div>
          )}

          {/* Watchlist Grid */}
          {!loading && filteredItems.length > 0 && (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'
              : 'space-y-3'
            }>
              {filteredItems.map((item) => (
                viewMode === 'grid' ? (
                  <div
                    key={item.animeId}
                    className="group rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                    style={{
                      background: 'rgba(255,255,255,0.5)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(26,26,46,0.06)'
                    }}
                  >
                    <div className="relative aspect-[2/3] overflow-hidden bg-gray-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={40} style={{ color: '#ccc' }} />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div
                        className="absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-medium"
                        style={{
                          background: `${STATUS_COLORS[item.status]}E6`,
                          color: '#fff',
                          backdropFilter: 'blur(4px)'
                        }}
                      >
                        {STATUS_LABELS[item.status]}
                      </div>

                      {/* Actions */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {/* Status Dropdown */}
                        <div className="relative">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.animeId, e.target.value)}
                            disabled={updating === item.animeId}
                            className="px-2 py-1 rounded-lg text-xs font-medium appearance-none cursor-pointer"
                            style={{
                              background: 'rgba(0,0,0,0.7)',
                              color: '#fff',
                              backdropFilter: 'blur(4px)',
                              border: 'none',
                              paddingRight: '24px',
                              minWidth: '80px'
                            }}
                          >
                            {STATUS_OPTIONS.filter(opt => opt.value !== 'all').map((opt) => (
                              <option key={opt.value} value={opt.value} style={{ background: '#1a1a2e' }}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown 
                            size={12} 
                            style={{ 
                              position: 'absolute',
                              right: '6px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: '#fff',
                              pointerEvents: 'none'
                            }} 
                          />
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemove(item.animeId, item.title)
                          }}
                          className="p-1.5 rounded-lg transition-colors hover:bg-white/20"
                          style={{
                            background: 'rgba(0,0,0,0.7)',
                            color: '#fff',
                            backdropFilter: 'blur(4px)'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* View Details Overlay */}
                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: 'rgba(0,0,0,0.6)' }}
                        onClick={() => handleViewAnime(item.animeId)}
                      >
                        <div className="rounded-full p-3 transition-transform duration-300 group-hover:scale-110" style={{ background: '#E63946' }}>
                          <Sparkles size={20} color="white" />
                        </div>
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2 leading-snug text-[#1a1a2e]">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    key={item.animeId}
                    className="flex gap-4 p-4 rounded-xl transition-all duration-200 cursor-pointer hover:bg-white/50"
                    style={{
                      background: 'rgba(255,255,255,0.4)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(26,26,46,0.06)'
                    }}
                    onClick={() => handleViewAnime(item.animeId)}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-24 object-cover rounded-xl flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-[#1a1a2e] truncate">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {getStatusBadge(item.status)}
                        <span className="text-xs text-gray-500">
                          Added {new Date(item.addedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-center">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.animeId, e.target.value)}
                        disabled={updating === item.animeId}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                        style={{
                          background: 'rgba(255,255,255,0.5)',
                          color: '#1a1a2e',
                          border: '1px solid rgba(26,26,46,0.06)',
                          paddingRight: '24px',
                          appearance: 'none'
                        }}
                      >
                        {STATUS_OPTIONS.filter(opt => opt.value !== 'all').map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemove(item.animeId, item.title)
                        }}
                        className="p-2 rounded-xl transition-colors hover:bg-white/50"
                        style={{ color: '#999' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Footer Stats */}
          {!loading && watchlist.length > 0 && (
            <div className="mt-5 pt-4 flex flex-wrap items-center justify-between gap-3" style={{ 
              borderTop: '1px solid rgba(26,26,46,0.06)' 
            }}>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span>Total: <strong style={{ color: '#1a1a2e' }}>{watchlist.length}</strong></span>
                {STATUS_OPTIONS.filter(opt => opt.value !== 'all').map((opt) => {
                  const count = watchlist.filter(item => item.status === opt.value).length
                  if (count === 0) return null
                  return (
                    <span key={opt.value}>
                      {opt.label}: <strong style={{ color: STATUS_COLORS[opt.value] }}>{count}</strong>
                    </span>
                  )
                })}
              </div>
              <button
                onClick={() => {
                  onClose()
                  navigate('/anime')
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
                style={{ 
                  background: 'rgba(230,57,70,0.08)', 
                  color: '#E63946',
                  border: '1px solid rgba(230,57,70,0.1)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(230,57,70,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(230,57,70,0.08)'}
              >
                <Sparkles size={12} />
                Discover More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}