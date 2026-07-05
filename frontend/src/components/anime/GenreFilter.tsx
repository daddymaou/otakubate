import { useState } from 'react'
import { Tag, X } from 'lucide-react'

interface GenreFilterProps {
  selectedGenres: string[]
  onGenreChange: (genres: string[]) => void
}

const POPULAR_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Romance', 'Sci-Fi', 'Slice of Life', 'Thriller', 'Mystery',
  'Horror', 'Supernatural', 'Sports', 'Music', 'Mecha',
  'Historical', 'Psychological', 'Seinen', 'Shounen', 'Shoujo'
]

export default function GenreFilter({ selectedGenres, onGenreChange }: GenreFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      onGenreChange(selectedGenres.filter(g => g !== genre))
    } else {
      onGenreChange([...selectedGenres, genre])
    }
  }

  const clearAll = () => {
    onGenreChange([])
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '12px',
          background: selectedGenres.length > 0 ? 'rgba(230,57,70,0.1)' : 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(10px)',
          border: selectedGenres.length > 0 ? '1px solid rgba(230,57,70,0.2)' : '1px solid rgba(26,26,46,0.08)',
          color: selectedGenres.length > 0 ? '#E63946' : '#1a1a2e',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = selectedGenres.length > 0 ? 'rgba(230,57,70,0.15)' : 'rgba(255,255,255,0.7)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = selectedGenres.length > 0 ? 'rgba(230,57,70,0.1)' : 'rgba(255,255,255,0.5)'
        }}
      >
        <Tag size={16} />
        <span>Genres</span>
        {selectedGenres.length > 0 && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 8px',
            borderRadius: '12px',
            background: '#E63946',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 600,
            minWidth: '20px',
            height: '20px'
          }}>
            {selectedGenres.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          width: '320px',
          maxHeight: '320px',
          overflowY: 'auto',
          background: '#FFF8EE',
          borderRadius: '16px',
          border: '1px solid rgba(26,26,46,0.08)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          padding: '16px',
          zIndex: 50
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#1a1a2e'
            }}>
              Filter by Genre
            </span>
            {selectedGenres.length > 0 && (
              <button
                onClick={clearAll}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: 'rgba(26,26,46,0.05)',
                  border: 'none',
                  color: '#999',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(26,26,46,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(26,26,46,0.05)'}
              >
                <X size={12} />
                Clear all
              </button>
            )}
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px'
          }}>
            {POPULAR_GENRES.map((genre) => {
              const isSelected = selectedGenres.includes(genre)
              return (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    background: isSelected ? '#E63946' : 'rgba(255,255,255,0.5)',
                    border: isSelected ? 'none' : '1px solid rgba(26,26,46,0.08)',
                    color: isSelected ? '#fff' : '#1a1a2e',
                    fontSize: '12px',
                    fontWeight: isSelected ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
                      e.currentTarget.style.transform = 'scale(1.05)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.5)'
                      e.currentTarget.style.transform = 'scale(1)'
                    }
                  }}
                >
                  {genre}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}