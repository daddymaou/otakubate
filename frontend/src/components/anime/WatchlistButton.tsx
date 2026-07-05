import { useState, useRef, useEffect } from 'react'
import { Heart, ChevronDown, Eye, Clock, CheckCircle, Bookmark, X, Sparkles } from 'lucide-react'
import { useWatchlist } from '../../hooks/useWatchlist'
import toast from 'react-hot-toast'

interface WatchlistButtonProps {
  animeId: number
  title: string
  image: string
  currentStatus?: string
  size?: 'sm' | 'md' | 'lg'
}

const STATUS_OPTIONS = [
  { value: 'watching', label: 'Watching', icon: Eye, color: '#E63946' },
  { value: 'planning', label: 'Planning', icon: Clock, color: '#FBBF24' },
  { value: 'completed', label: 'Completed', icon: CheckCircle, color: '#2ED573' },
  { value: 'on_hold', label: 'On Hold', icon: Bookmark, color: '#FF9F43' },
  { value: 'dropped', label: 'Dropped', icon: X, color: '#999' },
]

export default function WatchlistButton({ 
  animeId, 
  title, 
  image, 
  currentStatus = 'planning',
  size = 'md'
}: WatchlistButtonProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, updateWatchlistItem, getWatchlistItem } = useWatchlist()
  const [loading, setLoading] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const inList = isInWatchlist(animeId)
  const watchlistItem = getWatchlistItem(animeId)
  const currentStatusValue = watchlistItem?.status || currentStatus

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (loading) return

    if (inList) {
      // If already in watchlist, open dropdown to change status
      setIsDropdownOpen(!isDropdownOpen)
    } else {
      // If not in watchlist, add it
      setLoading(true)
      try {
        await addToWatchlist({ id: animeId, title, image, status: 'planning' })
        // After adding, show dropdown to let user change status
        setTimeout(() => setIsDropdownOpen(true), 300)
      } catch (error) {
        toast.error('Something went wrong')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleStatusChange = async (status: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setLoading(true)
    try {
      if (inList) {
        await updateWatchlistItem(animeId, { status })
      } else {
        await addToWatchlist({ id: animeId, title, image, status })
      }
      setIsDropdownOpen(false)
      const statusLabel = STATUS_OPTIONS.find(s => s.value === status)?.label || status
      toast.success(`Added to "${statusLabel}"`)
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setLoading(true)
    try {
      await removeFromWatchlist(animeId)
      setIsDropdownOpen(false)
      toast.success('Removed from watchlist')
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const sizes = {
    sm: { padding: '6px', icon: 16, fontSize: '11px', gap: '4px' },
    md: { padding: '8px 12px', icon: 18, fontSize: '12px', gap: '6px' },
    lg: { padding: '10px 16px', icon: 20, fontSize: '13px', gap: '8px' }
  }

  const { padding, icon, fontSize, gap } = sizes[size]

  // Get current status label and icon
  const currentStatusOption = STATUS_OPTIONS.find(s => s.value === currentStatusValue)
  const StatusIcon = currentStatusOption?.icon || Heart
  const statusColor = currentStatusOption?.color || '#E63946'

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={handleToggle}
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: gap,
          padding: padding,
          borderRadius: '10px',
          background: inList ? `rgba(230,57,70,0.08)` : 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(10px)',
          border: inList ? `1px solid rgba(230,57,70,0.15)` : '1px solid rgba(26,26,46,0.06)',
          cursor: loading ? 'wait' : 'pointer',
          transition: 'all 0.2s ease',
          color: inList ? '#E63946' : '#999',
          fontSize: fontSize,
          fontWeight: 500,
          position: 'relative',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = 'none'
        }}
        title={inList ? 'Manage watchlist' : 'Add to watchlist'}
      >
        <Heart
          size={icon}
          fill={inList ? '#E63946' : 'none'}
          style={{
            transition: 'all 0.2s ease',
            transform: loading ? 'scale(0.8)' : 'scale(1)'
          }}
        />
        {inList && size !== 'sm' && (
          <>
            <span style={{ color: '#1a1a2e' }}>
              {currentStatusOption?.label || 'Watchlist'}
            </span>
            <ChevronDown 
              size={14} 
              style={{ 
                transition: 'transform 0.2s ease',
                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }} 
            />
          </>
        )}
        {!inList && size !== 'sm' && (
          <span style={{ color: '#1a1a2e' }}>Add</span>
        )}
      </button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: '180px',
            background: '#FFF8EE',
            borderRadius: '12px',
            border: '1px solid rgba(26,26,46,0.08)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            zIndex: 100,
            backdropFilter: 'blur(10px)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: '10px 14px',
            borderBottom: '1px solid rgba(26,26,46,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a2e' }}>
              <Sparkles size={12} style={{ display: 'inline', marginRight: '6px', color: '#E63946' }} />
              Status
            </span>
            <button
              onClick={handleRemove}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(230,57,70,0.08)',
                border: 'none',
                color: '#E63946',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(230,57,70,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(230,57,70,0.08)'}
            >
              Remove
            </button>
          </div>

          {/* Status options */}
          <div style={{ padding: '6px' }}>
            {STATUS_OPTIONS.map((option) => {
              const Icon = option.icon
              const isActive = currentStatusValue === option.value
              return (
                <button
                  key={option.value}
                  onClick={(e) => handleStatusChange(option.value, e)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: isActive ? 'rgba(230,57,70,0.08)' : 'transparent',
                    border: 'none',
                    color: isActive ? '#E63946' : '#1a1a2e',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontWeight: isActive ? 600 : 400
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(26,26,46,0.04)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  <Icon size={16} style={{ color: option.color }} />
                  <span style={{ flex: 1, textAlign: 'left' }}>{option.label}</span>
                  {isActive && (
                    <span style={{ color: '#E63946', fontSize: '14px' }}>✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}