import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Users, Settings, Crown, Shield,
  Plus, Sparkles, Loader2, MoreVertical, 
  Copy, LogOut, Trash2, UserPlus,
  Share2, Crown as CrownIcon, UserCog, LogIn
} from 'lucide-react'
import { useClub } from '../hooks/useClubs'
import { useDiscussions } from '../hooks/useDiscussions'
import Avatar from '../../../components/ui/Avatar'
import Spinner from '../../../components/ui/Spinner'
import toast from 'react-hot-toast'
import DiscussionCard from '../components/DiscussionCard'
import CreateDiscussion from '../components/CreateDiscussion'
import ClubSettings from '../components/ClubSettings'
import MembersList from '../components/MembersList'
import api from '../../../lib/api'

export default function ClubFeed() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  
  const [showCreateDiscussion, setShowCreateDiscussion] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [confirmUsername, setConfirmUsername] = useState('')
  const [showTransferConfirm, setShowTransferConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [selectedTransferUser, setSelectedTransferUser] = useState('')
  const [transferAdmins, setTransferAdmins] = useState<any[]>([])
  const [isCopying, setIsCopying] = useState(false)

  const { club, loading, isAdmin, isOwner, isMember, refresh, members } = useClub(slug)
  
  const {
    discussions,
    loading: discussionsLoading,
    create,
    react,
    unreact,
    remove: deleteDiscussion
  } = useDiscussions(club?._id || '')

  const handleBack = () => navigate('/clubs')

  const handleCreateDiscussion = async (data: { title: string; content: string; image?: string }) => {
    await create(data)
    setShowCreateDiscussion(false)
  }

  const handleJoinClub = async () => {
    if (isJoining) return
    setIsJoining(true)
    try {
      await api.post(`/otaku/clubs/${club?._id}/join`)
      toast.success('Joined club! 🎉')
      setShowJoinModal(false)
      await refresh()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to join club')
    } finally {
      setIsJoining(false)
    }
  }

  const handleCopyLink = async () => {
    if (isCopying) return
    setIsCopying(true)
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      toast.success('Link copied!')
    } catch (error) {
      toast.error('Failed to copy link')
    } finally {
      setIsCopying(false)
      setShowMenu(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share?.({
        title: club?.name || 'Club',
        text: `Check out ${club?.name} on OtakuBate!`,
        url: window.location.href
      }).catch(() => {})
    } else {
      handleCopyLink()
    }
    setShowMenu(false)
  }

  const handleLeaveClub = () => {
    if (isOwner) {
      toast.error('You are the owner. You cannot leave your own club.')
      setShowMenu(false)
      return
    }
    setShowLeaveConfirm(true)
    setShowMenu(false)
  }

  const confirmLeave = async () => {
    if (isLeaving) return
    setIsLeaving(true)
    try {
      await api.post(`/otaku/clubs/${club?._id}/leave`)
      toast.success('Left club')
      navigate('/clubs')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to leave club')
    } finally {
      setIsLeaving(false)
      setShowLeaveConfirm(false)
    }
  }

  const handleDeleteClub = () => {
    setShowDeleteConfirm(true)
    setShowMenu(false)
  }

  const confirmDelete = async () => {
    if (confirmUsername !== club?.name) {
      toast.error('Club name does not match')
      return
    }
    if (isDeleting) return
    
    setIsDeleting(true)
    try {
      const clubId = club?._id
      await api.delete(`/otaku/clubs/${clubId}`)
      
      toast.success('Club deleted successfully')
      setShowDeleteConfirm(false)
      setConfirmUsername('')
      window.location.href = '/clubs'
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error.response?.data?.error || 'Failed to delete club')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTransferOwnership = () => {
    const adminList = members?.filter((m: any) => 
      club?.admins?.includes(m._id) && m._id !== club?.ownerId
    ) || []
    setTransferAdmins(adminList)
    setShowTransferConfirm(true)
    setShowMenu(false)
  }

  const confirmTransfer = async () => {
    if (!selectedTransferUser) {
      toast.error('Please select a user')
      return
    }
    if (isTransferring) return
    
    setIsTransferring(true)
    try {
      await api.post(`/otaku/clubs/${club?._id}/transfer/${selectedTransferUser}`)
      toast.success(`Ownership transferred successfully`)
      setShowTransferConfirm(false)
      setSelectedTransferUser('')
      await refresh()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to transfer ownership')
    } finally {
      setIsTransferring(false)
    }
  }

  // Show join modal when non-member visits
  if (!loading && club && !isMember && !showJoinModal) {
    setShowJoinModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#FFF8EE' }}>
        <Spinner size={48} />
      </div>
    )
  }

  if (!club) {
    return (
      <div className="flex flex-col items-center justify-center h-screen" style={{ background: '#FFF8EE' }}>
        <div className="text-center">
          <Sparkles size={48} className="mx-auto mb-4" style={{ color: '#ccc' }} />
          <h2 className="text-xl font-bold" style={{ color: '#1a1a2e' }}>Club not found</h2>
          <p className="text-sm mt-1" style={{ color: '#999' }}>The club you're looking for doesn't exist</p>
          <button onClick={handleBack} className="mt-4 px-6 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02]" style={{ background: '#E63946' }}>
            Back to OtakuHub
          </button>
        </div>
      </div>
    )
  }

  const getMenuItems = () => {
    const items = []

    items.push({ 
      label: isCopying ? 'Copying...' : 'Copy Link', 
      icon: isCopying ? <Loader2 size={12} className="animate-spin" /> : <Copy size={12} />, 
      action: handleCopyLink,
      disabled: isCopying
    })
    items.push({ label: 'Share', icon: <Share2 size={12} />, action: handleShare })

    if (isMember) {
      items.push({ label: 'Members', icon: <Users size={12} />, action: () => { setShowMembers(true); setShowMenu(false) } })
      
      if (isOwner) {
        items.push({ label: 'Settings', icon: <Settings size={12} />, action: () => { setShowSettings(true); setShowMenu(false) } })
        items.push({ label: 'Transfer Ownership', icon: <CrownIcon size={12} />, action: handleTransferOwnership })
        items.push({ label: 'Delete Club', icon: <Trash2 size={12} />, action: handleDeleteClub, danger: true })
      } else if (isAdmin) {
        items.push({ label: 'Settings', icon: <Settings size={12} />, action: () => { setShowSettings(true); setShowMenu(false) } })
        items.push({ label: 'Manage Members', icon: <UserCog size={12} />, action: () => { setShowMembers(true); setShowMenu(false) } })
      }
      
      if (!isOwner) {
        items.push({ label: 'Leave Club', icon: <LogOut size={12} />, action: handleLeaveClub, danger: true })
      }
    } else {
      items.push({ 
        label: 'Join Club', 
        icon: <UserPlus size={12} />, 
        action: () => setShowJoinModal(true),
        primary: true 
      })
    }

    return items
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #F5F0E8 0%, #FFE8E8 100%)' }}>
      {/* Club Header */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)' }}>
        {club.banner && <div className="absolute inset-0 opacity-15" style={{ backgroundImage: `url(${club.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />}
        <div className="relative z-10 px-4 py-6">
          <div className="flex items-center justify-between">
            <button onClick={handleBack} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white">
              <ArrowLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2">
              {isMember && (
                <button
                  onClick={() => setShowMembers(true)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                  title="Members"
                >
                  <Users size={20} />
                </button>
              )}
              
              {(isAdmin || isOwner) && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                  title="Settings"
                >
                  <Settings size={20} />
                </button>
              )}
              
              {/* Dropdown Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                >
                  <MoreVertical size={20} />
                </button>
                {showMenu && (
                  <div 
                    className="absolute right-0 top-full mt-1 rounded-xl shadow-lg border py-1 min-w-[180px] z-50"
                    style={{ 
                      background: '#1a1a2e', 
                      borderColor: 'rgba(255,255,255,0.06)',
                      overflow: 'visible'
                    }}
                  >
                    {getMenuItems().map((item, index) => (
                      <button
                        key={index}
                        onClick={item.action}
                        disabled={item.disabled}
                        className={`w-full px-3 py-1.5 text-xs hover:bg-white/5 transition-colors flex items-center gap-2 text-left ${
                          item.danger ? 'text-red-400' : item.primary ? 'text-[#E63946]' : 'text-gray-300'
                        } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {item.icon} {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-4 mt-2">
            <Avatar src={club.avatar} name={club.name} size={64} className="ring-2 ring-white/20 flex-shrink-0 rounded-full" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-white">{club.name}</h1>
                {isOwner && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(251,191,36,0.2)', color: '#FBBF24' }}>
                    Owner
                  </span>
                )}
                {isAdmin && !isOwner && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(59,130,246,0.2)', color: '#60A5FA' }}>
                    Admin
                  </span>
                )}
              </div>
              {club.description && <p className="text-sm text-gray-400 mt-1">{club.description}</p>}
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><Users size={14} /><span>{club.membersCount || 0} members</span></span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400">{discussions.length} discussions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discussions Feed */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {(isAdmin || isOwner) && (
          <button onClick={() => setShowCreateDiscussion(true)} className="w-full mb-4 p-4 rounded-xl flex items-center gap-3 transition-all duration-200 hover:scale-[1.01] group" style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', border: '1px dashed rgba(230,57,70,0.2)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(230,57,70,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.6)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(230,57,70,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.5)' }}
          >
            <div className="p-2 rounded-full" style={{ background: 'rgba(230,57,70,0.08)' }}><Plus size={18} style={{ color: '#E63946' }} /></div>
            <span className="text-sm font-medium" style={{ color: '#666' }}>Create a new discussion</span>
            <span className="text-xs ml-auto" style={{ color: '#999' }}>Admin only</span>
          </button>
        )}

        {discussionsLoading ? (
          <div className="flex justify-center py-16"><Spinner size={36} /></div>
        ) : discussions.length > 0 ? (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <DiscussionCard
                key={discussion._id}
                discussion={discussion}
                clubSlug={slug!}
                isAdmin={isAdmin}
                isOwner={isOwner}
                onReact={react}
                onUnreact={unreact}
                onDelete={async (id) => {
                  await deleteDiscussion(id)
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(12px)', border: '1px solid rgba(230,57,70,0.06)' }}>
            <Sparkles size={32} className="mx-auto mb-3" style={{ color: '#ccc' }} />
            <p className="text-base font-medium" style={{ color: '#1a1a2e' }}>No discussions yet</p>
            <p className="text-sm mt-1" style={{ color: '#999' }}>{(isAdmin || isOwner) ? 'Be the first to start a discussion!' : 'Admins will post discussions here'}</p>
          </div>
        )}
      </div>

      {/* Join Club Modal */}
      {showJoinModal && club && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={() => setShowJoinModal(false)}>
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
            <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl p-6 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(230,57,70,0.1)' }}>
                <LogIn size={32} style={{ color: '#E63946' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1a2e' }}>Join {club.name}?</h3>
              <p className="text-sm mb-4" style={{ color: '#666' }}>
                You're not a member of this club yet. Join to view and participate in discussions.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setShowJoinModal(false); navigate('/clubs') }} 
                  className="flex-1 py-2 rounded-xl text-sm font-medium transition-all hover:bg-black/5" 
                  style={{ color: '#666' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleJoinClub} 
                  disabled={isJoining}
                  className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2" 
                  style={{ background: '#E63946' }}
                >
                  {isJoining ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join Club'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={() => setShowLeaveConfirm(false)}>
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
            <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(230,57,70,0.1)' }}>
                <LogOut size={28} style={{ color: '#E63946' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1a2e' }}>Leave {club.name}?</h3>
              <p className="text-sm mb-4" style={{ color: '#666' }}>You will lose access to all discussions in this club.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLeaveConfirm(false)} className="flex-1 py-2 rounded-xl text-sm font-medium transition-all hover:bg-black/5" style={{ color: '#666' }}>Cancel</button>
                <button onClick={confirmLeave} disabled={isLeaving} className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: '#E63946' }}>
                  {isLeaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Leaving...
                    </>
                  ) : (
                    'Leave'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={() => setShowDeleteConfirm(false)}>
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
            <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(230,57,70,0.1)' }}>
                <Trash2 size={28} style={{ color: '#E63946' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1a2e' }}>Delete {club.name}?</h3>
              <p className="text-sm mb-4" style={{ color: '#666' }}>Type <strong>{club.name}</strong> to confirm deletion.</p>
              <input
                type="text"
                value={confirmUsername}
                onChange={(e) => setConfirmUsername(e.target.value)}
                placeholder={`Type "${club.name}"`}
                className="w-full px-4 py-2 rounded-xl focus:outline-none text-sm bg-white mb-4"
                style={{ border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                disabled={isDeleting}
              />
              <div className="flex gap-3">
                <button onClick={() => { setShowDeleteConfirm(false); setConfirmUsername('') }} className="flex-1 py-2 rounded-xl text-sm font-medium transition-all hover:bg-black/5" style={{ color: '#666' }} disabled={isDeleting}>
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2" 
                  style={{ background: '#E63946' }} 
                  disabled={confirmUsername !== club.name || isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {showTransferConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={() => setShowTransferConfirm(false)}>
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
            <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(251,191,36,0.1)' }}>
                <CrownIcon size={28} style={{ color: '#FBBF24' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1a2e' }}>Transfer Ownership</h3>
              <p className="text-sm mb-4" style={{ color: '#666' }}>Select the new owner from admins list:</p>
              
              <div className="mb-4">
                {transferAdmins.length === 0 ? (
                  <p className="text-sm" style={{ color: '#999' }}>No other admins available to transfer ownership to.</p>
                ) : (
                  <select
                    value={selectedTransferUser}
                    onChange={(e) => setSelectedTransferUser(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl focus:outline-none transition-all duration-200 text-sm bg-white"
                    style={{ border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
                  >
                    <option value="">Select an admin...</option>
                    {transferAdmins.map((admin) => (
                      <option key={admin._id} value={admin._id}>
                        {admin.displayName || admin.username}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowTransferConfirm(false)} className="flex-1 py-2 rounded-xl text-sm font-medium transition-all hover:bg-black/5" style={{ color: '#666' }}>Cancel</button>
                <button 
                  onClick={confirmTransfer} 
                  className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2" 
                  style={{ background: '#FBBF24' }} 
                  disabled={!selectedTransferUser || transferAdmins.length === 0 || isTransferring}
                >
                  {isTransferring ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Transferring...
                    </>
                  ) : (
                    'Transfer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateDiscussion && (
        <CreateDiscussion
          onClose={() => setShowCreateDiscussion(false)}
          onSubmit={handleCreateDiscussion}
        />
      )}
      {showSettings && club && (
        <ClubSettings
          club={club}
          isOwner={isOwner}
          isAdmin={isAdmin}
          onClose={() => setShowSettings(false)}
          onUpdate={refresh}
          onDelete={() => {
            setShowSettings(false)
            window.location.href = '/clubs'
          }}
        />
      )}
      {showMembers && club && (
        <MembersList
          clubId={club._id}
          isAdmin={isAdmin}
          isOwner={isOwner}
          onClose={() => setShowMembers(false)}
          onTransfer={(userId) => {
            setShowMembers(false)
            refresh()
          }}
        />
      )}
    </div>
  )
}