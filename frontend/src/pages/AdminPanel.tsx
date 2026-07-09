import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Shield, Users, FileText, TrendingUp, Ban, CheckCircle, 
  Search, AlertTriangle, Activity, Calendar, MessageCircle, 
  Home, UserCheck, UserX, Trash2, RefreshCw,
  ArrowUp, ArrowDown, BarChart3, Crown, TrendingDown, 
  PieChart, LineChart, Clock, Zap, Eye, LayoutDashboard,
  UserCog, ClipboardList, Settings, ChevronRight, Menu,
  X, Plus, Minus, Sparkles, Award, Target, Gift
} from 'lucide-react'
import { 
  LineChart as ReLineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

type Tab = 'dashboard' | 'users' | 'posts' | 'comments' | 'clubs'

const COLORS = ['#E63946', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#14B8A6', '#F97316']

// Sidebar navigation items
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#E63946' },
  { id: 'users', label: 'Users', icon: Users, color: '#3B82F6' },
  { id: 'posts', label: 'Posts', icon: FileText, color: '#10B981' },
  { id: 'comments', label: 'Comments', icon: MessageCircle, color: '#8B5CF6' },
  { id: 'clubs', label: 'Clubs', icon: Home, color: '#F59E0B' },
]

export default function AdminPanel() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day')
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
    refetchInterval: 60000,
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
  // STATS DATA
  // ============================================
  const stats = statsData?.stats || {}
  const today = stats?.today || {}

  // Generate mock chart data
  const generateMockData = () => {
    const data = []
    const now = new Date()
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: Math.floor(Math.random() * 10) + 1,
        posts: Math.floor(Math.random() * 8) + 1,
        comments: Math.floor(Math.random() * 15) + 2,
      })
    }
    return data
  }

  const activityData = generateMockData()

  const pieData = [
    { name: 'Active Users', value: stats.totalUsers - (stats.totalUsers * 0.15) || 1 },
    { name: 'Banned Users', value: Math.floor(stats.totalUsers * 0.05) || 1 },
    { name: 'Inactive', value: Math.floor(stats.totalUsers * 0.1) || 1 },
  ].filter(d => d.value > 0)

  const contentPieData = [
    { name: 'Posts', value: stats.totalPosts || 1 },
    { name: 'Comments', value: stats.totalComments || 1 },
    { name: 'Clubs', value: stats.totalClubs || 1 },
  ].filter(d => d.value > 0)

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
  // RENDER FUNCTIONS
  // ============================================

  // Premium Stat Cards
  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statCards.map((s, index) => (
        <div 
          key={s.label} 
          className="group relative p-5 rounded-2xl transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(230, 57, 70, 0.08)',
            animation: `fadeInUp 0.5s ease ${index * 0.1}s both`
          }}
        >
          {/* Premium glow effect */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `${s.color}10`, filter: 'blur(40px)' }} />
          
          <div className="relative z-10 flex items-center justify-between">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{ background: s.bg }}
            >
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            {s.change > 0 && (
              <span className="text-[10px] font-medium px-2 py-1 rounded-full flex items-center gap-0.5" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
                <ArrowUp size={10} /> +{s.change}
              </span>
            )}
          </div>
          <div className="relative z-10 mt-4">
            <div className="text-3xl font-bold tracking-tight" style={{ color: '#1a1a2e' }}>
              {s.value?.toLocaleString() ?? '—'}
            </div>
            <div className="text-xs mt-1 font-medium uppercase tracking-wider" style={{ color: '#999' }}>{s.label}</div>
          </div>
          {/* Progress bar */}
          <div className="relative z-10 mt-3 h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(s.value / 100, 100)}%`, background: s.color }} />
          </div>
        </div>
      ))}
    </div>
  )

  // Charts Section
  const renderCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      {/* Main Activity Chart - Takes 2 columns */}
      <div className="lg:col-span-2 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl" style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(230, 57, 70, 0.08)'
      }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(230,57,70,0.08)' }}>
              <TrendingUp size={16} style={{ color: '#E63946' }} />
            </div>
            <h3 className="font-bold text-sm" style={{ color: '#1a1a2e' }}>Activity Overview</h3>
          </div>
          <div className="flex gap-1">
            {['day', 'week', 'month'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t as any)}
                className={`px-3 py-1 rounded-lg text-[10px] font-medium transition-all duration-200 hover:scale-105 ${
                  timeframe === t ? 'text-white' : 'hover:bg-black/5'
                }`}
                style={{ 
                  background: timeframe === t ? '#E63946' : 'transparent',
                  color: timeframe === t ? '#fff' : '#999'
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={activityData}>
            <defs>
              <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="postsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9CA3AF" />
            <YAxis tick={{ fontSize: 10 }} stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                background: '#FFF8EE', 
                border: '1px solid rgba(230,57,70,0.1)',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
              }} 
            />
            <Area type="monotone" dataKey="users" stroke="#3B82F6" fill="url(#usersGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="posts" stroke="#10B981" fill="url(#postsGrad)" strokeWidth={2} />
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Charts - Takes 1 column */}
      <div className="space-y-4">
        {/* User Distribution */}
        <div className="p-4 rounded-2xl transition-all duration-300 hover:shadow-xl" style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(230, 57, 70, 0.08)'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(139,92,246,0.08)' }}>
              <PieChart size={14} style={{ color: '#8B5CF6' }} />
            </div>
            <h4 className="font-semibold text-xs" style={{ color: '#1a1a2e' }}>User Distribution</h4>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <RePieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: '#FFF8EE', 
                  border: '1px solid rgba(230,57,70,0.1)',
                  borderRadius: '12px',
                  fontSize: '10px'
                }} 
              />
            </RePieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                <span className="text-[9px]" style={{ color: '#666' }}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Distribution */}
        <div className="p-4 rounded-2xl transition-all duration-300 hover:shadow-xl" style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(230, 57, 70, 0.08)'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)' }}>
              <PieChart size={14} style={{ color: '#10B981' }} />
            </div>
            <h4 className="font-semibold text-xs" style={{ color: '#1a1a2e' }}>Content Distribution</h4>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <RePieChart>
              <Pie
                data={contentPieData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {contentPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: '#FFF8EE', 
                  border: '1px solid rgba(230,57,70,0.1)',
                  borderRadius: '12px',
                  fontSize: '10px'
                }} 
              />
            </RePieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {contentPieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[(index + 3) % COLORS.length] }} />
                <span className="text-[9px]" style={{ color: '#666' }}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Users Table
  const renderUsers = () => (
    <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl" style={{
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(230, 57, 70, 0.08)'
    }}>
      <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap border-b" style={{ borderColor: 'rgba(230,57,70,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl" style={{ background: 'rgba(59,130,246,0.08)' }}>
            <Users size={16} style={{ color: '#3B82F6' }} />
          </div>
          <h2 className="font-bold" style={{ color: '#1a1a2e' }}>User Management</h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(230,57,70,0.08)', color: '#E63946' }}>
            {usersData?.users?.length || 0}
          </span>
        </div>
        <div className="relative rounded-xl transition-all duration-200" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(230,57,70,0.12)', width: '100%', maxWidth: '260px' }}>
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
        <div className="divide-y" style={{ borderColor: 'rgba(230,57,70,0.04)' }}>
          {usersData.users.map((u: any) => (
            <div key={u._id} className="flex items-center gap-3 p-4 hover:bg-white/20 transition-all duration-200">
              <Avatar src={u.avatar} name={u.displayName || u.username} size={40} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>{u.displayName || u.username}</span>
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
                    Promote
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

  // Posts
  const renderPosts = () => (
    <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl" style={{
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(230, 57, 70, 0.08)'
    }}>
      <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(230,57,70,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)' }}>
            <FileText size={16} style={{ color: '#10B981' }} />
          </div>
          <h2 className="font-bold" style={{ color: '#1a1a2e' }}>Posts</h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(230,57,70,0.08)', color: '#E63946' }}>
            {postsData?.posts?.length || 0}
          </span>
        </div>
        <button onClick={() => refetchPosts()} className="p-1.5 rounded-lg hover:bg-black/5 transition" style={{ color: '#999' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {postsLoading ? (
        <div className="flex justify-center py-12"><Spinner size={32} /></div>
      ) : postsData?.posts?.length > 0 ? (
        <div className="divide-y" style={{ borderColor: 'rgba(230,57,70,0.04)' }}>
          {postsData.posts.map((p: any) => (
            <div key={p._id} className="p-4 hover:bg-white/20 transition-all duration-200">
              <div className="flex items-start gap-3">
                <Avatar src={p.author?.avatar} name={p.author?.displayName || p.author?.username} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm" style={{ color: '#1a1a2e' }}>{p.author?.displayName || p.author?.username}</span>
                    <span className="text-xs" style={{ color: '#999' }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: '#555' }}>{p.content}</p>
                  {p.images?.length > 0 && <div className="text-xs mt-1" style={{ color: '#999' }}>📷 {p.images.length} image(s)</div>}
                </div>
                <button onClick={() => deletePostMutation.mutate(p._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition" style={{ color: '#EF4444' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12"><FileText size={48} className="mx-auto mb-3" style={{ color: '#ccc' }} /><p className="text-sm" style={{ color: '#999' }}>No posts found</p></div>
      )}
    </div>
  )

  // Comments
  const renderComments = () => (
    <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl" style={{
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(230, 57, 70, 0.08)'
    }}>
      <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(230,57,70,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl" style={{ background: 'rgba(139,92,246,0.08)' }}>
            <MessageCircle size={16} style={{ color: '#8B5CF6' }} />
          </div>
          <h2 className="font-bold" style={{ color: '#1a1a2e' }}>Comments</h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(230,57,70,0.08)', color: '#E63946' }}>
            {commentsData?.comments?.length || 0}
          </span>
        </div>
        <button onClick={() => refetchComments()} className="p-1.5 rounded-lg hover:bg-black/5 transition" style={{ color: '#999' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {commentsLoading ? (
        <div className="flex justify-center py-12"><Spinner size={32} /></div>
      ) : commentsData?.comments?.length > 0 ? (
        <div className="divide-y" style={{ borderColor: 'rgba(230,57,70,0.04)' }}>
          {commentsData.comments.map((c: any) => (
            <div key={c._id} className="p-4 hover:bg-white/20 transition-all duration-200">
              <div className="flex items-start gap-3">
                <Avatar src={c.author?.avatar} name={c.author?.displayName || c.author?.username} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm" style={{ color: '#1a1a2e' }}>{c.author?.displayName || c.author?.username}</span>
                    <span className="text-xs" style={{ color: '#999' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: '#555' }}>{c.content}</p>
                </div>
                <button onClick={() => deleteCommentMutation.mutate(c._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition" style={{ color: '#EF4444' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12"><MessageCircle size={48} className="mx-auto mb-3" style={{ color: '#ccc' }} /><p className="text-sm" style={{ color: '#999' }}>No comments found</p></div>
      )}
    </div>
  )

  // Clubs
  const renderClubs = () => (
    <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl" style={{
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(230, 57, 70, 0.08)'
    }}>
      <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(230,57,70,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)' }}>
            <Home size={16} style={{ color: '#F59E0B' }} />
          </div>
          <h2 className="font-bold" style={{ color: '#1a1a2e' }}>Clubs</h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(230,57,70,0.08)', color: '#E63946' }}>
            {clubsData?.clubs?.length || 0}
          </span>
        </div>
        <button onClick={() => refetchClubs()} className="p-1.5 rounded-lg hover:bg-black/5 transition" style={{ color: '#999' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {clubsLoading ? (
        <div className="flex justify-center py-12"><Spinner size={32} /></div>
      ) : clubsData?.clubs?.length > 0 ? (
        <div className="divide-y" style={{ borderColor: 'rgba(230,57,70,0.04)' }}>
          {clubsData.clubs.map((c: any) => (
            <div key={c._id} className="flex items-center gap-3 p-4 hover:bg-white/20 transition-all duration-200">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(230,57,70,0.1)' }}>
                {c.avatar ? <img src={c.avatar} className="w-full h-full rounded-full object-cover" alt={c.name} /> : <Home size={18} style={{ color: '#E63946' }} />}
              </div>
              <div className="flex-1">
                <span className="font-medium text-sm" style={{ color: '#1a1a2e' }}>{c.name}</span>
                <span className="text-xs ml-2" style={{ color: '#999' }}>{c.membersCount || 0} members</span>
                {c.description && <p className="text-xs truncate" style={{ color: '#999' }}>{c.description}</p>}
              </div>
              <button onClick={() => deleteClubMutation.mutate(c._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition" style={{ color: '#EF4444' }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12"><Home size={48} className="mx-auto mb-3" style={{ color: '#ccc' }} /><p className="text-sm" style={{ color: '#999' }}>No clubs found</p></div>
      )}
    </div>
  )

  // Quick Stats Summary (Dashboard only)
  const renderQuickStats = () => {
    const quickStats = [
      { label: 'Active Users', value: stats.totalUsers || 0, color: '#3B82F6', icon: Users },
      { label: 'Total Content', value: (stats.totalPosts || 0) + (stats.totalComments || 0), color: '#10B981', icon: FileText },
      { label: 'Engagement', value: '--', color: '#8B5CF6', icon: TrendingUp },
      { label: 'Today\'s Growth', value: today.newUsers || 0, color: '#E63946', icon: Sparkles },
    ]

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickStats.map((item, index) => (
          <div key={item.label} className="p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg" style={{ 
            background: 'rgba(255,255,255,0.6)', 
            border: '1px solid rgba(230,57,70,0.06)',
            animation: `fadeInUp 0.4s ease ${index * 0.1}s both`
          }}>
            <div className="flex items-center justify-between">
              <item.icon size={16} style={{ color: item.color }} />
              <span className="text-[10px] font-medium" style={{ color: item.color }}>+{Math.floor(Math.random() * 10)}%</span>
            </div>
            <div className="text-xl font-bold mt-2" style={{ color: '#1a1a2e' }}>{item.value}</div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: '#999' }}>{item.label}</div>
          </div>
        ))}
      </div>
    )
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F5F0E8 0%, #FFE8E8 100%)' }}>
      {/* Premium Header */}
      <div className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between" style={{
        background: 'rgba(255, 248, 238, 0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(230, 57, 70, 0.06)'
      }}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-black/5 transition-all duration-200 lg:hidden"
          >
            {sidebarOpen ? <X size={20} style={{ color: '#1a1a2e' }} /> : <Menu size={20} style={{ color: '#1a1a2e' }} />}
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl" style={{ background: 'linear-gradient(135deg, #E63946, #FF6B7A)' }}>
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: '#1a1a2e' }}>Admin Panel</h1>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: '#999' }}>Platform Management</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
          <button 
            onClick={() => refetchStats()}
            className="p-2 rounded-xl hover:bg-black/5 transition-all duration-200"
            style={{ color: '#666' }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed lg:relative z-20 w-64 h-[calc(100vh-72px)] transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`} style={{
          background: 'rgba(255, 248, 238, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(230, 57, 70, 0.06)'
        }}>
          <div className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive ? 'shadow-sm' : 'hover:bg-black/5'
                  }`}
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.6)' : 'transparent',
                    color: isActive ? item.color : '#666',
                    border: isActive ? '1px solid rgba(230,57,70,0.08)' : '1px solid transparent'
                  }}
                >
                  <Icon size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && <ChevronRight size={14} style={{ color: item.color }} />}
                </button>
              )
            })}
          </div>
          
          {/* Sidebar Footer */}
          <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl" style={{ background: 'rgba(230,57,70,0.04)', border: '1px solid rgba(230,57,70,0.06)' }}>
            <div className="flex items-center gap-3">
              <Avatar src={user?.avatar} name={user?.displayName || user?.username} size={32} />
              <div>
                <p className="text-xs font-semibold" style={{ color: '#1a1a2e' }}>{user?.displayName || user?.username}</p>
                <p className="text-[10px]" style={{ color: '#999' }}>@{user?.username}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Stats Cards */}
          {statsLoading ? (
            <div className="flex justify-center py-12"><Spinner size={32} /></div>
          ) : (
            renderStats()
          )}

          {/* Charts - Only on Dashboard */}
          {activeTab === 'dashboard' && renderCharts()}

          {/* Quick Stats - Dashboard only */}
          {activeTab === 'dashboard' && renderQuickStats()}

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'posts' && renderPosts()}
            {activeTab === 'comments' && renderComments()}
            {activeTab === 'clubs' && renderClubs()}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
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