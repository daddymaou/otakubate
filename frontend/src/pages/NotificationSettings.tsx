import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft, Bell, BellOff, Heart, MessageCircle, AtSign, 
  Users, UserPlus, Sparkles, Smartphone, Mail,
  CheckCircle, AlertCircle, Info, Clock
} from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

// ============================================
// COMING SOON TOGGLE COMPONENT
// ============================================
function ComingSoonToggle({ 
  icon, 
  label, 
  desc,
  isComingSoon = true
}: { 
  icon: React.ReactNode; 
  label: string; 
  desc: string;
  isComingSoon?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 transition-all cursor-not-allowed opacity-70">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(230,57,70,0.08)', color: '#E63946' }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{label}</p>
          <p className="text-xs" style={{ color: '#888' }}>{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(230,57,70,0.08)', color: '#E63946' }}>
          <Clock size={10} />
          Coming Soon
        </span>
        <div className="w-10 h-5 rounded-full bg-gray-200 relative">
          <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN PAGE
// ============================================
export default function NotificationSettings() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  
  const [settings, setSettings] = useState({
    newFollowers: true,
    postLikes: true,
    comments: true,
    mentions: true,
    directMessages: true,
    emailNotifications: true,
    pushNotifications: true,
  })

  const [settingsLoaded, setSettingsLoaded] = useState(false)

  useEffect(() => {
    if (user?.notificationSettings) {
      const userSettings = user.notificationSettings as any
      setSettings({
        newFollowers: userSettings.newFollowers ?? true,
        postLikes: userSettings.postLikes ?? true,
        comments: userSettings.comments ?? true,
        mentions: userSettings.mentions ?? true,
        directMessages: userSettings.directMessages ?? true,
        emailNotifications: userSettings.emailNotifications ?? true,
        pushNotifications: userSettings.pushNotifications ?? true,
      })
      setSettingsLoaded(true)
    }
  }, [user])

  const updateMutation = useMutation({
    mutationFn: (newSettings: any) => api.put('/users/me/notifications', newSettings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user', user?.username] })
      toast.success('Notification preferences saved')
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Failed to update settings')
    },
  })

  // These functions are kept but will be used when notifications are implemented
  const handleToggle = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    updateMutation.mutate({ [key]: value })
  }

  const handleSaveAll = () => {
    updateMutation.mutate(settings)
  }

  const handleEnableAll = () => {
    const allEnabled = {
      newFollowers: true,
      postLikes: true,
      comments: true,
      mentions: true,
      directMessages: true,
      emailNotifications: true,
      pushNotifications: true,
    }
    setSettings(allEnabled)
    updateMutation.mutate(allEnabled)
  }

  const handleDisableAll = () => {
    const allDisabled = {
      newFollowers: false,
      postLikes: false,
      comments: false,
      mentions: false,
      directMessages: false,
      emailNotifications: false,
      pushNotifications: false,
    }
    setSettings(allDisabled)
    updateMutation.mutate(allDisabled)
  }

  // Check if there are changes
  const hasChanges = () => {
    if (!settingsLoaded) return false
    if (!user?.notificationSettings) return true
    
    const userSettings = user.notificationSettings as any
    
    return (
      settings.newFollowers !== (userSettings.newFollowers ?? true) ||
      settings.postLikes !== (userSettings.postLikes ?? true) ||
      settings.comments !== (userSettings.comments ?? true) ||
      settings.mentions !== (userSettings.mentions ?? true) ||
      settings.directMessages !== (userSettings.directMessages ?? true) ||
      settings.emailNotifications !== (userSettings.emailNotifications ?? true) ||
      settings.pushNotifications !== (userSettings.pushNotifications ?? true)
    )
  }

  const handleDiscard = () => {
    if (user?.notificationSettings) {
      const userSettings = user.notificationSettings as any
      setSettings({
        newFollowers: userSettings.newFollowers ?? true,
        postLikes: userSettings.postLikes ?? true,
        comments: userSettings.comments ?? true,
        mentions: userSettings.mentions ?? true,
        directMessages: userSettings.directMessages ?? true,
        emailNotifications: userSettings.emailNotifications ?? true,
        pushNotifications: userSettings.pushNotifications ?? true,
      })
      toast.success('Changes discarded')
    }
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #FFF8EE 0%, #FFE8E8 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 py-4" style={{ background: 'rgba(255, 248, 238, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(230,57,70,0.1)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link to="/settings" className="p-2 rounded-xl hover:bg-black/5 transition-all">
            <ArrowLeft size={20} style={{ color: '#666' }} />
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: '#1a1a2e' }}>
            <Bell size={20} style={{ color: '#E63946' }} />
            Notifications
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Info Card */}
        <div className="rounded-2xl p-4 bg-white shadow-sm" style={{ border: '1px solid rgba(230,57,70,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(230,57,70,0.1)', color: '#E63946' }}>
              <Info size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>Stay Updated</p>
              <p className="text-xs" style={{ color: '#666' }}>Choose what notifications you want to receive</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <button 
            onClick={handleEnableAll}
            disabled={updateMutation.isPending}
            className="flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98"
            style={{ background: 'rgba(230,57,70,0.08)', color: '#E63946' }}
          >
            <Bell size={14} /> Enable All
          </button>
          <button 
            onClick={handleDisableAll}
            disabled={updateMutation.isPending}
            className="flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98"
            style={{ background: 'rgba(0,0,0,0.05)', color: '#666' }}
          >
            <BellOff size={14} /> Disable All
          </button>
        </div>

        {/* Interactions Section - All Coming Soon */}
        <div className="rounded-2xl p-5 bg-white shadow-sm" style={{ border: '1px solid rgba(230,57,70,0.08)' }}>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#1a1a2e' }}>
            <Heart size={14} style={{ color: '#E63946' }} /> Interactions
          </h2>
          <div className="space-y-1">
            <ComingSoonToggle 
              icon={<Heart size={14} />} 
              label="Post Likes" 
              desc="When someone likes your posts"
            />
            <ComingSoonToggle 
              icon={<MessageCircle size={14} />} 
              label="Comments & Replies" 
              desc="When someone comments or replies to your posts"
            />
            <ComingSoonToggle 
              icon={<AtSign size={14} />} 
              label="Mentions" 
              desc="When someone mentions you in a post or comment"
            />
          </div>
        </div>

        {/* Social Section - All Coming Soon */}
        <div className="rounded-2xl p-5 bg-white shadow-sm" style={{ border: '1px solid rgba(230,57,70,0.08)' }}>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#1a1a2e' }}>
            <Users size={14} style={{ color: '#E63946' }} /> Social
          </h2>
          <div className="space-y-1">
            <ComingSoonToggle 
              icon={<UserPlus size={14} />} 
              label="New Followers" 
              desc="When someone follows you"
            />
            <ComingSoonToggle 
              icon={<MessageCircle size={14} />} 
              label="Direct Messages" 
              desc="When you receive a new private message"
            />
          </div>
        </div>

        {/* Delivery Methods Section - All Coming Soon */}
        <div className="rounded-2xl p-5 bg-white shadow-sm" style={{ border: '1px solid rgba(230,57,70,0.08)' }}>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#1a1a2e' }}>
            <Smartphone size={14} style={{ color: '#E63946' }} /> Delivery Methods
          </h2>
          <div className="space-y-1">
            <ComingSoonToggle 
              icon={<Bell size={14} />} 
              label="Push Notifications" 
              desc="Receive notifications on your device"
            />
            <ComingSoonToggle 
              icon={<Mail size={14} />} 
              label="Email Notifications" 
              desc="Receive important updates via email"
            />
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="rounded-2xl p-5 text-center" style={{ background: 'rgba(230,57,70,0.04)', border: '1px dashed rgba(230,57,70,0.15)' }}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles size={16} style={{ color: '#E63946' }} />
            <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>Notification System Coming Soon</p>
          </div>
          <p className="text-xs" style={{ color: '#666' }}>
            We're building a better notification experience. Stay tuned for updates!
          </p>
        </div>

        {/* Unsaved Changes Bar - Disabled since all are coming soon */}
        {/* {hasChanges() && (
          <div className="fixed bottom-0 left-0 right-0 p-3 animate-slide-up z-30" style={{ background: 'rgba(255, 248, 238, 0.98)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(230, 57, 70, 0.1)' }}>
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <p className="text-sm font-medium" style={{ color: '#E63946' }}>You have unsaved changes</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDiscard}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                  style={{ background: 'rgba(0,0,0,0.05)', color: '#666' }}
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveAll}
                  disabled={updateMutation.isPending}
                  className="px-5 py-1.5 rounded-full text-sm font-bold transition-all duration-200 hover:scale-105"
                  style={{ background: '#E63946', color: '#fff' }}
                >
                  {updateMutation.isPending ? <Spinner size={14} color="white" /> : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )} */}
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .active\\:scale-98:active { transform: scale(0.98); }
      `}</style>
    </div>
  )
}