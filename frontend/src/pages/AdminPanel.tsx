import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, Users, FileText, TrendingUp, Ban, CheckCircle, Search, AlertTriangle, Activity, Calendar } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function AdminPanel() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const qc = useQueryClient()

  if (!user?.isAdmin) { 
    navigate('/feed') 
    return null 
  }

  const { data: stats } = useQuery({ 
    queryKey: ['admin-stats'], 
    queryFn: () => api.get('/admin/stats').then(r => r.data) 
  })
  const { data: users, isLoading } = useQuery({ 
    queryKey: ['admin-users', q], 
    queryFn: () => api.get(`/admin/users?q=${q}`).then(r => r.data) 
  })

  const banMutation = useMutation({
    mutationFn: (id: string) => api.put(`/admin/users/${id}/ban`),
    onSuccess: () => { toast.success('User banned'); qc.invalidateQueries({ queryKey: ['admin-users'] }) },
  })

  const verifyMutation = useMutation({
    mutationFn: (id: string) => api.put(`/admin/users/${id}/verify`),
    onSuccess: () => { toast.success('User verified'); qc.invalidateQueries({ queryKey: ['admin-users'] }) },
  })

  const statCards = [
    { label: 'Total Users', value: stats?.stats?.users, icon: Users, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Total Posts', value: stats?.stats?.posts, icon: FileText, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Communities', value: stats?.stats?.communities, icon: Shield, color: '#E63946', bg: 'rgba(230,57,70,0.1)' },
    { label: 'New Today', value: stats?.stats?.newUsersToday, icon: TrendingUp, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div 
          className="p-2 rounded-2xl"
          style={{
            background: 'rgba(230,57,70,0.1)',
            border: '1px solid rgba(230,57,70,0.2)'
          }}
        >
          <Shield size={24} style={{ color: '#E63946' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>Admin Panel</h1>
          <p className="text-sm mt-0.5" style={{ color: '#999' }}>Manage users, monitor activity, and control the platform</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div 
            key={s.label} 
            className="p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(230, 57, 70, 0.08)'
            }}
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: s.bg }}
            >
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>
              {s.value?.toLocaleString() ?? '—'}
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#999' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Users Section */}
      <div 
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(230, 57, 70, 0.08)'
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap" style={{ borderBottom: '1px solid rgba(230,57,70,0.08)' }}>
          <div className="flex items-center gap-2">
            <Users size={18} style={{ color: '#E63946' }} />
            <h2 className="font-semibold" style={{ color: '#1a1a2e' }}>User Management</h2>
            {users?.users && (
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(230,57,70,0.1)',
                  color: '#E63946'
                }}
              >
                {users.users.length} total
              </span>
            )}
          </div>
          
          {/* Search Input */}
          <div 
            className="relative rounded-xl transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(230,57,70,0.15)',
              width: '100%',
              maxWidth: '260px'
            }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: '#999' }} />
            <input 
              value={q} 
              onChange={e => setQ(e.target.value)} 
              className="w-full pl-9 pr-3 py-2 rounded-xl focus:outline-none text-sm"
              style={{
                background: 'transparent',
                color: '#1a1a2e'
              }}
              placeholder="Search users..."
              onFocus={e => {
                e.currentTarget.parentElement!.style.borderColor = '#E63946'
                e.currentTarget.parentElement!.style.boxShadow = '0 0 0 3px rgba(230,57,70,0.08)'
              }}
              onBlur={e => {
                e.currentTarget.parentElement!.style.borderColor = 'rgba(230,57,70,0.15)'
                e.currentTarget.parentElement!.style.boxShadow = 'none'
              }}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner size={32} />
          </div>
        )}

        {/* Users List */}
        {!isLoading && users?.users && users.users.length > 0 && (
          <div className="divide-y" style={{ borderColor: 'rgba(230,57,70,0.06)' }}>
            {users.users.map((u: any) => (
              <div 
                key={u._id} 
                className="flex items-center gap-3 p-4 flex-wrap sm:flex-nowrap transition-all duration-200 hover:bg-white/[0.03]"
              >
                <Avatar src={u.avatar} name={u.displayName || u.username} size={44} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>
                      {u.displayName || u.username}
                    </span>
                    {u.isVerified && (
                      <span className="text-xs" style={{ color: '#E63946' }}>✓</span>
                    )}
                    {u.isAdmin && (
                      <span 
                        className="text-xs px-1.5 py-0.5 rounded font-medium"
                        style={{
                          background: 'rgba(230,57,70,0.1)',
                          color: '#E63946'
                        }}
                      >
                        admin
                      </span>
                    )}
                    {!u.isActive && (
                      <span 
                        className="text-xs px-1.5 py-0.5 rounded font-medium"
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          color: '#EF4444'
                        }}
                      >
                        banned
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs" style={{ color: '#999' }}>@{u.username}</span>
                    <span className="text-xs" style={{ color: '#ccc' }}>•</span>
                    <span className="text-xs" style={{ color: '#999' }}>{u.email}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs" style={{ color: '#bbb' }}>
                      {u.postsCount || 0} posts
                    </span>
                    <span className="text-xs" style={{ color: '#bbb' }}>
                      {u.followersCount || 0} followers
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!u.isVerified && !u.isAdmin && (
                    <button 
                      onClick={() => verifyMutation.mutate(u._id)} 
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200"
                      style={{
                        background: 'rgba(16,185,129,0.1)',
                        color: '#10B981'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(16,185,129,0.2)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(16,185,129,0.1)'
                      }}
                    >
                      <CheckCircle size={12} />
                      Verify
                    </button>
                  )}
                  
                  {u.isActive && !u.isAdmin && (
                    <button 
                      onClick={() => banMutation.mutate(u._id)} 
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        color: '#EF4444'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.2)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                      }}
                    >
                      <Ban size={12} />
                      Ban
                    </button>
                  )}
                  
                  {!u.isActive && !u.isAdmin && (
                    <button 
                      onClick={() => banMutation.mutate(u._id)} 
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200"
                      style={{
                        background: 'rgba(16,185,129,0.1)',
                        color: '#10B981'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(16,185,129,0.2)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(16,185,129,0.1)'
                      }}
                    >
                      <CheckCircle size={12} />
                      Unban
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && users?.users && users.users.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto mb-3" style={{ color: '#ccc' }} />
            <p className="text-sm font-medium mb-1" style={{ color: '#1a1a2e' }}>No users found</p>
            <p className="text-xs" style={{ color: '#999' }}>
              {q ? 'Try a different search term' : 'Users will appear here'}
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions Section */}
      <div 
        className="mt-6 p-5 rounded-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(230, 57, 70, 0.08)'
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} style={{ color: '#E63946' }} />
          <h3 className="font-semibold" style={{ color: '#1a1a2e' }}>Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left"
            style={{
              border: '1px solid rgba(230,57,70,0.1)',
              background: 'rgba(255,255,255,0.3)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(230,57,70,0.3)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.5)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(230,57,70,0.1)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
            }}
          >
            <Calendar size={20} style={{ color: '#E63946' }} />
            <div>
              <div className="text-sm font-medium" style={{ color: '#1a1a2e' }}>View Reports</div>
              <div className="text-xs" style={{ color: '#999' }}>See platform activity and insights</div>
            </div>
          </button>
          
          <button 
            className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left"
            style={{
              border: '1px solid rgba(230,57,70,0.1)',
              background: 'rgba(255,255,255,0.3)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(230,57,70,0.3)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.5)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(230,57,70,0.1)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
            }}
          >
            <AlertTriangle size={20} style={{ color: '#E63946' }} />
            <div>
              <div className="text-sm font-medium" style={{ color: '#1a1a2e' }}>Reports Queue</div>
              <div className="text-xs" style={{ color: '#999' }}>Review flagged content</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}