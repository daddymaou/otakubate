import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { 
  Search, Star, Film, Tv, Calendar, Play, 
  ChevronLeft, ChevronRight, Download, Clock, Eye, 
  X, List, Grid, Flame, Award, Sparkles, MonitorPlay
} from 'lucide-react'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

// ============================================
// API
// ============================================

const API_BASE = 'https://otakubate.onrender.com/api/anime'

const CATEGORIES = [
  { label: 'Trending', value: 'trending', icon: Flame },
  { label: 'Top Rated', value: 'top', icon: Award },
  { label: 'Upcoming', value: 'upcoming', icon: Calendar },
  { label: 'Movies', value: 'movies', icon: Film },
  { label: 'All', value: 'tv', icon: Grid },
]

// ============================================
// API Functions
// ============================================

async function fetchTrending(filter: string) {
  try {
    const filterMap: Record<string, string> = {
      'trending': 'trending',
      'top': 'top',
      'upcoming': 'upcoming',
      'movies': 'movies',
      'tv': 'tv'
    }
    
    const backendFilter = filterMap[filter] || 'trending'
    const res = await fetch(`${API_BASE}/category?filter=${backendFilter}&page=1&limit=24`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    return json.results || []
  } catch (error) {
    console.error('fetchTrending error:', error)
    return []
  }
}

async function fetchSearch(q: string) {
  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}&page=1&limit=24`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    return json.results || []
  } catch (error) {
    console.error('fetchSearch error:', error)
    return []
  }
}

// ============================================
// Hero Section
// ============================================

function HeroSection({ anime, onWatch, onInfo, category }: { 
  anime: any
  onWatch: () => void
  onInfo: () => void
  category: string 
}) {
  if (!anime) return null

  const isUpcoming = category === 'upcoming'

  return (
    <div 
      className="relative rounded-2xl overflow-hidden mb-8"
      style={{ 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        minHeight: '320px'
      }}
    >
      {anime.image && (
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${anime.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      
      <div className="relative z-10 p-8 flex flex-col md:flex-row gap-6 items-center">
        {anime.image && (
          <img
            src={anime.image}
            alt={anime.title}
            className="w-40 h-56 object-cover rounded-xl shadow-2xl flex-shrink-0"
          />
        )}
        
        <div className="flex-1 text-center md:text-left">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3" style={{ background: 'rgba(230,57,70,0.2)', color: '#E63946' }}>
            {isUpcoming ? '📅 Coming Soon' : `${anime.format || 'TV'} • ${anime.status || 'Airing'}`}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {anime.title}
          </h1>
          <p className="text-sm text-gray-400 line-clamp-2 max-w-2xl">
            {anime.description || 'No synopsis available.'}
          </p>
          
          <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
            {!isUpcoming ? (
              <>
                <button
                  onClick={onWatch}
                  className="px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                  style={{ background: '#E63946', color: '#fff' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(230,57,70,0.4)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <Play size={16} fill="white" />
                  Watch
                </button>
                <button
                  onClick={onInfo}
                  className="px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <Sparkles size={16} />
                  Details
                </button>
              </>
            ) : (
              <button
                className="px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 cursor-not-allowed"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#888' }}
              >
                <Clock size={16} />
                Coming Soon
              </button>
            )}
            <button
              onClick={() => toast('Download feature coming soon!', { icon: '📥' })}
              className="px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <Download size={16} />
              Download
            </button>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Star size={14} style={{ color: '#FBBF24' }} fill="#FBBF24" />
              {anime.score || 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {anime.popularity?.toLocaleString() || 'N/A'}
            </span>
            {anime.episodes && (
              <span className="flex items-center gap-1">
                <Tv size={14} />
                {anime.episodes} eps
              </span>
            )}
            {anime.year && (
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {anime.year}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Anime Card
// ============================================

function AnimeCard({ anime, onClick, onInfo, index, category }: { 
  anime: any
  onClick: () => void
  onInfo: () => void
  index: number
  category: string 
}) {
  const isUpcoming = category === 'upcoming'

  return (
    <div
      onClick={!isUpcoming ? onClick : undefined}
      className={`group rounded-xl overflow-hidden transition-all duration-300 ${!isUpcoming ? 'cursor-pointer hover:scale-[1.03] hover:shadow-xl' : 'cursor-default opacity-80'}`}
      style={{
        background: '#1a1a2e',
        border: '1px solid rgba(255,255,255,0.06)',
        animation: `fadeInUp 0.5s ease ${index * 0.05}s both`
      }}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
        {anime.image ? (
          <img
            src={anime.image}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film size={40} style={{ color: '#444' }} />
          </div>
        )}
        
        {!isUpcoming && (
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'rgba(0,0,0,0.7)' }}
          >
            <div className="rounded-full p-4 transition-transform duration-300 group-hover:scale-110" style={{ background: '#E63946' }}>
              <Play size={28} fill="white" color="white" />
            </div>
          </div>
        )}

        {isUpcoming && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <div className="px-4 py-2 rounded-lg flex items-center gap-2" style={{ background: 'rgba(0,0,0,0.8)' }}>
              <Clock size={20} style={{ color: '#FBBF24' }} />
              <span className="text-sm font-bold" style={{ color: '#FBBF24' }}>Coming Soon</span>
            </div>
          </div>
        )}

        {anime.score && !isUpcoming && (
          <div
            className="absolute top-2 right-2 flex items-center gap-0.5 px-2 py-1 rounded-md text-xs font-bold"
            style={{ background: 'rgba(0,0,0,0.8)', color: '#FBBF24' }}
          >
            <Star size={10} fill="#FBBF24" stroke="none" />
            {anime.score}
          </div>
        )}

        {anime.episodes && !isUpcoming && (
          <div
            className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md text-xs"
            style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}
          >
            <Tv size={10} />
            {anime.episodes}
          </div>
        )}

        {anime.format && (
          <div
            className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-medium"
            style={{ background: isUpcoming ? 'rgba(251,191,36,0.9)' : 'rgba(230,57,70,0.9)', color: '#fff' }}
          >
            {isUpcoming ? 'Soon' : anime.format}
          </div>
        )}

        {!isUpcoming && (
          <div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <div
              className="h-full transition-all duration-500"
              style={{ 
                width: `${Math.random() * 30}%`,
                background: 'linear-gradient(90deg, #E63946, #ff6b6b)'
              }}
            />
          </div>
        )}
      </div>

      <div className="p-3">
        <h3
          className={`font-semibold text-sm line-clamp-2 leading-snug ${!isUpcoming ? 'group-hover:text-[#E63946]' : ''} transition-colors`}
          style={{ color: '#e0e0e0' }}
        >
          {anime.title}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {anime.year && (
              <span className="flex items-center gap-0.5">
                <Calendar size={10} />
                {anime.year}
              </span>
            )}
            {anime.genres && anime.genres.length > 0 && (
              <span>• {anime.genres.slice(0, 2).join(', ')}</span>
            )}
          </div>
          {isUpcoming && (
            <span className="text-xs" style={{ color: '#FBBF24' }}>
              <Clock size={10} className="inline mr-1" />
              Soon
            </span>
          )}
          {!isUpcoming && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onInfo()
              }}
              className="p-1 rounded-lg transition-all duration-200 hover:bg-white/10 hover:scale-110"
              style={{ color: '#888' }}
              title="More Info"
            >
              <Sparkles size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Info Modal
// ============================================

function InfoModal({ 
  anime, 
  onClose 
}: { 
  anime: any
  onClose: () => void
}) {
  if (!anime) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl overflow-y-auto"
        style={{ background: '#1a1a2e' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 p-4 flex items-center justify-between" style={{ background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <Sparkles size={20} style={{ color: '#E63946' }} />
            <h3 className="text-lg font-bold text-white">Anime Details</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: '#fff' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {anime.image && (
              <img
                src={anime.image}
                alt={anime.title}
                className="w-full md:w-48 h-64 object-cover rounded-xl flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                {anime.title}
              </h2>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {anime.genres?.slice(0, 4).map((genre: string) => (
                  <span key={genre} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(230,57,70,0.15)', color: '#E63946' }}>
                    {genre}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>
                  <span className="text-gray-500">Score</span>
                  <p className="text-white font-medium flex items-center gap-1">
                    <Star size={14} fill="#FBBF24" style={{ color: '#FBBF24' }} />
                    {anime.score || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Status</span>
                  <p className="text-white font-medium">{anime.status || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Episodes</span>
                  <p className="text-white font-medium">{anime.episodes || '?'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Type</span>
                  <p className="text-white font-medium">{anime.format || 'TV'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Year</span>
                  <p className="text-white font-medium">{anime.year || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Popularity</span>
                  <p className="text-white font-medium">{anime.popularity?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>

              {anime.description && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">Synopsis</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {anime.description.replace(/<[^>]*>/g, '')}
                  </p>
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    onClose()
                    toast('Streaming feature coming soon!', { icon: '🎬' })
                  }}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ background: '#E63946', color: '#fff' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(230,57,70,0.4)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <Play size={16} fill="white" />
                  Watch
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export default function AnimeSearch() {
  const navigate = useNavigate()
  
  const [q, setQ] = useState('')
  const [searched, setSearched] = useState('')
  const [category, setCategory] = useState('trending')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [selectedAnime, setSelectedAnime] = useState<any>(null)
  const [showInfoModal, setShowInfoModal] = useState(false)

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['anime-trending', category],
    queryFn: () => fetchTrending(category),
    staleTime: 1000 * 60 * 5,
  })

  const { data: results, isLoading: searchLoading } = useQuery({
    queryKey: ['anime-search', searched],
    queryFn: () => fetchSearch(searched),
    enabled: !!searched,
    staleTime: 1000 * 60 * 5,
  })

  const isLoading = searched ? searchLoading : trendingLoading
  const list: any[] = searched ? (results || []) : (trending || [])
  const featuredAnime = list.length > 0 ? list[0] : null

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) {
      setSearched(q.trim())
    }
  }

  const clearSearch = () => {
    setSearched('')
    setQ('')
  }

  const handleWatch = () => {
    toast('Streaming feature coming soon! 🎬')
  }

  const handleOpenInfo = (anime: any) => {
    setSelectedAnime(anime)
    setShowInfoModal(true)
  }

  const handleCategoryChange = (cat: string) => {
    setCategory(cat)
    if (searched) clearSearch()
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://files.catbox.moe/8anicu.png" 
              alt="OtakuBate Logo" 
              className="h-12 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">OtakuBate</h1>
              <p className="text-xs text-gray-500">Discover Anime</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('grid')}
              className="p-2 rounded-lg transition-colors"
              style={{ background: viewMode === 'grid' ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff' }}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="p-2 rounded-lg transition-colors"
              style={{ background: viewMode === 'list' ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff' }}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div
              className="relative flex-1 rounded-xl transition-all duration-200"
              style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: '#666' }} />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search anime..."
                className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none"
                style={{ background: 'transparent', color: '#fff', fontSize: '14px' }}
                onFocus={e => {
                  e.currentTarget.parentElement!.style.borderColor = '#E63946'
                }}
                onBlur={e => {
                  e.currentTarget.parentElement!.style.borderColor = 'rgba(255,255,255,0.06)'
                }}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
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
              <Search size={16} />
              Search
            </button>
          </div>
        </form>

        {/* Categories */}
        {!searched && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className="px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
                  style={{
                    background: category === cat.value ? '#E63946' : 'rgba(255,255,255,0.05)',
                    color: category === cat.value ? '#fff' : '#888',
                    border: category === cat.value ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Icon size={12} />
                  {cat.label}
                </button>
              )
            })}
          </div>
        )}

        {/* Results */}
        {list.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {searched ? (
              <>
                <Search size={14} style={{ color: '#E63946' }} />
                <span className="text-sm text-gray-400">
                  Results for "<span style={{ color: '#E63946' }}>{searched}</span>"
                </span>
                <button
                  onClick={clearSearch}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(230,57,70,0.1)', color: '#E63946' }}
                >
                  clear
                </button>
              </>
            ) : (
              <span className="text-sm text-gray-400">
                {CATEGORIES.find(c => c.value === category)?.label} Anime
              </span>
            )}
            <span className="text-xs text-gray-500 ml-auto">{list.length} titles</span>
          </div>
        )}

        {/* Hero */}
        {!isLoading && list.length > 0 && !searched && (
          <HeroSection 
            anime={featuredAnime} 
            onWatch={handleWatch}
            onInfo={() => handleOpenInfo(featuredAnime)}
            category={category}
          />
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Spinner size={48} />
          </div>
        )}

        {/* Grid */}
        {!isLoading && list.length > 0 && (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
            : 'space-y-3'
          }>
            {list.map((anime: any, index: number) => (
              viewMode === 'grid' ? (
                <AnimeCard 
                  key={anime.id || index} 
                  anime={anime} 
                  index={index}
                  category={category}
                  onClick={handleWatch}
                  onInfo={() => handleOpenInfo(anime)}
                />
              ) : (
                <div
                  key={anime.id || index}
                  className={`flex gap-4 p-3 rounded-xl transition-all duration-200 ${category !== 'upcoming' ? 'cursor-pointer hover:bg-white/5' : 'cursor-default opacity-80'}`}
                  style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {anime.image && (
                    <img
                      src={anime.image}
                      alt={anime.title}
                      className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={handleWatch}
                  >
                    <h3 className="text-sm font-semibold text-white truncate">
                      {anime.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                      {anime.description?.replace(/<[^>]*>/g, '').slice(0, 150) || 'No synopsis available.'}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {anime.score && category !== 'upcoming' && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24' }}>
                          <Star size={10} className="inline mr-1" fill="#FBBF24" />
                          {anime.score}
                        </span>
                      )}
                      {anime.episodes && category !== 'upcoming' && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#888' }}>
                          <Tv size={10} className="inline mr-1" />
                          {anime.episodes}
                        </span>
                      )}
                      {anime.format && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: category === 'upcoming' ? 'rgba(251,191,36,0.1)' : 'rgba(230,57,70,0.1)', color: category === 'upcoming' ? '#FBBF24' : '#E63946' }}>
                          {category === 'upcoming' ? 'Coming Soon' : anime.format}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-center">
                    <button
                      onClick={handleWatch}
                      className="p-2 rounded-lg transition-colors hover:bg-white/10"
                      style={{ color: '#888' }}
                    >
                      <Play size={18} />
                    </button>
                    <button
                      onClick={() => handleOpenInfo(anime)}
                      className="p-2 rounded-lg transition-colors hover:bg-white/10"
                      style={{ color: '#666' }}
                      title="More Info"
                    >
                      <Sparkles size={16} />
                    </button>
                    {category === 'upcoming' && (
                      <div className="p-2 rounded-lg" style={{ color: '#555' }}>
                        <Clock size={18} />
                      </div>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && list.length === 0 && (
          <div
            className="text-center py-20 rounded-2xl"
            style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Film size={48} className="mx-auto mb-3" style={{ color: '#444' }} />
            <p className="text-sm font-medium text-white">No anime found</p>
            <p className="text-sm text-gray-500 mt-1">Try searching with a different title</p>
          </div>
        )}

        {/* Info Modal */}
        {showInfoModal && selectedAnime && (
          <InfoModal
            anime={selectedAnime}
            onClose={() => setShowInfoModal(false)}
          />
        )}
      </div>

      <style>{`
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