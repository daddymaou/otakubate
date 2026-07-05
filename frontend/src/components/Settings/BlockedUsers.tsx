import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Ban, Unlock, User, X, AlertCircle, Loader2 } from 'lucide-react'
import api from '../../lib/api'
import Avatar from '../ui/Avatar'
import toast from 'react-hot-toast'
import { blockUser, unblockUser as socketUnblockUser } from '../../lib/socket'
import { useAuthStore } from '../../stores/authStore'

interface BlockedUser {
  _id: string
  username: string
  displayName: string
  avatar: string
  bio?: string
}

export default function BlockedUsers() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [unblockingId, setUnblockingId] = useState<string | null>(null)

  // Fetch blocked users
  const { data, isLoading, error } = useQuery({
    queryKey: ['blocked-users'],
    queryFn: async () => {
      const { data } = await api.get('/messages/blocked/list')
      return data
    },
    enabled: !!user,
  })

  // Unblock mutation
  const unblockMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.delete(`/messages/block/${userId}`)
      return data
    },
    onSuccess: (_, userId) => {
      toast.success('User unblocked successfully')
      
      // Emit socket event
      if (user) {
        socketUnblockUser({
          blockerId: user._id,
          blockedId: userId,
        })
      }
      
      // Invalidate queries
      qc.invalidateQueries({ queryKey: ['blocked-users'] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
      qc.invalidateQueries({ queryKey: ['block-status'] })
      
      setUnblockingId(null)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to unblock user')
      setUnblockingId(null)
    }
  })

  const handleUnblock = (userId: string) => {
    setUnblockingId(userId)
    unblockMutation.mutate(userId)
  }

  const blockedUsers = data?.blockedUsers || []

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8 text-center rounded-2xl bg-white" style={{ border: '1px solid rgba(230,57,70,0.08)' }}>
        <Loader2 size={32} className="animate-spin mx-auto" style={{ color: '#E63946' }} />
        <p className="text-sm mt-3" style={{ color: '#999' }}>Loading blocked users...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center rounded-2xl bg-white" style={{ border: '1px solid rgba(230,57,70,0.08)' }}>
        <AlertCircle size={32} className="mx-auto" style={{ color: '#E63946' }} />
        <p className="text-sm mt-3" style={{ color: '#666' }}>Failed to load blocked users</p>
        <button 
          onClick={() => qc.invalidateQueries({ queryKey: ['blocked-users'] })}
          className="mt-3 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{ background: '#E63946', color: '#fff' }}
        >
          Retry
        </button>
      </div>
    )
  }

  // Empty state
  if (blockedUsers.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-white" style={{ border: '1px solid rgba(230,57,70,0.08)' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(230,57,70,0.1)' }}>
          <Ban size={28} style={{ color: '#E63946' }} />
        </div>
        <p className="font-medium" style={{ color: '#1a1a2e' }}>No blocked users</p>
        <p className="text-sm mt-1" style={{ color: '#999' }}>
          You haven't blocked anyone yet
        </p>
      </div>
    )
  }

  // Blocked users list
  return (
    <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1px solid rgba(230,57,70,0.08)' }}>
      <div className="p-4 border-b" style={{ borderColor: 'rgba(230,57,70,0.08)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ban size={16} style={{ color: '#E63946' }} />
            <span className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>
              {blockedUsers.length} {blockedUsers.length === 1 ? 'user' : 'users'} blocked
            </span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {blockedUsers.map((blockedUser: BlockedUser) => (
          <div 
            key={blockedUser._id}
            className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar 
                src={blockedUser.avatar} 
                name={blockedUser.displayName || blockedUser.username} 
                size={44} 
              />
              <div>
                <p className="font-medium text-sm" style={{ color: '#1a1a2e' }}>
                  {blockedUser.displayName || blockedUser.username}
                </p>
                <p className="text-xs" style={{ color: '#999' }}>
                  @{blockedUser.username}
                </p>
                {blockedUser.bio && (
                  <p className="text-xs mt-0.5 max-w-xs truncate" style={{ color: '#bbb' }}>
                    {blockedUser.bio}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => handleUnblock(blockedUser._id)}
              disabled={unblockingId === blockedUser._id}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ 
                background: 'rgba(16,185,129,0.1)', 
                color: '#10B981' 
              }}
            >
              {unblockingId === blockedUser._id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Unlock size={14} />
              )}
              Unblock
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}