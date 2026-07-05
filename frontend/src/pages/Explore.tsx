import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Users, UserPlus, UserCheck, Sparkles, X, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'

export default function Explore() {
  const { user: currentUser } = useAuthStore()
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Debounce search input - prevents API spam on every keystroke
  const handleSearchChange = (value: string) => {
    setQ(value)
    
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    
    // Set new timer
    debounceTimer.current = setTimeout(() => {
      setDebouncedQ(value.trim())
    }, 500) // Wait 500ms after user stops typing
  }

  // Clean search query
  const getCleanQuery = (query: string) => {
    let clean = query.trim()
    if (clean.startsWith('@')) {
      return { type: 'username', value: clean.substring(1) }
    }
    return { type: 'general', value: clean }
  }

  const searchInfo = getCleanQuery(debouncedQ)

  // Search users - only runs when debouncedQ changes
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['search', 'users', debouncedQ],
    queryFn: async () => {
      if (!debouncedQ || debouncedQ.length < 2) return { users: [] }
      const searchTerm = searchInfo.type === 'username' ? searchInfo.value : debouncedQ
      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(searchTerm)}`)
        return data
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.warn('Rate limited, using cached search')
          return { users: [] }
        }
        throw error
      }
    },
    enabled: debouncedQ.length >= 2,
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 5000,
  })

  // Get recommended users (for empty search state)
  const { data: recommendedData, isLoading: recommendedLoading } = useQuery({
    queryKey: ['recommended-users'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/users/recommended')
        return data
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.warn('Rate limited, using cached recommended users')
          return { users: [] }
        }
        throw error
      }
    },
    enabled: !debouncedQ || debouncedQ.length < 2,
    staleTime: 60000,
    gcTime: 120000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 120000,
    retry: 1,
    retryDelay: 5000,
  })

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'follow' | 'unfollow' }) => {
      const { data } = await api.post(`/users/${userId}/follow`)
      return data
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['search', 'users'] })
      qc.invalidateQueries({ queryKey: ['recommended-users'] })
      toast.success(variables.action === 'follow' ? 'Followed!' : 'Unfollowed!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update follow status')
    },
  })

  const handleFollowToggle = (userId: string, isFollowing: boolean) => {
    if (!currentUser) {
      toast.error('Please login to follow users')
      return
    }
    followMutation.mutate({ 
      userId, 
      action: isFollowing ? 'unfollow' : 'follow' 
    })
  }

  const users = searchData?.users || []
  const recommendedUsers = recommendedData?.users || []

  // Filter out current user from results
  const filteredUsers = users.filter((u: any) => u._id !== currentUser?._id)
  const filteredRecommended = recommendedUsers.filter((u: any) => u._id !== currentUser?._id)

  const isLoading = (debouncedQ.length >= 2 && searchLoading) || (!debouncedQ && recommendedLoading)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>Find People</h1>
        <p className="text-sm mt-1" style={{ color: '#999' }}>
          Discover users from the OtakuBate community
        </p>
      </div>

      {/* Search Bar */}
      <div 
        className="relative mb-6 rounded-xl transition-all duration-200"
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(230, 57, 70, 0.15)'
        }}
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: '#999' }} />
        <input 
          value={q} 
          onChange={e => handleSearchChange(e.target.value)} 
          placeholder="Search users... (e.g., @username)"
          className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none transition-all duration-200"
          style={{
            background: 'transparent',
            color: '#1a1a2e',
            fontSize: '14px'
          }}
          onFocus={e => {
            e.currentTarget.parentElement!.style.borderColor = '#E63946'
            e.currentTarget.parentElement!.style.boxShadow = '0 0 0 3px rgba(230,57,70,0.08)'
          }}
          onBlur={e => {
            e.currentTarget.parentElement!.style.borderColor = 'rgba(230,57,70,0.15)'
            e.currentTarget.parentElement!.style.boxShadow = 'none'
          }}
        />
        {q && (
          <button
            onClick={() => {
              setQ('')
              setDebouncedQ('')
              if (debounceTimer.current) {
                clearTimeout(debounceTimer.current)
              }
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/5 transition"
            style={{ color: '#999' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search Tips */}
      {q.length > 0 && q.length < 2 && (
        <div className="text-center text-xs mb-4" style={{ color: '#999' }}>
          <span>Type at least 2 characters to search</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size={36} />
        </div>
      )}

      {/* Recommended Users Section */}
      {!debouncedQ && filteredRecommended.length > 0 && !isLoading && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} style={{ color: '#E63946' }} />
            <h3 className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>Recommended for you</h3>
          </div>
          <div className="space-y-3">
            {filteredRecommended.map((u: any) => (
              <UserCard 
                key={u._id} 
                user={u} 
                currentUser={currentUser}
                onFollowToggle={handleFollowToggle}
                isFollowing={u.isFollowing}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {debouncedQ.length >= 2 && filteredUsers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium" style={{ color: '#999' }}>
              Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            </p>
            {searchInfo.type === 'username' && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(230,57,70,0.1)', color: '#E63946' }}>
                @{searchInfo.value}
              </span>
            )}
          </div>
          {filteredUsers.map((u: any) => (
            <UserCard 
              key={u._id} 
              user={u} 
              currentUser={currentUser}
              onFollowToggle={handleFollowToggle}
              isFollowing={u.isFollowing}
            />
          ))}
        </div>
      )}

      {/* No Search Results */}
      {debouncedQ.length >= 2 && filteredUsers.length === 0 && !isLoading && (
        <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(230,57,70,0.08)' }}>
          <Users size={40} className="mx-auto mb-3" style={{ color: '#ccc' }} />
          <p className="text-sm font-medium mb-1" style={{ color: '#1a1a2e' }}>No users found</p>
          <p className="text-xs" style={{ color: '#999' }}>
            {searchInfo.type === 'username' ? `No user found with @${searchInfo.value}` : 'Try searching with different keywords'}
          </p>
        </div>
      )}

      {/* Empty State - No Search and No Recommended */}
      {!debouncedQ && filteredRecommended.length === 0 && !isLoading && (
        <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(230,57,70,0.08)' }}>
          <Users size={48} className="mx-auto mb-3" style={{ color: '#ccc' }} />
          <p className="text-sm" style={{ color: '#999' }}>Search for users</p>
          <p className="text-xs mt-1" style={{ color: '#bbb' }}>Type a username or display name to find people</p>
        </div>
      )}
    </div>
  )
}

// User Card Component
function UserCard({ user, currentUser, onFollowToggle, isFollowing }: { 
  user: any; 
  currentUser: any; 
  onFollowToggle: (userId: string, isFollowing: boolean) => void;
  isFollowing: boolean;
}) {
  const isOwnProfile = currentUser?._id === user._id

  return (
    <Link 
      to={`/profile/${user.username}`} 
      className="flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 hover:scale-[1.01] group"
      style={{
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(230, 57, 70, 0.08)'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(230,57,70,0.2)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(230,57,70,0.08)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <Avatar 
        src={user.avatar} 
        name={user.displayName || user.username} 
        size={48} 
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-base truncate" style={{ color: '#1a1a2e' }}>
            {user.displayName || user.username}
          </span>
          {user.isVerified && (
            <span className="text-xs flex-shrink-0" style={{ color: '#E63946' }}>✓</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-sm truncate" style={{ color: '#999' }}>@{user.username}</span>
          <span className="text-xs flex-shrink-0" style={{ color: '#ccc' }}>•</span>
          <span className="text-xs flex-shrink-0" style={{ color: '#999' }}>{user.followersCount || 0} followers</span>
        </div>
        {user.bio && (
          <p className="text-xs truncate mt-1 max-w-[200px] sm:max-w-xs" style={{ color: '#666' }}>
            {user.bio}
          </p>
        )}
      </div>
      {!isOwnProfile && (
        <button 
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
          style={{
            background: isFollowing ? 'rgba(230,57,70,0.1)' : '#1a1a2e',
            color: isFollowing ? '#E63946' : '#fff',
            border: isFollowing ? '1px solid rgba(230,57,70,0.2)' : 'none'
          }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onFollowToggle(user._id, isFollowing)
          }}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      )}
    </Link>
  )
}