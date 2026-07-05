import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Tv, Users, MessageCircle, Settings, Plus, Bell, Compass } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import NotificationBell from '../notifications/NotificationBell'

const links = [
  { to: '/clubs', icon: Users, label: 'Crew' },
  { to: '/messages', icon: MessageCircle, label: 'Chat' },
  { to: '/feed', icon: Home, label: 'Home' },
  { to: '/anime', icon: Tv, label: 'Anime' },
  { to: '/settings', icon: Settings, label: 'Menu' },
]

export default function ExpandableNav() {
  const { user } = useAuthStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const navRef = useRef(null)
  const navigate = useNavigate()

  // Fetch message unread count for badge - OPTIMIZED to prevent 429
  const { data: msgData } = useQuery({
    queryKey: ['messages', 'unread-count'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/messages/unread/count')
        return data
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.warn('Rate limited, using cached unread count')
          return { count: 0 }
        }
        throw error
      }
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 60000,
    staleTime: 50000,
    gcTime: 120000,
    retry: 1,
    retryDelay: 5000,
  })

  const msgUnreadCount = msgData?.count || 0

  const closeWithAnimation = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsExpanded(false)
      setIsClosing(false)
    }, 250)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        closeWithAnimation()
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isExpanded])

  const handleNavClick = (to) => {
    navigate(to)
    closeWithAnimation()
  }

  // Find if messages is in the links
  const messagesLink = links.find(l => l.to === '/messages')

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
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
        @keyframes fadeOutDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(20px);
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes scaleOut {
          from {
            transform: scale(1);
            opacity: 1;
          }
          to {
            transform: scale(0.95);
            opacity: 0;
          }
        }
        
        .fab-container {
          animation: slideUp 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        .expanded-pill {
          animation: scaleIn 0.25s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
        }
        .expanded-pill.closing {
          animation: scaleOut 0.2s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
        }
        .nav-items {
          animation: fadeInUp 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        .nav-items.closing {
          animation: fadeOutDown 0.2s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
        }
        .fab-button:active {
          transform: scale(0.92);
        }
        .nav-item {
          transition: all 0.15s ease;
          position: relative;
        }
        .nav-item:active {
          transform: scale(0.92);
        }
        .handle-bar:active {
          transform: scaleY(1.5);
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        .pulse-dot {
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
      `}</style>

      <div ref={navRef} className="md:hidden fixed bottom-6 left-0 right-0 z-30 flex justify-center fab-container">
        {isExpanded ? (
          /* Expanded state - full width pill with icons + handle */
          <div 
            className={`expanded-pill mx-4 rounded-2xl backdrop-blur-xl overflow-hidden ${isClosing ? 'closing' : ''}`}
            style={{
              background: 'rgba(255, 248, 238, 0.95)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(230, 57, 70, 0.1)',
              maxWidth: '480px',
              width: 'calc(100% - 32px)'
            }}
          >
            {/* Nav Items */}
            <div className={`nav-items ${isClosing ? 'closing' : ''}`}>
              <div className="flex justify-around items-center px-3 pt-4 pb-2 gap-1">
                {links.map(({ to, icon: Icon, label }) => {
                  const isMessages = to === '/messages'
                  return (
                    <button
                      key={to}
                      onClick={() => handleNavClick(to)}
                      className="nav-item flex flex-col items-center gap-1 px-2 py-2 rounded-full transition-all duration-150 hover:bg-black/5 relative"
                      style={{ color: '#999' }}
                    >
                      <div className="relative">
                        <Icon size={20} strokeWidth={1.8} />
                        {isMessages && msgUnreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[8px] font-bold flex items-center justify-center pulse-dot" style={{ background: '#3B82F6', color: '#fff' }}>
                            {msgUnreadCount > 99 ? '99+' : msgUnreadCount}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-medium tracking-wide">{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* The "_" handle bar at bottom */}
            <div className="flex justify-center pb-3 pt-1">
              <button
                onClick={closeWithAnimation}
                className="handle-bar w-10 h-1 rounded-full transition-all duration-150 hover:scale-110"
                style={{
                  background: '#E63946',
                  opacity: 0.5
                }}
              />
            </div>
          </div>
        ) : (
          /* Closed state - small circular button with + */
          <button
            onClick={() => setIsExpanded(true)}
            className="fab-button flex items-center justify-center rounded-full backdrop-blur-xl transition-all duration-150 hover:scale-105 active:scale-95 relative"
            style={{
              background: 'rgba(255, 248, 238, 0.95)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(230, 57, 70, 0.2)',
              width: '52px',
              height: '52px',
              color: '#E63946'
            }}
          >
            <Plus size={24} strokeWidth={1.8} />
            {msgUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center pulse-dot" style={{ background: '#3B82F6', color: '#fff' }}>
                {msgUnreadCount > 99 ? '99+' : msgUnreadCount}
              </span>
            )}
          </button>
        )}
      </div>
    </>
  )
}