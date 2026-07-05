import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, Trash2, Users, MoreVertical, Copy } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useClub } from '../hooks/useClubs'
import { useDiscussion } from '../hooks/useDiscussions'
import Avatar from '../../../components/ui/Avatar'
import Spinner from '../../../components/ui/Spinner'
import toast from 'react-hot-toast'
import ShareModal from '../components/ShareModal'
import { useState } from 'react'

const REACTIONS = ['❤️', '🔥', '💀', '✨', '👀']

export default function DiscussionDetail() {
  const { slug, discussionId } = useParams<{ slug: string; discussionId: string }>()
  const navigate = useNavigate()
  const [showShareModal, setShowShareModal] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { club, loading: clubLoading, isAdmin, isOwner, isMember, refresh } = useClub(slug || '')
  const { discussion, loading, react, unreact, refresh: refreshDiscussion } = useDiscussion(discussionId || '')

  const handleBack = () => navigate(`/clubs/${slug}`)

  const getReactionCount = (emoji: string) => {
    const reaction = discussion?.reactions?.find((r: any) => r.emoji === emoji)
    return reaction?.users?.length || 0
  }

  const hasUserReacted = (emoji: string) => {
    const reaction = discussion?.reactions?.find((r: any) => r.emoji === emoji)
    return reaction?.users?.includes(localStorage.getItem('userId') || '') || false
  }

  const handleReact = (emoji: string) => {
    if (!discussion) return
    if (hasUserReacted(emoji)) {
      unreact(emoji)
    } else {
      react(emoji)
    }
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
    setShowMenu(false)
  }

  const confirmDelete = () => {
    if (!discussion) return
    toast.success('Discussion deleted')
    navigate(`/clubs/${slug}`)
    setShowDeleteConfirm(false)
  }

  const handleJoinClub = async () => {
    setIsJoining(true)
    try {
      toast.success('Joined club! 🎉')
      await refresh()
    } catch (error) {
      toast.error('Failed to join club')
    } finally {
      setIsJoining(false)
    }
  }

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success('Link copied!')
    setShowMenu(false)
  }

  if (loading || clubLoading || !discussion) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#FFF8EE' }}>
        <Spinner size={48} />
      </div>
    )
  }

  const canDelete = isAdmin || isOwner || discussion.authorId?._id === localStorage.getItem('userId')

  // Get user ID with fallback
  const userId = localStorage.getItem('userId') || ''

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #F5F0E8 0%, #FFE8E8 100%)' }}>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-4 p-2 rounded-lg hover:bg-white/50 transition-colors flex items-center gap-2"
          style={{ color: '#1a1a2e' }}
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Club</span>
        </button>

        {/* Join Club Banner */}
        {!isMember && club && (
          <div className="mb-4 p-4 rounded-2xl flex items-center justify-between" style={{ background: 'rgba(230,57,70,0.06)', border: '1px solid rgba(230,57,70,0.1)' }}>
            <div className="flex items-center gap-3">
              <Users size={20} style={{ color: '#E63946' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>Join {club.name}</p>
                <p className="text-xs" style={{ color: '#999' }}>Join to react and participate</p>
              </div>
            </div>
            <button
              onClick={handleJoinClub}
              disabled={isJoining}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
              style={{ background: '#E63946' }}
            >
              {isJoining ? <Spinner size={16} /> : 'Join Club'}
            </button>
          </div>
        )}

        {/* Discussion Card */}
        <div 
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(26,26,46,0.06)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}
        >
          <div className="p-6">
            {/* Author */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/profile/${discussion.authorId?.username}`)}
                  className="hover:opacity-80 transition-opacity"
                >
                  <Avatar
                    src={discussion.authorId?.avatar}
                    name={discussion.authorId?.displayName || discussion.authorId?.username || 'User'}
                    size={40}
                    className="ring-2 ring-[rgba(230,57,70,0.08)] rounded-full"
                  />
                </button>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => navigate(`/profile/${discussion.authorId?.username}`)}
                      className="font-semibold text-sm hover:underline transition-all"
                      style={{ color: '#1a1a2e' }}
                    >
                      {discussion.authorId?.displayName || discussion.authorId?.username || 'Unknown'}
                    </button>
                    {club?.ownerId === discussion.authorId?._id && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24' }}>
                        Owner
                      </span>
                    )}
                    {club?.admins?.includes(discussion.authorId?._id) && club?.ownerId !== discussion.authorId?._id && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA' }}>
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: '#999' }}>
                    {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {/* Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                  style={{ color: '#999' }}
                >
                  <MoreVertical size={18} />
                </button>
                {showMenu && (
                  <div 
                    className="absolute right-0 top-full mt-1 rounded-xl shadow-lg border py-1 min-w-[160px] z-10"
                    style={{ background: '#1a1a2e', borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <button
                      onClick={handleCopyLink}
                      className="w-full px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-2 text-left"
                    >
                      <Copy size={12} /> Copy Link
                    </button>
                    <button
                      onClick={() => { setShowShareModal(true); setShowMenu(false) }}
                      className="w-full px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-2 text-left"
                    >
                      <Share2 size={12} /> Share
                    </button>
                    {canDelete && (
                      <button
                        onClick={handleDelete}
                        className="w-full px-3 py-1.5 text-xs text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2 text-left"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold mt-4" style={{ color: '#1a1a2e' }}>
              {discussion.title}
            </h1>

            {/* Content */}
            {discussion.content && (
              <p className="text-sm mt-3 whitespace-pre-wrap leading-relaxed" style={{ color: '#555' }}>
                {discussion.content}
              </p>
            )}

            {/* Image */}
            {discussion.image && (
              <img
                src={discussion.image}
                alt="Discussion image"
                className="mt-3 max-h-[500px] w-full object-cover rounded-lg"
                loading="lazy"
              />
            )}

            {/* Reactions */}
            <div className="flex items-center gap-2 mt-5 pt-4 flex-wrap" style={{ borderTop: '1px solid rgba(26,26,46,0.06)' }}>
              {REACTIONS.map((emoji) => {
                const count = getReactionCount(emoji)
                const isReacted = hasUserReacted(emoji)
                return (
                  <button
                    key={emoji}
                    onClick={() => handleReact(emoji)}
                    className={`text-sm px-2.5 py-1 rounded-full flex items-center gap-1 transition-all duration-200 ${
                      isReacted ? 'scale-105' : 'hover:bg-white/50'
                    }`}
                    style={{
                      background: isReacted ? 'rgba(230,57,70,0.08)' : 'transparent',
                      border: isReacted ? '1px solid rgba(230,57,70,0.15)' : '1px solid transparent'
                    }}
                  >
                    <span>{emoji}</span>
                    <span className="text-xs font-medium" style={{ color: '#999' }}>{count}</span>
                  </button>
                )
              })}

              <div className="flex-1" />

              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg hover:bg-white/50 transition-all duration-200 text-xs font-medium"
                style={{ color: '#999' }}
              >
                <Share2 size={14} />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={() => setShowDeleteConfirm(false)}>
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
            <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(230,57,70,0.1)' }}>
                <Trash2 size={28} style={{ color: '#E63946' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1a2e' }}>Delete Discussion?</h3>
              <p className="text-sm mb-4" style={{ color: '#666' }}>This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 rounded-xl text-sm font-medium transition-all hover:bg-black/5" style={{ color: '#666' }}>Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105" style={{ background: '#E63946' }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && discussion && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          post={{
            _id: discussion._id || '',
            title: discussion.title || '',
            content: discussion.content || '',
            image: discussion.image || '',
            communityId: { slug: slug || '' }
          }}
        />
      )}
    </div>
  )
}