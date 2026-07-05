import { NavLink } from 'react-router-dom'
import { Home, Compass, Users, MessageCircle, Bell, User, Settings, Tv, Shield } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'

const links = [
  { to: '/feed', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Friends' },
  { to: '/clubs', icon: Users, label: 'Clubs' },
  { to: '/anime', icon: Tv, label: 'Anime' },
  { to: '/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
]

export default function Sidebar() {
  const { user } = useAuthStore()
  
  // Fetch notification unread count - OPTIMIZED to prevent 429
  const { data: notifData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/notifications/unread-count')
        return data
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.warn('Rate limited, using cached notification count')
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
  
  // Fetch message unread count - OPTIMIZED to prevent 429
  const { data: msgData } = useQuery({
    queryKey: ['messages', 'unread-count'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/messages/unread/count')
        return data
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.warn('Rate limited, using cached message count')
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
  
  const notifUnreadCount = notifData?.count || 0
  const msgUnreadCount = msgData?.count || 0

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .sidebar-slide {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        .notification-ping {
          animation: ping 1.5s ease-in-out infinite;
        }
      `}</style>

      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 z-30 px-4 py-6 sidebar-slide backdrop-blur-xl bg-[#FFF8EE]/95 border-r border-[#E63946]/10 shadow-[4px_0_20px_rgba(0,0,0,0.04)]">
        <NavLink to="/feed" className="flex items-center gap-3 mb-8 px-2 transition-transform hover:scale-105 duration-300">
          <img 
            src="https://files.catbox.moe/8anicu.png" 
            alt="OtakuBate Logo" 
            className="w-9 h-9 object-contain drop-shadow-md"
          />
          <span className="text-xl font-bold tracking-tight text-[#1a1a2e]">
            Otaku<span className="text-[#E63946]">Bate</span>
          </span>
        </NavLink>

        <nav className="flex flex-col gap-1 flex-1">
          {links.map(({ to, icon: Icon, label }) => {
            let badgeCount = 0
            let badgeType = ''
            
            if (to === '/notifications') {
              badgeCount = notifUnreadCount
              badgeType = 'notif'
            } else if (to === '/messages') {
              badgeCount = msgUnreadCount
              badgeType = 'msg'
            }
            
            return (
              <NavLink 
                key={to} 
                to={to} 
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 relative ${
                    isActive 
                      ? 'bg-[rgba(230,57,70,0.1)] text-[#E63946] translate-x-1' 
                      : 'text-gray-500 hover:text-[#1a1a2e] hover:bg-[rgba(26,26,46,0.05)]'
                  }`
                }
              >
                <Icon size={20} strokeWidth={1.8} />
                <span>{label}</span>
                {/* Badge for notifications */}
                {to === '/notifications' && badgeCount > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: '#E63946', color: '#fff' }}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
                {/* Badge for messages */}
                {to === '/messages' && badgeCount > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: '#3B82F6', color: '#fff' }}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </NavLink>
            )
          })}
          
          {user?.isAdmin && (
            <NavLink 
              to="/admin" 
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-[rgba(230,57,70,0.1)] text-[#E63946] translate-x-1' 
                    : 'text-gray-500 hover:text-[#1a1a2e] hover:bg-[rgba(26,26,46,0.05)]'
                }`
              }
            >
              <Shield size={20} strokeWidth={1.8} />
              <span>Admin</span>
            </NavLink>
          )}
        </nav>

        <div className="flex flex-col gap-1 border-t pt-4 border-[#E63946]/10">
          <NavLink 
            to={`/profile/${user?.username}`} 
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-[rgba(230,57,70,0.1)] text-[#E63946]' 
                  : 'text-gray-500 hover:text-[#1a1a2e] hover:bg-[rgba(26,26,46,0.05)]'
              }`
            }
          >
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[rgba(230,57,70,0.2)]" 
                alt={user.username}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[rgba(230,57,70,0.1)] flex items-center justify-center">
                <User size={16} className="text-[#E63946]" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm truncate text-[#1a1a2e]">
                {user?.displayName || user?.username}
              </div>
              <div className="text-xs truncate text-gray-400">
                @{user?.username}
              </div>
            </div>
          </NavLink>
          
          <NavLink 
            to="/settings" 
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-[rgba(230,57,70,0.1)] text-[#E63946]' 
                  : 'text-gray-500 hover:text-[#1a1a2e] hover:bg-[rgba(26,26,46,0.05)]'
              }`
            }
          >
            <Settings size={20} strokeWidth={1.8} />
            <span className="font-medium">Settings</span>
          </NavLink>
        </div>
      </aside>
    </>
  )
}