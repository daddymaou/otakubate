import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Shield, Users, FileText, TrendingUp, Ban, CheckCircle, 
  Search, AlertTriangle, Activity, Calendar, MessageCircle, 
  Home, Eye, UserCheck, UserX, Trash2, Plus, RefreshCw,
  ArrowUp, ArrowDown, Settings, BarChart3, PieChart, 
  Clock, Zap, Crown, Star, Flag, MoreVertical
} from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

type Tab = 'dashboard' | 'users' | 'posts' | 'comments' | 'clubs'

export default function AdminPanel() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')

  // Redirect if not admin
  if (!user?.isAdmin) {
    navigate('/feed')
    return null
  }

  // ============================================
  // QUERIES
  // ============================================
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data),
    refetchInterval: 60000, // Refresh every 60s
  })

  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users', searchQuery],
    queryFn: () => api.get(`/admin/users?search=${searchQuery}`).then(r => r.data),
    enabled: activeTab === 'users' || activeTab === 'dashboard',
  })

  const { data: postsData, isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ['admin-posts', selectedUserId],
    queryFn: () => api.get(`/admin/posts?userId=${selectedUserId}`).then(r => r.data),
    enabled: activeTab === 'posts',
  })

  const { data: commentsData, isLoading: commentsLoading, refetch: refetchComments } = useQuery({
    queryKey: ['admin-comments', selectedUserId],
    queryFn: () => api.get(`/admin/comments?userId=${selectedUserId}`).then(r => r.data),
    enabled: activeTab === 'comments',
  })

  const { data: clubsData, isLoading: clubsLoading, refetch: refetchClubs } = useQuery({
    queryKey: ['admin-clubs', searchQuery],
    queryFn: () => api.get(`/admin/clubs?search=${searchQuery}`).then(r => r.data),
    enabled: activeTab === 'clubs',
  })

  // ============================================
  // MUTATIONS
  // ============================================
  const toggleBanMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/users/${id}/toggle-ban`),
    onSuccess: () => {
      toast.success('User status updated')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      refetchStats()
    },
    onError: () => toast.error('Failed to update user'),
  })

  const toggleAdminMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/users/${id}/toggle-admin`),
    onSuccess: () => {
      toast.success('Admin status updated')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: () => toast.error('Failed to update admin status'),
  })

  const deletePostMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/posts/${id}`),
    onSuccess: () => {
      toast.success('Post deleted')
      qc.invalidateQueries({ queryKey: ['admin-posts'] })
      refetchStats()
    },
    onError: () => toast.error('Failed to delete post'),
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/comments/${id}`),
    onSuccess: () => {
      toast.success('Comment deleted')
      qc.invalidateQueries({ queryKey: ['admin-comments'] })
      refetchStats()
    },
    onError: () => toast.error('Failed to delete comment'),
  })

  const deleteClubMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/clubs/${id}`),
    onSuccess: () => {
      toast.success('Club deleted')
      qc.invalidateQueries({ queryKey: ['admin-clubs'] })
      refetchStats()
    },
    onError: () => toast.error('Failed to delete club'),
  })

  // ============================================
  // STATS
  // ============================================
  const stats = statsData?.stats || {}
  const today = stats?.today || {}

  const statCards = [
    { 
      label: 'Total Users', 
      value: stats.totalUsers || 0, 
      change: today.newUsers || 0,
      icon: Users, 
      color: '#3B82F6', 
      bg: 'rgba(59,130,246,0.1)' 
    },
    { 
      label: 'Total Posts', 
      value: stats.totalPosts || 0, 
      change: today.newPosts || 0,
      icon: FileText, 
      color: '#10B981', 
      bg: 'rgba(16,185,129,0.1)' 
    },
    { 
      label: 'Total Comments', 
      value: stats.totalComments || 0, 
      change: today.newComments || 0,
      icon: MessageCircle, 
      color: '#8B5CF6', 
      bg: 'rgba(139,92,246,0.1)' 
    },
    { 
      label: 'Total Clubs', 
      value: stats.totalClubs || 0, 
      change: 0,
      icon: Home, 
      color: '#E63946', 
      bg: 'rgba(230,57,70,0.1)' 
    },
    { 
      label: 'Admins', 
      value: stats.totalAdmins || 0, 
      change: 0,
      icon: Crown, 
      color: '#F59E0B', 
      bg: 'rgba(245,158,11,0.1)' 
    },
  ]

  // ============================================
  // TABS
  // ============================================
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'comments', label: 'Comments', icon: MessageCircle },
    { id: 'clubs', label: 'Clubs', icon: Home },
  ]

  // ============================================
  // RENDER: STATS CARDS
  // ============================================
  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statCards.map((s) => (
        <div 
          key={s.label} 
          className="p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02]"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(230, 57, 70, 0.08)'
          }}
        >
          <div className="flex items-center justify-between">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: s.bg }}
            >
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            {s.change > 0 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                <ArrowUp size={10} /> +{s.change}
              </span>
            )}
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>
              {s.value?.toLocaleString() ?? '—'}
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#999' }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  )

  // ============================================
  // RENDER: ACTIVITY CHART (Simple visual)
  // ============================================
  const renderActivity = () => {
    const maxValue = Math.max(today.newUsers || 0, today.newPosts || 0, today.newComments || 0, 1)
    
    return (
      <div 
        className="p-5 rounded-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(230, 57, 70, 0.08)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={18} style={{ color: '#E63946' }} />
            <h3 className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>Today's Activity</h3>
          </div>
          <span className="text-[10px]" style={{ color: '#999' }}>
            <Clock size={10} className="inline mr-1" />
            Updated just now
          </span>
        </div>

        <div className="flex items-end gap-6 h-32">
          <div className="flex-1 flex flex-col items-center">
            <div 
              className="w-full rounded-t-lg transition-all duration-500"
              style={{ 
                height: `${(today.newUsers || 0) / maxValue * 100}%`,
                minHeight: '8px',
                background: 'linear-gradient(180deg, #3B82F6, #60A5FA)'
              }}
            />
            <div className="flex items-center gap-1 mt-2">
              <Users size={12} style={{ color: '#3B82F6' }} />
              <span className="text-xs font-medium" style={{ color: '#1a1a2e' }}>{today.newUsers || 0}</span>
            </div>
            <span className="text-[10px]" style={{ color: '#999' }}>Users</span>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <div 
              className="w-full rounded-t-lg transition-all duration-500"
              style={{ 
                height: `${(today.newPosts || 0) / maxValue * 100}%`,
                minHeight: '8px',
                background: 'linear-gradient(180deg, #10B981, #34D399)'
              }}
            />
            <div className="flex items-center gap-1 mt-2">
              <FileText size={12} style={{ color: '#10B981' }} />
              <span className="text-xs font-medium" style={{ color: '#1a1a2e' }}>{today.newPosts || 0}</span>
            </div>
            <span className="text-[10px]" style={{ color: '#999' }}>Posts</span>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <div 
              className="w-full rounded-t-lg transition-all duration-500"
              style={{ 
                height: `${(today.newComments || 0) / maxValue * 100}%`,
                minHeight: '8px',
                background: 'linear-gradient(180deg, #8B5CF6, #A78BFA)'
              }}
            />
            <div className="flex items-center gap-1 mt-2">
              <MessageCircle size={12} style={{ color: '#8B5CF6' }} />
              <span className="text-xs font-medium" style={{ color: '#1a1a2e' }}>{today.newComments || 0}</span>
            </div>
            <span className="text-[10px]" style={{ color: '#999' }}>Comments</span>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // RENDER: USERS TABLE
  // ============================================
  const renderUsers = () => (
    <div 
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(230, 57, 70, 0.08)'
      }}
    >
      <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap" style={{ borderBottom: '1px solid rgba(230,57,70,0.08)' }}>
        <div className="flex items-center gap-2">
          <Users size={18} style={{ color: '#E63946' }} />
          <h2 className="font-semibold" style={{ color: '#1a1a2e' }}>Users</h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(230,57,70,0.1)', color: '#E63946' }}>
            {usersData?.users?.length || 0}
          </span>
        </div>
        
        <div className="relative rounded-xl transition-all duration-200" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(230,57,70,0.15)', width: '100%', maxWidth: '260px' }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: '#999' }} />
          <input 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="w-full pl-9 pr-3 py-2 rounded-xl focus:outline-none text-sm"
            style={{ background: 'transparent', color: '#1a1a2e' }}
            placeholder="Search users..."
          />
        </div>
      </div>

      {usersLoading ? (
        <div className="flex justify-center py-12"><Spinner size={32} /></div>
      ) : usersData?.users?.length > 0 ? (
        <div className="divide-y" style={{ borderColor: 'rgba(230,57,70,0.06)' }}>
          {usersData.users.map((u: any) => (
            <div key={u._id} className="flex items-center gap-3 p-4 flex-wrap sm:flex-nowrap hover:bg-white/[0.03]">
              <Avatar src={u.avatar} name={u.displayName || u.username} size={40} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>
                    {u.displayName || u.username}
                  </span>
                  {u.isVerified && <span className="text-xs" style={{ color: '#E63946' }}>✓</span>}
                  {u.isAdmin && <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: 'rgba(230,57,70,0.1)', color: '#E63946' }}>admin</span>}
                  {!u.isActive && <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>banned</span>}
                </div>
                <div className="text-xs" style={{ color: '#999' }}>@{u.username} • {u.email}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!u.isAdmin && (
                  <button 
                    onClick={() => toggleAdminMutation.mutate(u._id)}
                    className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all hover:scale-105"
                    style={{ background: 'rgba(230,57,70,0.1)', color: '#E63946' }}
                  >
                    Make Admin
                  </button>
                )}
                {u.isAdmin && u._id !== user._id && (
                  <button 
                    onClick={() => toggleAdminMutation.mutate(u._id)}
                    className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all hover:scale-105"
                    style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}
                  >
                    Demote
                  </button>
                )}
                <button 
                  onClick={() => toggleBanMutation.mutate(u._id)}
                  className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all hover:scale-105"
                  style={{ background: u.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: u.isActive ? '#EF4444' : '#10B981' }}
                >
                  {u.isActive ? 'Ban' : 'Unban'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto mb-3" style={{ color: '#ccc' }} />
          <p className="text-sm" style={{ color: '#999' }}>No users found</p>
        </div>
      )}
    </div>
  )

  // ============================================
  // RENDER: POSTS
  // ============================================
  const renderPosts = () => (
    <div 
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(230, 57, 70, 0.08)'
      }}
    >
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(230,57,70,0.08)' }}>
        <div className="flex items-center gap-2">
          <FileText size={18} style={{ color: '#E63946' }} />
          <h2 className="font-semibold" style={{ color: '#1a1a2e' }}>Posts</h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(230,57,70,0.1)', color: '#E63946' }}>
            {postsData?.posts?.length || 0}
          </span>
        </div>
        <button 
          onClick={() => refetchPosts()} 
          className="p-1.5 rounded-lg hover:bg-black/5 transition"
          style={{ color: '#999' }}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {postsLoading ? (
        <div className="flex justify-center py-12"><Spinner size={32} /></div>
      ) : postsData?.posts?.length > 0 ? (
        <div className="divide-y" style={{ borderColor: 'rgba(230,57,70,0.06)' }}>
          {postsData.posts.map((p: any) => (
            <div key={p._id} className="p-4 hover:bg-white/[0.03]">
              <div className="flex items-start gap-3">
                <Avatar src={p.author?.avatar} name={p.author?.displayName || p.author?.username} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm" style={{ color: '#1a1a2e' }}>
                      {p.author?.displayName || p.author?.username}
                    </span>
                    <span className="text-xs" style={{ color: '#999' }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: '#555' }}>{p.content}</p>
                  {p.images?.length > 0 && (
                    <div className="text-xs mt-1" style={{ color: '#999' }}>📷 {p.images.length} image(s)</div>
                  )}
                </div>
                <button 
                  onClick={() => deletePostMutation.mutate(p._id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 transition"
                  style={{ color: '#EF4444' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto mb-3" style={{ color: '#ccc' }} />
          <p className="text-sm" style={{ color: '#999' }}>No posts found</p>
        </div>
      )}
    </div>
  )

  // ============================================
  // RENDER: COMMENTS
  // ============================================
  const renderComments = () => (
    <div 
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(230, 57, 70, 0.08)'
      }}
    >
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(230,57,70,0.08)' }}>
        <div className="flex items-center gap-2">
          <MessageCircle size={18} style={{ color: '#E63946' }} />
          <h2 className="font-semibold" style={{ color: '#1a1a2e' }}>Comments</h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(230,57,70,0.1)', color: '#E63946' }}>
            {commentsData?.comments?.length || 0}
          </span>
        </div>
        <button 
          onClick={() => refetchComments()} 
          className="p-1.5 rounded-lg hover:bg-black/5 transition"
          style={{ color: '#999' }}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {commentsLoading ? (
        <div className="flex justify-center py-12"><Spinner size={32} /></div>
      ) : commentsData?.comments?.length > 0 ? (
        <div className="divide-y" style={{ borderColor: 'rgba(230,57,70,0.06)' }}>
          {commentsData.comments.map((c: any) => (
            <div key={c._id} className="p-4 hover:bg-white/[0.03]">
              <div className="flex items-start gap-3">
                <Avatar src={c.author?.avatar} name={c.author?.displayName || c.author?.username} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm" style={{ color: '#1a1a2e' }}>
                      {c.author?.displayName || c.author?.username}
                    </span>
                    <span className="text-xs" style={{ color: '#999' }}>
                      on post: {c.post?.title || 'Untitled'}
                    </span>
                    <span className="text-xs" style={{ color: '#999' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: '#555' }}>{c.content}</p>
                </div>
                <button 
                  onClick={() => deleteCommentMutation.mutate(c._id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 transition"
                  style={{ color: '#EF4444' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageCircle size={48} className="mx-auto mb-3" style={{ color: '#ccc' }} />
          <p className="text-sm" style={{ color: '#999' }}>No comments found</p>
        </div>
      )}
    </div>
  )

  // ============================================
  // RENDER: CLUBS
  // ============================================
  const renderClubs = () => (
    <div 
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(230, 57, 70, 0.08)'
      }}
    >
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(230,57,70,0.08)' }}>
        <div className="flex items-center gap-2">
          <Home size={18} style={{ color: '#E63946' }} />
          <h2 className="font-semibold" style={{ color: '#1a1a2e' }}>Clubs</h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(230,57,70,0.1)', color: '#E63946' }}>
            {clubsData?.clubs?.length || 0}
          </span>
        </div>
        <button 
          onClick={() => refetchClubs()} 
          className="p-1.5 rounded-lg hover:bg-black/5 transition"
          style={{ color: '#999' }}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {clubsLoading ? (
        <div className="flex justify-center py-12"><Spinner size={32} /></div>
      ) : clubsData?.clubs?.length > 0 ? (
        <div className="divide-y" style={{ borderColor: 'rgba(230,57,70,0.06)' }}>
          {clubsData.clubs.map((c: any) => (
            <div key={c._id} className="flex items-center gap-3 p-4 hover:bg-white/[0.03]">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(230,57,70,0.1)' }}>
                {c.avatar ? (
                  <img src={c.avatar} className="w-full h-full rounded-full object-cover" alt={c.name} />
                ) : (
                  <Home size={18} style={{ color: '#E63946' }} />
                )}
              </div>
              <div className="flex-1">
                <span className="font-medium text-sm" style={{ color: '#1a1a2e' }}>{c.name}</span>
                <span className="text-xs ml-2" style={{ color: '#999' }}>{c.membersCount || 0} members</span>
                {c.description && <p className="text-xs truncate" style={{ color: '#999' }}>{c.description}</p>}
              </div>
              <button 
                onClick={() => deleteClubMutation.mutate(c._id)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 transition"
                style={{ color: '#EF4444' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Home size={48} className="mx-auto mb-3" style={{ color: '#ccc' }} />
          <p className="text-sm" style={{ color: '#999' }}>No clubs found</p>
        </div>
      )}
    </div>
  )

  // ============================================
  // RENDER: QUICK ACTIONS
  // ============================================
  const renderQuickActions = () => (
    <div 
      className="p-5 rounded-2xl"
      style={{
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(230, 57, 70, 0.08)'
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} style={{ color: '#E63946' }} />
        <h3 className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button 
          onClick={() => setActiveTab('users')}
          className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-105"
          style={{ border: '1px solid rgba(230,57,70,0.1)', background: 'rgba(255,255,255,0.3)' }}
        >
          <UserCheck size={18} style={{ color: '#3B82F6' }} />
          <span className="text-xs font-medium" style={{ color: '#1a1a2e' }}>Manage Users</span>
        </button>
        <button 
          onClick={() => setActiveTab('posts')}
          className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-105"
          style={{ border: '1px solid rgba(230,57,70,0.1)', background: 'rgba(255,255,255,0.3)' }}
        >
          <FileText size={18} style={{ color: '#10B981' }} />
          <span className="text-xs font-medium" style={{ color: '#1a1a2e' }}>View Posts</span>
        </button>
        <button 
          onClick={() => setActiveTab('comments')}
          className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-105"
          style={{ border: '1px solid rgba(230,57,70,0.1)', background: 'rgba(255,255,255,0.3)' }}
        >
          <MessageCircle size={18} style={{ color: '#8B5CF6' }} />
          <span className="text-xs font-medium" style={{ color: '#1a1a2e' }}>View Comments</span>
        </button>
        <button 
          onClick={() => refetchStats()}
          className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-105"
          style={{ border: '1px solid rgba(230,57,70,0.1)', background: 'rgba(255,255,255,0.3)' }}
        >
          <RefreshCw size={18} style={{ color: '#E63946' }} />
          <span className="text-xs font-medium" style={{ color: '#1a1a2e' }}>Refresh Data</span>
        </button>
      </div>
    </div>
  )

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl" style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)' }}>
            <Shield size={24} style={{ color: '#E63946' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>Admin Panel</h1>
            <p className="text-sm mt-0.5" style={{ color: '#999' }}>Manage users, content, and platform activity</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </div>
          </span>
        </div>
      </div>

      {/* Stats Cards - Always Visible */}
      {statsLoading ? (
        <div className="flex justify-center py-8"><Spinner size={32} /></div>
      ) : (
        renderStats()
      )}

      {/* Tabs */}
      <div className="flex gap-1 mt-6 mb-4 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive ? 'shadow-sm' : 'hover:bg-white/30'
              }`}
              style={{
                background: isActive ? 'rgba(255,255,255,0.6)' : 'transparent',
                color: isActive ? '#E63946' : '#666',
                border: isActive ? '1px solid rgba(230,57,70,0.15)' : '1px solid transparent'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'dashboard' && (
          <>
            {renderActivity()}
            {renderQuickActions()}
            {/* Quick Stats Table - Top Users */}
            <div 
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(230, 57, 70, 0.08)'
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Users size={18} style={{ color: '#E63946' }} />
                <h3 className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>Recent Users</h3>
              </div>
              {usersLoading ? (
                <div className="flex justify-center py-4"><Spinner size={24} /></div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'rgba(230,57,70,0.06)' }}>
                  {usersData?.users?.slice(0, 5).map((u: any) => (
                    <div key={u._id} className="flex items-center gap-3 py-2">
                      <Avatar src={u.avatar} name={u.displayName || u.username} size={28} />
                      <span className="text-sm font-medium" style={{ color: '#1a1a2e' }}>
                        {u.displayName || u.username}
                      </span>
                      <span className="text-xs ml-auto" style={{ color: '#999' }}>
                        Joined {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'users' && renderUsers()}
        {activeTab === 'posts' && renderPosts()}
        {activeTab === 'comments' && renderComments()}
        {activeTab === 'clubs' && renderClubs()}
      </div>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}