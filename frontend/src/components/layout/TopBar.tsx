import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Search, User, Settings, Home } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import NotificationBell from '../notifications/NotificationBell'

export default function TopBar() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  
  const isSettingsPage = location.pathname === '/settings' || location.pathname.startsWith('/settings/')
  const isProfilePage = location.pathname.startsWith('/profile/')

  // Determine what the left icon should be
  const getLeftIcon = () => {
    if (isSettingsPage) {
      return {
        icon: <Home size={20} strokeWidth={1.8} />,
        action: () => navigate('/feed'),
        label: 'Home'
      }
    }
    if (isProfilePage && !isSettingsPage) {
      return {
        icon: <Settings size={20} strokeWidth={1.8} />,
        action: () => navigate('/settings'),
        label: 'Settings'
      }
    }
    return {
      icon: <Settings size={20} strokeWidth={1.8} />,
      action: () => navigate('/settings'),
      label: 'Settings'
    }
  }

  const leftIcon = getLeftIcon()

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeScale {
          0% {
            opacity: 0;
            transform: scale(0.8) rotate(-10deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        
        @keyframes logoSlide {
          0% {
            opacity: 0;
            transform: translateX(-20px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        @keyframes iconRotate {
          0% {
            transform: rotate(0deg) scale(0.5);
            opacity: 0;
          }
          100% {
            transform: rotate(360deg) scale(1);
            opacity: 1;
          }
        }
        
        .topbar-slide {
          animation: slideDown 0.3s ease-out;
        }
        
        .logo-animate {
          animation: logoSlide 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .icon-animate {
          animation: iconRotate 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .fade-scale {
          animation: fadeScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .icon-transition {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .logo-transition {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      <header 
        className="md:hidden sticky top-0 z-20 px-3 py-3 flex items-center justify-between topbar-slide"
        style={{
          background: 'rgba(255, 248, 238, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(230, 57, 70, 0.12)',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Left - Dynamic Icon (Always Settings or Home) */}
        <button 
          onClick={leftIcon.action} 
          className="p-2 rounded-xl transition-all duration-200 hover:bg-black/5 active:scale-95 group icon-transition"
          style={{
            color: '#999',
            background: 'transparent'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(26, 26, 46, 0.05)'
            e.currentTarget.style.color = '#1a1a2e'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#999'
          }}
        >
          <span className="icon-animate">
            {leftIcon.icon}
          </span>
        </button>

        {/* Center - Logo with smooth animation */}
        <NavLink 
          to="/feed" 
          className="flex items-center gap-2 logo-transition hover:scale-105 duration-300"
        >
          <img 
            src="https://files.catbox.moe/8anicu.png" 
            alt="OtakuBate Logo" 
            className="w-7 h-7 object-contain logo-animate"
            style={{
              filter: 'drop-shadow(0 2px 6px rgba(230, 57, 70, 0.2))'
            }}
          />
          <span className="text-lg font-bold tracking-tight logo-animate" style={{ color: '#1a1a2e' }}>
            Otaku<span style={{ color: '#E63946' }}>Bate</span>
          </span>
        </NavLink>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {/* Search Button */}
          <button 
            onClick={() => navigate('/explore')} 
            className="p-2 rounded-xl transition-all duration-200 hover:bg-black/5 active:scale-95"
            style={{
              color: '#999',
              background: 'transparent'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(26, 26, 46, 0.05)'
              e.currentTarget.style.color = '#1a1a2e'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#999'
            }}
          >
            <Search size={20} strokeWidth={1.8} />
          </button>

          {/* Notifications Bell Component - Mobile version */}
          <NotificationBell isMobile={true} />

          {/* Profile Link */}
          <NavLink 
            to={`/profile/${user?.username}`}
            className="transition-transform hover:scale-105 duration-200 active:scale-95"
          >
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[rgba(230,57,70,0.2)]" 
                alt={user.username}
              />
            ) : (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  background: 'rgba(230, 57, 70, 0.1)',
                  color: '#E63946'
                }}
              >
                <User size={16} strokeWidth={1.8} />
              </div>
            )}
          </NavLink>
        </div>
      </header>
    </>
  )
}