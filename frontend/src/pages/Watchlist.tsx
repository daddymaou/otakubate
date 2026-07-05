import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Heart, X, Eye, Clock, CheckCircle, 
  Bookmark, Trash2, Film, Calendar, Star,
  Sparkles, List, Grid, Filter, ChevronLeft,
  Play, Tv, Users, Tag
} from 'lucide-react'
import { useWatchlist } from '../hooks/useWatchlist'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  { value: 'watching', label: 'Watching', icon: Eye },
  { value: 'planning', label: 'Planning', icon: Clock },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
  { value: 'on_hold', label: 'On Hold', icon: Bookmark },
  { value: 'dropped', label: 'Dropped', icon: X },
]

export default function Watchlist() {
  const navigate = useNavigate()
  const { watchlist, loading, removeFromWatchlist, refresh, isInWatchlist } = useWatchlist()
  const [filter, setFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredItems = filter === 'all' 
    ? watchlist 
    : watchlist.filter(item => item.status === filter)

  const handleRemove = async (animeId: number, title: string) => {
    if (window.confirm(`Remove "${title}" from your watchlist?`)) {
      await removeFromWatchlist(animeId)
      refresh()
    }
  }

  const handleViewDetails = (animeId: number) => {
    navigate(`/anime`)
    // You can pass the anime ID via state
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      watching: '#E63946',
      planning: '#FBBF24',
      completed: '#2ED573',
      on_hold: '#FF9F43',
      dropped: '#999'
    }
    return colors[status] || '#999'
  }

  const getStatusLabel = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.label || status
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF8EE' }}>
        <Spinner size={48} />
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFF8EE',
      position: 'relative',
      overflowX: 'hidden'
    }}>
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

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 16px'
      }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(230,57,70,0.1)' }}>
              <Heart size={24} style={{ color: '#E63946' }} fill="#E63946" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a2e] tracking-tight">My Watchlist</h1>
              <p className="text-xs text-gray-500">
                {watchlist.length} {watchlist.length === 1 ? 'anime' : 'animes'} saved
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className="p-2.5 rounded-xl transition-colors"
              style={{ 
                background: viewMode === 'grid' ? 'rgba(255,255,255,0.6)' : 'transparent', 
                color: viewMode === 'grid' ? '#1a1a2e' : '#999' 
              }}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="p-2.5 rounded-xl transition-colors"
              style={{ 
                background: viewMode === 'list' ? 'rgba(255,255,255,0.6)' : 'transparent', 
                color: viewMode === 'list' ? '#1a1a2e' : '#999' 
              }}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              filter === 'all' ? 'text-white' : 'text-[#1a1a2e]'
            }`}
            style={{
              background: filter === 'all' ? '#E63946' : 'rgba(255,255,255,0.5)',
              border: filter === 'all' ? 'none' : '1px solid rgba(26,26,46,0.06)',
            }}
          >
            All ({watchlist.length})
          </button>
          {STATUS_OPTIONS.map((status) => {
            const count = watchlist.filter(item => item.status === status.value).length
            if (count === 0) return null
            const Icon = status.icon
            return (
              <button
                key={status.value}
                onClick={() => setFilter(status.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  filter === status.value ? 'text-white' : 'text-[#1a1a2e]'
                }`}
                style={{
                  background: filter === status.value ? '#E63946' : 'rgba(255,255,255,0.5)',
                  border: filter === status.value ? 'none' : '1px solid rgba(26,26,46,0.06)',
                }}
              >
                <Icon size={12} />
                {status.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div
            className="text-center py-24 rounded-2xl"
            style={{ 
              background: 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(26,26,46,0.06)'
            }}
          >
            <Heart size={56} className="mx-auto mb-4" style={{ color: '#ccc' }} />
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
                onClick={() => navigate('/anime')}
                className="mt-4 px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200"
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
        {filteredItems.length > 0 && (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
            : 'space-y-3'
          }>
            {filteredItems.map((item) => (
              viewMode === 'grid' ? (
                <div
                  key={item.id}
                  className="group rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
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
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={40} style={{ color: '#ccc' }} />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div
                      className="absolute top-3 left-3 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                      style={{
                        background: getStatusColor(item.status),
                        color: '#fff'
                      }}
                    >
                      {getStatusLabel(item.status)}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(item.animeId, item.title)
                      }}
                      className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors hover:bg-white/20"
                      style={{
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>

                    {/* View Details Overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'rgba(0,0,0,0.6)' }}
                      onClick={() => handleViewDetails(item.animeId)}
                    >
                      <div className="rounded-full p-4 transition-transform duration-300 group-hover:scale-110" style={{ background: '#E63946' }}>
                        <Sparkles size={28} color="white" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5">
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
                  key={item.id}
                  className="flex gap-4 p-4 rounded-xl transition-all duration-200 cursor-pointer hover:bg-white/50"
                  style={{
                    background: 'rgba(255,255,255,0.4)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(26,26,46,0.06)'
                  }}
                  onClick={() => handleViewDetails(item.animeId)}
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-28 object-cover rounded-xl flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-[#1a1a2e] truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background: getStatusColor(item.status),
                          color: '#fff'
                        }}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(item.animeId, item.title)
                    }}
                    className="self-center p-2 rounded-xl transition-colors hover:bg-white/50"
                    style={{ color: '#999' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      <style>{`
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
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}