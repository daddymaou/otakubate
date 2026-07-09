import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  User, Shield, Bell, HelpCircle, FileText, LogOut, 
  Zap, ChevronRight, Palette, Sparkles, Heart, Users,
  Star, Globe, Lock, MessageSquare, Eye, KeyRound, Mail,
  Trash2, AlertTriangle, X, Check, MessageCircle, Settings as SettingsIcon,
  Ban, Unlock, Loader2
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

// ============================================
// CONFIG - Custom Avatar URL
// ============================================
const AIKO_AVATAR_URL = 'https://files.catbox.moe/8anicu.png'

// Sign Out Modal with Spinner
function SignOutModal({ onClose, onConfirm, isLoading }: { onClose: () => void; onConfirm: () => void; isLoading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={onClose}>
      <div className="relative w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}
        style={{ borderRadius: '16px 4px 16px 4px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
        <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] p-6" style={{ borderRadius: '16px 4px 16px 4px' }}>
          <div className="text-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(230,57,70,0.1)' }}>
              <LogOut size={28} style={{ color: '#E63946' }} />
            </div>
            <h3 className="text-xl font-bold mb-2 tracking-wide" style={{ color: '#1a1a2e' }}>Sign Out?</h3>
            <p className="text-sm" style={{ color: '#666' }}>Are you sure you want to sign out of your account?</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              disabled={isLoading}
              className="flex-1 py-2 text-sm font-medium transition-all hover:bg-black/5 disabled:opacity-50" 
              style={{ color: '#666', borderRadius: '12px 2px 12px 2px' }}
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm} 
              disabled={isLoading}
              className="flex-1 py-2 text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2" 
              style={{ background: '#E63946', borderRadius: '12px 2px 12px 2px' }}
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              {isLoading ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Settings() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const menuItems = [
    {
      title: 'Profile Customization',
      icon: <User size={20} />,
      description: 'Avatar, banner, personal info, and username',
      path: '/profile/customize',
      color: '#E63946',
    },
    {
      title: 'Privacy & Security',
      icon: <Shield size={20} />,
      description: 'Email, password, privacy, and account security',
      path: '/privacy-security',
      color: '#3B82F6',
    },
    {
      title: 'Notifications',
      icon: <Bell size={20} />,
      description: 'Manage what notifications you receive',
      path: '/notification-settings',
      color: '#10B981',
    },
    {
      title: 'Legal & Cookies',
      icon: <FileText size={20} />,
      description: 'Privacy policy, terms of service, and cookie preferences',
      path: '/legal-cookies',
      color: '#F59E0B',
    },
    {
      title: 'Help & Support',
      icon: <HelpCircle size={20} />,
      description: 'FAQ, guides, and contact support',
      path: '/help-support',
      color: '#8B5CF6',
    },
  ]

  const quickStats = [
    { label: 'Posts', value: user?.postsCount || 0, icon: <MessageCircle size={14} /> },
    { label: 'Followers', value: user?.followersCount || 0, icon: <Users size={14} /> },
    { label: 'Following', value: user?.followingCount || 0, icon: <User size={14} /> },
  ]

  const handleSignOut = () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    
    // Small delay to show spinner
    setTimeout(() => {
      logout()
      toast.success('Signed out successfully')
      navigate('/login')
      setIsSigningOut(false)
    }, 600)
  }

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F5F0E8 0%, #FFE8E8 100%)' }}>
      
      {/* Manga Halftone Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, #1a1a2e 1px, transparent 1px)`,
        backgroundSize: '8px 8px'
      }} />
      
      {/* Anime Action Lines - Decorative */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-10 w-48 h-0.5 bg-[#1a1a2e] rotate-45" />
        <div className="absolute top-20 right-20 w-32 h-0.5 bg-[#1a1a2e] rotate-12" />
        <div className="absolute top-30 right-5 w-40 h-0.5 bg-[#1a1a2e] -rotate-12" />
      </div>

      {showSignOutModal && (
        <SignOutModal 
          onClose={() => setShowSignOutModal(false)} 
          onConfirm={handleSignOut}
          isLoading={isSigningOut}
        />
      )}

      {/* Header - With Custom Image */}
      <div className="sticky top-0 z-20 px-4 py-5 sm:py-6" style={{ background: 'rgba(255, 248, 238, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(230,57,70,0.1)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            {/* Custom Image - No Circle, Just Clean */}
            <img 
              src={AIKO_AVATAR_URL} 
              alt="OtakuBate" 
              className="h-9 w-auto object-contain transition-all duration-300 hover:scale-105"
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(230,57,70,0.2))'
              }}
            />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wide" style={{ color: '#1a1a2e' }}>
              Settings
            </h1>
          </div>
          <p className="text-sm mt-1 ml-12" style={{ color: '#999' }}>Manage your account preferences and customize your experience</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        {/* Profile Summary Card - With Dynamic Border */}
        <div className="mb-8 p-5 bg-white shadow-sm hover:shadow-md transition-all duration-300 group" 
          style={{ 
            border: '1px solid rgba(230,57,70,0.08)',
            borderRadius: '20px 4px 20px 4px'
          }}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar 
                src={user?.avatar} 
                name={user?.displayName || user?.username} 
                size={64} 
              />
              {/* Anime-style ring pulse */}
              <div className="absolute -inset-1 rounded-full border-2 border-[#E63946]/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold tracking-wide" style={{ color: '#1a1a2e' }}>
                  {user?.displayName || user?.username}
                </h2>
                {/* ✅ REMOVED: "Verified" text badge */}
              </div>
              <p className="text-sm" style={{ color: '#999' }}>@{user?.username}</p>
              {user?.bio && (
                <p className="text-xs mt-1 max-w-md line-clamp-1" style={{ color: '#666' }}>{user.bio}</p>
              )}
            </div>
            <button 
              onClick={() => setShowSignOutModal(true)} 
              disabled={isSigningOut}
              className="p-2 transition-all duration-200 hover:bg-red-50 hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ color: '#E63946', borderRadius: '12px 2px 12px 2px' }}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="p-3 text-center bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]" 
              style={{ 
                border: '1px solid rgba(230,57,70,0.08)',
                borderRadius: index === 0 ? '16px 2px 16px 2px' : index === 1 ? '2px 16px 2px 16px' : '16px 2px 16px 2px'
              }}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <span style={{ color: '#E63946' }}>{stat.icon}</span>
                <span className="text-xl font-bold" style={{ color: '#1a1a2e' }}>{stat.value}</span>
              </div>
              <p className="text-xs" style={{ color: '#999' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Menu Items - Anime Style */}
        <div className="space-y-3 mb-8">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="group relative flex items-center justify-between p-5 bg-white transition-all duration-300 hover:shadow-lg hover:scale-[1.01] active:scale-98 overflow-hidden"
              style={{ 
                borderRadius: '16px 2px 16px 2px',
                border: '1px solid rgba(0,0,0,0.05)'
              }}
            >
              {/* Anime-style hover sweep - Speed line effect */}
              <div className="absolute inset-0 w-0 bg-gradient-to-r from-[#E63946]/5 to-transparent transition-all duration-500 ease-out group-hover:w-full" />
              <div className="absolute top-0 right-0 w-20 h-0.5 bg-[#E63946]/10 transition-all duration-500 group-hover:w-full group-hover:bg-[#E63946]/20" />
              
              <div className="relative z-10 flex items-center gap-4">
                <div 
                  className="w-12 h-12 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ 
                    background: `${item.color}10`, 
                    color: item.color,
                    borderRadius: '12px 2px 12px 2px'
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold tracking-wide text-sm uppercase" style={{ color: '#1a1a2e' }}>{item.title}</h3>
                  <p className="text-xs" style={{ color: '#999' }}>{item.description}</p>
                </div>
              </div>
              <ChevronRight size={20} className="relative z-10 transition-all duration-300 group-hover:translate-x-2 group-hover:text-[#E63946]" style={{ color: '#bbb' }} />
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1 rounded" style={{ background: 'rgba(230,57,70,0.08)', borderRadius: '6px 1px 6px 1px' }}>
              <Sparkles size={16} style={{ color: '#E63946' }} />
            </div>
            <h3 className="text-sm font-bold tracking-wide uppercase" style={{ color: '#1a1a2e' }}>Quick Actions</h3>
            <div className="flex-1 h-px ml-2" style={{ background: 'linear-gradient(to right, rgba(230,57,70,0.1), transparent)' }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link to="/profile/customize" className="flex items-center gap-2 p-3 bg-white transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-98"
              style={{ border: '1px solid rgba(230,57,70,0.08)', borderRadius: '12px 2px 12px 2px' }}
            >
              <Palette size={16} style={{ color: '#E63946' }} />
              <span className="text-sm font-medium" style={{ color: '#1a1a2e' }}>Customize</span>
            </Link>
            <Link to="/privacy-security" className="flex items-center gap-2 p-3 bg-white transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-98"
              style={{ border: '1px solid rgba(230,57,70,0.08)', borderRadius: '12px 2px 12px 2px' }}
            >
              <Lock size={16} style={{ color: '#E63946' }} />
              <span className="text-sm font-medium" style={{ color: '#1a1a2e' }}>Security</span>
            </Link>
            <Link to="/notification-settings" className="flex items-center gap-2 p-3 bg-white transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-98"
              style={{ border: '1px solid rgba(230,57,70,0.08)', borderRadius: '12px 2px 12px 2px' }}
            >
              <Bell size={16} style={{ color: '#E63946' }} />
              <span className="text-sm font-medium" style={{ color: '#1a1a2e' }}>Notifications</span>
            </Link>
            <Link to="/help-support" className="flex items-center gap-2 p-3 bg-white transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-98"
              style={{ border: '1px solid rgba(230,57,70,0.08)', borderRadius: '12px 2px 12px 2px' }}
            >
              <HelpCircle size={16} style={{ color: '#E63946' }} />
              <span className="text-sm font-medium" style={{ color: '#1a1a2e' }}>Help</span>
            </Link>
          </div>
        </div>

        {/* Sign Out Button (Mobile) */}
        <div className="mt-6 block lg:hidden">
          <button 
            onClick={() => setShowSignOutModal(true)} 
            disabled={isSigningOut}
            className="w-full flex items-center justify-center gap-2 p-4 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-98 disabled:opacity-50"
            style={{ 
              background: 'rgba(230,57,70,0.1)', 
              color: '#E63946',
              borderRadius: '16px 2px 16px 2px'
            }}
          >
            {isSigningOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>

        {/* Version Info */}
        <div className="mt-8 text-center">
          <p className="text-xs" style={{ color: '#bbb' }}>
            OtakuBate ~ Ganbare! • © 2026
          </p>
        </div>
      </div>

      <style>{`
        .active\\:scale-98:active { transform: scale(0.98); }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </div>
  )
}