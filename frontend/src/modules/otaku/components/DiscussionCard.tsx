import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { 
  MoreVertical, Trash2, Share2,
  Copy, Loader2
} from 'lucide-react'
import Avatar from '../../../components/ui/Avatar'
import ShareModal from './ShareModal'
import { useAuthStore } from '../../../stores/authStore'
import toast from 'react-hot-toast'

interface DiscussionCardProps {
  discussion: any
  clubSlug: string
  isAdmin: boolean
  isOwner: boolean
  onReact: (discussionId: string, emoji: string) => void
  onUnreact: (discussionId: string, emoji: string) => void
  onDelete?: (discussionId: string) => void
}

const REACTIONS = ['❤️', '🔥', '💀', '✨', '👀']

export default function DiscussionCard({
  discussion,
  clubSlug,
  isAdmin,
  isOwner,
  onReact,
  onUnreact,
  onDelete
}: DiscussionCardProps) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isAuthor = discussion.authorId?._id === user?._id
  const canDelete = isAdmin || isOwner || isAuthor

  const getReactionCount = (emoji: string) => {
    const reaction = discussion.reactions?.find((r: any) => r.emoji === emoji)
    return reaction?.users?.length || 0
  }

  const hasUserReacted = (emoji: string) => {
    const reaction = discussion.reactions?.find((r: any) => r.emoji === emoji)
    return reaction?.users?.includes(user?._id) || false
  }

  const handleReaction = (emoji: string) => {
    if (hasUserReacted(emoji)) {
      onUnreact(discussion._id, emoji)
    } else {
      onReact(discussion._id, emoji)
    }
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/clubs/${clubSlug}/discussion/${discussion._id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied!')
    setShowMenu(false)
  }

  const handleDelete = async () => {
    if (!onDelete) return
    
    setIsDeleting(true)
    try {
      console.log('🗑️ Deleting discussion:', discussion._id)
      await onDelete(discussion._id)
      toast.success('Discussion deleted')
      setShowDeleteConfirm(false)
      setShowMenu(false)
    } catch (error: any) {
      console.error('❌ Delete failed:', error)
      toast.error(error.response?.data?.error || 'Failed to delete discussion')
    } finally {
      setIsDeleting(false)
    }
  }

  const goToProfile = (username: string) => {
    if (username) {
      navigate(`/profile/${username}`)
    }
  }

  return (
    <>
      <div 
        className="group rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg"
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(26,26,46,0.06)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(230,57,70,0.15)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.06)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(26,26,46,0.06)'
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.03)'
        }}
      >
        <div className="p-5">
          {/* ✅ Header - Fixed truncation */}
          <div className="flex items-start justify-between">
            <Link 
              to={`/clubs/${clubSlug}/discussion/${discussion._id}`}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              {/* Avatar - Clickable to profile */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  goToProfile(discussion.authorId?.username)
                }}
                className="flex-shrink-0 hover:opacity-80 transition-opacity"
              >
                <Avatar
                  src={discussion.authorId?.avatar}
                  name={discussion.authorId?.displayName || discussion.authorId?.username || 'User'}
                  size={36}
                  className="ring-2 ring-[rgba(230,57,70,0.06)] rounded-full"
                />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* ✅ Fixed: Truncate long display names */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      goToProfile(discussion.authorId?.username)
                    }}
                    className="font-semibold text-sm hover:underline transition-all truncate max-w-[120px] sm:max-w-[180px]"
                    style={{ color: '#1a1a2e' }}
                  >
                    {discussion.authorId?.displayName || discussion.authorId?.username || 'Unknown'}
                  </button>
                  {discussion.authorId?._id === discussion.clubId?.ownerId && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24' }}>
                      Owner
                    </span>
                  )}
                  {discussion.authorId?._id !== discussion.clubId?.ownerId && 
                   discussion.clubId?.admins?.includes(discussion.authorId?._id) && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA' }}>
                      Admin
                    </span>
                  )}
                </div>
                <span className="text-xs" style={{ color: '#999' }}>
                  {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
                </span>
              </div>
            </Link>

            {/* Menu */}
            {canDelete && (
              <div className="relative flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(!showMenu)
                  }}
                  className="p-1 rounded-lg hover:bg-white/50 transition-colors"
                  style={{ color: '#999' }}
                >
                  <MoreVertical size={16} />
                </button>

                {showMenu && (
                  <div 
                    className="absolute right-0 top-full mt-1 rounded-xl shadow-lg border py-1 min-w-[150px] z-10"
                    style={{ background: '#1a1a2e', borderColor: 'rgba(255,255,255,0.06)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={handleCopyLink}
                      className="w-full px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <Copy size={12} /> Copy Link
                    </button>
                    <button
                      onClick={() => {
                        setShowShareModal(true)
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <Share2 size={12} /> Share
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true)
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-1.5 text-xs text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <Link to={`/clubs/${clubSlug}/discussion/${discussion._id}`}>
            {/* ✅ Fixed: Truncate long titles */}
            <h3 className="font-semibold text-base mt-2 leading-snug truncate max-w-[95%]" style={{ color: '#1a1a2e' }}>
              {discussion.title}
            </h3>
            {/* ✅ Fixed: Truncate long content */}
            {discussion.content && (
              <p className="text-sm mt-1.5 line-clamp-2 leading-relaxed" style={{ color: '#555' }}>
                {discussion.content}
              </p>
            )}
            {discussion.image && (
              <img
                src={discussion.image}
                alt="Discussion image"
                className="mt-3 max-h-[200px] w-full object-cover rounded-lg"
                loading="lazy"
              />
            )}
          </Link>

          {/* Reactions */}
          <div className="flex items-center gap-1 mt-4 pt-3 flex-wrap" style={{ borderTop: '1px solid rgba(26,26,46,0.06)' }}>
            {REACTIONS.map((emoji) => {
              const count = getReactionCount(emoji)
              const isReacted = hasUserReacted(emoji)
              return (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReaction(emoji)
                  }}
                  className={`text-sm px-2 py-0.5 rounded-full flex items-center gap-0.5 transition-all duration-200 ${
                    isReacted ? 'scale-105' : 'hover:bg-white/50'
                  }`}
                  style={{
                    background: isReacted ? 'rgba(230,57,70,0.08)' : 'transparent',
                    border: isReacted ? '1px solid rgba(230,57,70,0.15)' : 'none'
                  }}
                >
                  <span>{emoji}</span>
                  <span className="text-xs font-medium" style={{ color: '#999' }}>{count}</span>
                </button>
              )
            })}

            <div className="flex-1" />

            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowShareModal(true)
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/50 transition-all duration-200 text-xs font-medium"
              style={{ color: '#999' }}
            >
              <Share2 size={14} />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="rounded-2xl p-6 max-w-sm w-full"
            style={{ background: '#FFF8EE', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full" style={{ background: 'rgba(230,57,70,0.08)' }}>
                <Trash2 size={20} style={{ color: '#E63946' }} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>Delete Discussion?</h3>
            </div>
            <p className="text-sm mb-4" style={{ color: '#666' }}>
              This action cannot be undone. All reactions will also be removed.
            </p>
            <div className="flex gap-3 items-center justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/50"
                style={{ 
                  background: 'rgba(255,255,255,0.5)',
                  color: '#1a1a2e',
                  border: '1px solid rgba(26,26,46,0.06)'
                }}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: '#E63946' }}
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
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          post={{
            _id: discussion._id,
            title: discussion.title,
            content: discussion.content,
            image: discussion.image,
            communityId: { slug: clubSlug }
          }}
        />
      )}
    </>
  )
}