import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

interface SeasonPickerProps {
  onSeasonChange: (year: number, season: string) => void
  defaultYear?: number
  defaultSeason?: string
}

const SEASONS = [
  { label: 'Winter', value: 'winter' },
  { label: 'Spring', value: 'spring' },
  { label: 'Summer', value: 'summer' },
  { label: 'Fall', value: 'fall' }
]

export default function SeasonPicker({ 
  onSeasonChange, 
  defaultYear, 
  defaultSeason 
}: SeasonPickerProps) {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(defaultYear || currentYear)
  const [season, setSeason] = useState(defaultSeason || 'winter')
  const [isOpen, setIsOpen] = useState(false)

  const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

  const handleYearChange = (selectedYear: number) => {
    setYear(selectedYear)
    onSeasonChange(selectedYear, season)
  }

  const handleSeasonChange = (selectedSeason: string) => {
    setSeason(selectedSeason)
    setIsOpen(false)
    onSeasonChange(year, selectedSeason)
  }

  const getSeasonEmoji = (seasonValue: string) => {
    const emojis: { [key: string]: string } = {
      'winter': '❄️',
      'spring': '🌸',
      'summer': '☀️',
      'fall': '🍂'
    }
    return emojis[seasonValue] || '📅'
  }

  const currentSeasonLabel = SEASONS.find(s => s.value === season)?.label || 'Winter'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap'
    }}>
      {/* Season Dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(26,26,46,0.08)',
            color: '#1a1a2e',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.7)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.5)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <span>{getSeasonEmoji(season)}</span>
          <span>{currentSeasonLabel}</span>
          <ChevronDown size={16} style={{ 
            color: '#999',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease'
          }} />
        </button>

        {isOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            minWidth: '140px',
            background: '#FFF8EE',
            borderRadius: '12px',
            border: '1px solid rgba(26,26,46,0.08)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            zIndex: 50
          }}>
            {SEASONS.map((s) => (
              <button
                key={s.value}
                onClick={() => handleSeasonChange(s.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 16px',
                  background: s.value === season ? 'rgba(230,57,70,0.08)' : 'transparent',
                  border: 'none',
                  color: s.value === season ? '#E63946' : '#1a1a2e',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(26,26,46,0.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = s.value === season ? 'rgba(230,57,70,0.08)' : 'transparent'
                }}
              >
                <span>{getSeasonEmoji(s.value)}</span>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Year Selector */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(26,26,46,0.08)'
      }}>
        <Calendar size={16} style={{ color: '#999' }} />
        <select
          value={year}
          onChange={(e) => handleYearChange(Number(e.target.value))}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#1a1a2e',
            fontSize: '14px',
            fontWeight: 500,
            outline: 'none',
            cursor: 'pointer',
            padding: '2px 0'
          }}
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  )
}