interface Props { 
  src?: string; 
  name?: string; 
  size?: number; 
  className?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
}

export default function Avatar({ 
  src, 
  name, 
  size = 40, 
  className = '',
  status,
  showStatus = false
}: Props) {
  const initials = name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?'
  
  const statusColors = {
    online: '#10B981',
    offline: '#9CA3AF',
    away: '#F4C430',
    busy: '#E63946'
  }

  const statusBorderColors = {
    online: 'rgba(16, 185, 129, 0.2)',
    offline: 'rgba(156, 163, 175, 0.2)',
    away: 'rgba(244, 196, 48, 0.2)',
    busy: 'rgba(230, 57, 70, 0.2)'
  }

  const isGoogleAvatar = src?.includes('googleusercontent.com') || src?.includes('lh3.googleusercontent.com')
  const avatarSrc = isGoogleAvatar ? undefined : src

  return (
    <div 
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {avatarSrc ? (
        <img 
          src={avatarSrc} 
          alt={name || 'Avatar'} 
          style={{ 
            width: size, 
            height: size,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            border: showStatus && status ? `2px solid ${statusBorderColors[status]}` : 'none'
          }}
          className="rounded-full object-cover transition-all duration-200 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
            const parent = (e.target as HTMLImageElement).parentElement
            if (parent) {
              const initialsDiv = document.createElement('div')
              initialsDiv.className = 'rounded-full flex items-center justify-center font-bold transition-all duration-200'
              initialsDiv.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                font-size: ${size * 0.35}px;
                background: linear-gradient(135deg, rgba(230, 57, 70, 0.1) 0%, rgba(26, 26, 46, 0.08) 100%);
                border: 1px solid rgba(230, 57, 70, 0.2);
                color: #E63946;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
              `
              initialsDiv.textContent = initials
              parent.appendChild(initialsDiv)
            }
          }}
        />
      ) : (
        <div 
          style={{ 
            width: size, 
            height: size, 
            fontSize: size * 0.35,
            background: 'linear-gradient(135deg, rgba(230, 57, 70, 0.1) 0%, rgba(26, 26, 46, 0.08) 100%)',
            border: '1px solid rgba(230, 57, 70, 0.2)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            color: '#E63946'
          }}
          className="rounded-full flex items-center justify-center font-bold transition-all duration-200 hover:scale-105"
        >
          {initials}
        </div>
      )}
      
      {/* Status Indicator */}
      {showStatus && status && (
        <div 
          className="absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-[#1a1a2e]"
          style={{
            width: size * 0.3,
            height: size * 0.3,
            minWidth: size * 0.3,
            minHeight: size * 0.3,
            backgroundColor: statusColors[status],
            boxShadow: '0 0 0 2px #FFF8EE'
          }}
        />
      )}
    </div>
  )
}