import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Users, UserPlus, UserCheck, Loader2 } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function Followers() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()
  const qc = useQueryClient()

  // Get the profile user data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', username],
    queryFn: () => api.get(`/users/${username}`).then(r => r.data),
  })

  // Get followers list
  const { data: followersData, isLoading: followersLoading, refetch } = useQuery({
    queryKey: ['followers', username],
    queryFn: () => {
      const userId = userData?.user?._id
      if (!userId) return Promise.resolve({ data: { followers: [] } })
      return api.get(`/users/${userId}/followers`).then(r => r.data)
    },
    enabled: !!userData?.user?._id,
  })

  const followMutation = useMutation({
    mutationFn: (userId: string) => api.post(`/users/${userId}/follow`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['followers', username] })
      qc.invalidateQueries({ queryKey: ['user', username] })
      qc.invalidateQueries({ queryKey: ['user', currentUser?.username] })
      refetch()
      toast.success('Updated!')
    },
    onError: () => toast.error('Failed to update'),
  })

  const user = userData?.user
  const followers = followersData?.followers || []

  if (userLoading || followersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={48} />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Users size={48} className="mx-auto mb-3 opacity-30" style={{ color: '#999' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: '#1a1a2e' }}>User Not Found</h2>
          <button onClick={() => navigate(-1)} className="px-6 py-2 rounded-full text-sm font-medium" style={{ background: '#1a1a2e', color: '#fff' }}>
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?._id === user._id

  return (
    <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(135deg, #FFF8EE 0%, #FFE8E8 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(255, 248, 238, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(230,57,70,0.08)' }}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-black/5 transition">
          <ArrowLeft size={20} style={{ color: '#1a1a2e' }} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1a1a2e' }}>Followers</h1>
          <p className="text-xs" style={{ color: '#999' }}>@{user?.username}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {followers.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(230,57,70,0.08)' }}>
            <Users size={48} className="mx-auto mb-3 opacity-30" style={{ color: '#999' }} />
            <p className="text-sm" style={{ color: '#999' }}>
              {isOwnProfile 
                ? "You don't have any followers yet" 
                : `@${user?.username} has no followers yet`}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {followers.map((person: any) => {
              const isCurrentUser = currentUser?._id === person._id
              const isFollowing = person.isFollowing
              
              return (
                <div 
                  key={person._id} 
                  className="p-3 rounded-xl transition-all duration-200 hover:bg-black/5"
                  style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(230,57,70,0.08)' }}
                >
                  <div className="flex items-center justify-between">
                    <Link 
                      to={`/profile/${person.username}`} 
                      className="flex items-center gap-3 flex-1 min-w-0"
                      onClick={() => window.scrollTo(0, 0)}
                    >
                      <Avatar 
                        src={person.avatar} 
                        name={person.displayName || person.username} 
                        size={48} 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: '#1a1a2e' }}>
                          {person.displayName || person.username}
                        </p>
                        <p className="text-xs" style={{ color: '#999' }}>@{person.username}</p>
                        {person.bio && (
                          <p className="text-xs mt-1 line-clamp-1" style={{ color: '#666' }}>
                            {person.bio}
                          </p>
                        )}
                      </div>
                    </Link>
                    
                    {!isCurrentUser && (
                      <button
                        onClick={() => followMutation.mutate(person._id)}
                        disabled={followMutation.isPending}
                        className="px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1.5 disabled:opacity-50"
                        style={{ 
                          background: isFollowing ? 'transparent' : '#E63946', 
                          color: isFollowing ? '#1a1a2e' : '#fff', 
                          border: isFollowing ? '1px solid rgba(230,57,70,0.3)' : 'none' 
                        }}
                      >
                        {followMutation.isPending ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : isFollowing ? (
                          <UserCheck size={12} />
                        ) : (
                          <UserPlus size={12} />
                        )}
                        {isFollowing ? 'Unfollow' : 'Follow'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}