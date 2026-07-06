import { useNavigate } from 'react-router-dom'
import { Home, Tv, Users, MessageCircle, Settings, Plus, Bell, Compass } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'

const links = [
  { to: '/clubs', icon: Users, label: 'Crew' },
  { to: '/messages', icon: MessageCircle, label: 'Chat' },
  { to: '/feed', icon: Home, label: 'Home' },
  { to: '/anime', icon: Tv, label: 'Anime' },
  { to: '/settings', icon: Settings, label: 'Menu' },
]

export default function BottomNav() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // Fetch message unread count for badge
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

  return (
    <>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        .pulse-dot {
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
        .nav-item:active {
          transform: scale(0.92);
        }
      `}</style>

      {/* Bottom Navigation Bar - Fixed at bottom */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 z-30"
        style={{
          background: 'rgba(255, 248, 238, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(230, 57, 70, 0.1)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div className="flex justify-around items-center px-2 py-2 max-w-md mx-auto">
          {links.map(({ to, icon: Icon, label }) => {
            const isMessages = to === '/messages'
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="nav-item flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all duration-150 hover:bg-black/5 relative"
                style={{ color: '#999' }}
              >
                <div className="relative">
                  <Icon size={22} strokeWidth={1.8} />
                  {isMessages && msgUnreadCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center pulse-dot"
                      style={{ background: '#3B82F6', color: '#fff' }}
                    >
                      {msgUnreadCount > 99 ? '99+' : msgUnreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-medium tracking-wide">{label}</span>
              </button>
            )
          })}
        </div>
        
        {/* Safe area spacer for iOS */}
        <div className="h-safe-bottom" style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>
    </>
  )
}