import { useState, useEffect } from 'react'
import { X, Users, Crown, Shield, Search, Loader2, UserPlus, UserMinus, Crown as CrownIcon, Minus } from 'lucide-react'
import Avatar from '../../../components/ui/Avatar'
import { getClubMembers } from '../api/otakuApi'
import toast from 'react-hot-toast'
import api from '../../../lib/api'

interface MembersListProps {
  clubId: string
  isAdmin: boolean
  isOwner: boolean
  onClose: () => void
  onTransfer?: (userId: string) => void
}

interface Member {
  _id: string
  username: string
  displayName: string
  avatar: string
}

export default function MembersList({
  clubId,
  isAdmin,
  isOwner,
  onClose,
  onTransfer
}: MembersListProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [admins, setAdmins] = useState<Member[]>([])
  const [owner, setOwner] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showPromoteConfirm, setShowPromoteConfirm] = useState<{ userId: string; username: string } | null>(null)
  const [showDemoteConfirm, setShowDemoteConfirm] = useState<{ userId: string; username: string } | null>(null)
  const [showTransferConfirm, setShowTransferConfirm] = useState<{ userId: string; username: string } | null>(null)

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true)
        const data = await getClubMembers(clubId)
        setMembers(data.members || [])
        setAdmins(data.admins || [])
        setOwner(data.owner || null)
      } catch (error) {
        toast.error('Failed to load members')
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [clubId])

  const filteredMembers = members.filter((member: Member) => {
    const displayName = member.displayName || member.username
    return displayName.toLowerCase().includes(search.toLowerCase())
  })

  const filteredAdmins = admins.filter((admin: Member) => {
    const displayName = admin.displayName || admin.username
    return displayName.toLowerCase().includes(search.toLowerCase())
  })

  const isUserAdmin = (userId: string) => {
    return admins.some((a: Member) => a._id === userId)
  }

  const isUserOwner = (userId: string) => {
    return owner?._id === userId
  }

  const showFullList = isAdmin || isOwner

  const handlePromote = async () => {
    if (!showPromoteConfirm) return
    const { userId, username } = showPromoteConfirm
    
    setActionLoading(userId)
    try {
      await api.post(`/otaku/clubs/${clubId}/promote/${userId}`)
      toast.success(`${username} is now an admin`)
      
      const promotedUser = members.find(m => m._id === userId)
      if (promotedUser) {
        setAdmins(prev => [...prev, promotedUser])
        setMembers(prev => prev.filter(m => m._id !== userId))
      }
      setShowPromoteConfirm(null)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to promote user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDemote = async () => {
    if (!showDemoteConfirm) return
    const { userId, username } = showDemoteConfirm
    
    setActionLoading(userId)
    try {
      await api.post(`/otaku/clubs/${clubId}/demote/${userId}`)
      toast.success(`${username} is now a member`)
      
      const demotedUser = admins.find(a => a._id === userId)
      if (demotedUser) {
        setMembers(prev => [...prev, demotedUser])
        setAdmins(prev => prev.filter(a => a._id !== userId))
      }
      setShowDemoteConfirm(null)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to demote user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleTransfer = async () => {
    if (!showTransferConfirm) return
    const { userId, username } = showTransferConfirm
    
    setActionLoading(userId)
    try {
      await api.post(`/otaku/clubs/${clubId}/transfer/${userId}`)
      toast.success(`Ownership transferred to ${username}`)
      setShowTransferConfirm(null)
      if (onTransfer) onTransfer(userId)
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to transfer ownership')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }}
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-10 blur-xl" />
          
          <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(230,57,70,0.1)' }}>
              <div className="flex items-center gap-2">
                <Users size={18} style={{ color: '#E63946' }} />
                <h2 className="font-bold" style={{ color: '#1a1a2e' }}>Members</h2>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(230,57,70,0.08)', color: '#E63946' }}>
                  {members.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
                style={{ color: '#999' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#999' }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search members..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl focus:outline-none transition-all duration-200 text-sm bg-white"
                  style={{ border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#E63946'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230,57,70,0.08)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(230,57,70,0.15)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Members List */}
            <div className="px-5 pb-5 max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin" style={{ color: '#E63946' }} />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Owner Section */}
                  {owner && (
                    <div>
                      <div className="flex items-center gap-2 px-1 mb-2">
                        <Crown size={14} style={{ color: '#FBBF24' }} />
                        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#999' }}>Owner</span>
                      </div>
                      <div className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.1)' }}>
                        <Avatar src={owner.avatar} name={owner.displayName || owner.username} size={36} className="rounded-full" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>
                            {owner.displayName || owner.username}
                          </p>
                          <p className="text-xs font-medium" style={{ color: '#FBBF24' }}>Owner</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admins Section */}
                  {filteredAdmins.filter((a: Member) => a._id !== owner?._id).length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-1 mb-2 mt-4">
                        <Shield size={14} style={{ color: '#60A5FA' }} />
                        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#999' }}>Administrators</span>
                      </div>
                      {filteredAdmins
                        .filter((a: Member) => a._id !== owner?._id)
                        .map((admin: Member) => (
                          <div key={admin._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/30 transition-colors">
                            <Avatar src={admin.avatar} name={admin.displayName || admin.username} size={36} className="rounded-full" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>
                                {admin.displayName || admin.username}
                              </p>
                              <p className="text-xs font-medium" style={{ color: '#60A5FA' }}>Admin</p>
                            </div>
                            <Shield size={14} style={{ color: '#60A5FA' }} />
                            
                            {isOwner && (
                              <button
                                onClick={() => setShowDemoteConfirm({ userId: admin._id, username: admin.displayName || admin.username })}
                                disabled={actionLoading === admin._id}
                                className="p-1 rounded hover:bg-red-500/10 transition-colors"
                                style={{ color: '#E63946' }}
                                title="Demote from admin"
                              >
                                {actionLoading === admin._id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <UserMinus size={14} />
                                )}
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Regular Members - Only shown to Admins & Owners */}
                  {showFullList && (
                    <div>
                      {filteredMembers
                        .filter((m: Member) => !isUserAdmin(m._id) && !isUserOwner(m._id))
                        .length > 0 && (
                          <div className="flex items-center gap-2 px-1 mb-2 mt-4">
                            <Users size={14} style={{ color: '#999' }} />
                            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#999' }}>Members</span>
                          </div>
                        )}
                      {filteredMembers
                        .filter((m: Member) => !isUserAdmin(m._id) && !isUserOwner(m._id))
                        .map((member: Member) => (
                          <div key={member._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/30 transition-colors">
                            <Avatar src={member.avatar} name={member.displayName || member.username} size={36} className="rounded-full" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>
                                {member.displayName || member.username}
                              </p>
                              <p className="text-xs" style={{ color: '#999' }}>Member</p>
                            </div>
                            
                            {(isOwner || isAdmin) && (
                              <button
                                onClick={() => setShowPromoteConfirm({ userId: member._id, username: member.displayName || member.username })}
                                disabled={actionLoading === member._id}
                                className="p-1 rounded hover:bg-green-500/10 transition-colors"
                                style={{ color: '#10B981' }}
                                title="Promote to admin"
                              >
                                {actionLoading === member._id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <UserPlus size={14} />
                                )}
                              </button>
                            )}

                            {isOwner && (
                              <button
                                onClick={() => setShowTransferConfirm({ userId: member._id, username: member.displayName || member.username })}
                                disabled={actionLoading === member._id || isUserAdmin(member._id)}
                                className="p-1 rounded hover:bg-yellow-500/10 transition-colors"
                                style={{ color: '#FBBF24' }}
                                title="Transfer ownership"
                              >
                                {actionLoading === member._id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <CrownIcon size={14} />
                                )}
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Message for regular members */}
                  {!showFullList && filteredMembers.filter((m: Member) => !isUserAdmin(m._id) && !isUserOwner(m._id)).length > 0 && (
                    <div className="text-center py-4">
                      <p className="text-xs" style={{ color: '#999' }}>Only admins and the owner are visible</p>
                    </div>
                  )}

                  {filteredAdmins.filter((a: Member) => a._id !== owner?._id).length === 0 && !owner && (
                    <div className="text-center py-8">
                      <p className="text-sm" style={{ color: '#999' }}>No members found</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t" style={{ borderColor: 'rgba(230,57,70,0.1)' }}>
              <button
                onClick={onClose}
                className="w-full py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-black/5"
                style={{ color: '#666' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Promote Confirmation Modal */}
      {showPromoteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={() => setShowPromoteConfirm(null)}>
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
            <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(16,185,129,0.1)' }}>
                <Shield size={28} style={{ color: '#10B981' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1a2e' }}>Promote to Admin?</h3>
              <p className="text-sm mb-4" style={{ color: '#666' }}>
                Are you sure you want to promote <strong>{showPromoteConfirm.username}</strong> to admin?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowPromoteConfirm(null)} className="flex-1 py-2 rounded-xl text-sm font-medium transition-all hover:bg-black/5" style={{ color: '#666' }}>Cancel</button>
                <button onClick={handlePromote} className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105" style={{ background: '#10B981' }}>Promote</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demote Confirmation Modal */}
      {showDemoteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={() => setShowDemoteConfirm(null)}>
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
            <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(230,57,70,0.1)' }}>
                <UserMinus size={28} style={{ color: '#E63946' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1a2e' }}>Demote from Admin?</h3>
              <p className="text-sm mb-4" style={{ color: '#666' }}>
                Are you sure you want to demote <strong>{showDemoteConfirm.username}</strong> from admin?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDemoteConfirm(null)} className="flex-1 py-2 rounded-xl text-sm font-medium transition-all hover:bg-black/5" style={{ color: '#666' }}>Cancel</button>
                <button onClick={handleDemote} className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105" style={{ background: '#E63946' }}>Demote</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Confirmation Modal */}
      {showTransferConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={() => setShowTransferConfirm(null)}>
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
            <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(251,191,36,0.1)' }}>
                <CrownIcon size={28} style={{ color: '#FBBF24' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1a2e' }}>Transfer Ownership?</h3>
              <p className="text-sm mb-4" style={{ color: '#666' }}>
                Are you sure you want to transfer ownership to <strong>{showTransferConfirm.username}</strong>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowTransferConfirm(null)} className="flex-1 py-2 rounded-xl text-sm font-medium transition-all hover:bg-black/5" style={{ color: '#666' }}>Cancel</button>
                <button onClick={handleTransfer} className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105" style={{ background: '#FBBF24' }}>Transfer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </>
  )
}