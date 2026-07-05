import { ExternalLink, Globe } from 'lucide-react'

interface WhereToWatchProps {
  externalLinks: Array<{
    url: string
    site: string
    type: string
    language: string | null
  }>
}

export default function WhereToWatch({ externalLinks }: WhereToWatchProps) {
  // Filter out only streaming links
  const streamingLinks = externalLinks?.filter(link => 
    link.type === 'STREAMING' || 
    link.site?.includes('Crunchyroll') ||
    link.site?.includes('Netflix') ||
    link.site?.includes('Hulu') ||
    link.site?.includes('Prime') ||
    link.site?.includes('HiDive') ||
    link.site?.includes('Funimation')
  ) || []

  // Format site names for display
  const formatSiteName = (site: string) => {
    const names: { [key: string]: string } = {
      'Crunchyroll': 'Crunchyroll',
      'Netflix': 'Netflix',
      'Hulu': 'Hulu',
      'Amazon Prime': 'Amazon Prime',
      'HiDive': 'HiDive',
      'Funimation': 'Funimation',
      'VRV': 'VRV',
      'HIDIVE': 'HiDive',
      'Prime Video': 'Amazon Prime',
      'ANIPLUS': 'Aniplus',
      'Wakanim': 'Wakanim'
    }
    return names[site] || site
  }

  // Get site color
  const getSiteColor = (site: string) => {
    const colors: { [key: string]: string } = {
      'Crunchyroll': '#F47521',
      'Netflix': '#E50914',
      'Hulu': '#1CE783',
      'Amazon Prime': '#00A8E1',
      'HiDive': '#00A3E0',
      'Funimation': '#5B0BB5',
      'VRV': '#FF9933'
    }
    return colors[site] || '#E63946'
  }

  if (streamingLinks.length === 0) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(26,26,46,0.06)'
      }}>
        <Globe size={24} style={{ color: '#999', marginBottom: '8px' }} />
        <p style={{ fontSize: '14px', color: '#999' }}>
          No streaming links available
        </p>
        <p style={{ fontSize: '12px', color: '#bbb' }}>
          Check back later or search on your preferred platform
        </p>
      </div>
    )
  }

  return (
    <div>
      <h4 style={{
        fontSize: '14px',
        fontWeight: 600,
        color: '#1a1a2e',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Globe size={18} style={{ color: '#E63946' }} />
        Where to Watch
      </h4>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {streamingLinks.map((link, index) => {
          const siteName = formatSiteName(link.site)
          const color = getSiteColor(link.site)

          return (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(26,26,46,0.06)',
                color: '#1a1a2e',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'
                e.currentTarget.style.borderColor = color
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                e.currentTarget.style.borderColor = 'rgba(26,26,46,0.06)'
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: color,
                flexShrink: 0
              }} />
              {siteName}
              {link.language && (
                <span style={{
                  fontSize: '10px',
                  color: '#999',
                  fontWeight: 400
                }}>
                  {link.language}
                </span>
              )}
              <ExternalLink size={14} style={{ color: '#999' }} />
            </a>
          )
        })}
      </div>
    </div>
  )
}