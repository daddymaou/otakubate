import { useState, useRef, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, MoreHorizontal, Trash2, AlertTriangle, X, Heart, MessageCircle, Edit2, Check, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import PostCard from '../components/feed/PostCard'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

// Single Comment Component with replies, edit, like
function CommentItem({ comment, postAuthorId, onDelete, onEdit, onLike, onReply, level = 0 }: { 
  comment: any; 
  postAuthorId: string; 
  onDelete: (id: string) => void;
  onEdit: (id: string, newContent: string) => void;
  onLike: (id: string) => void;
  onReply: (parentId: string, authorName: string) => void;
  level?: number;
}) {
  const { user } = useAuthStore()
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isLiking, setIsLiking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  const isCommentAuthor = user?._id === comment.author?._id
  const isPostAuthor = user?._id === postAuthorId
  const canDelete = isCommentAuthor || isPostAuthor

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit(comment._id, editContent)
    }
    setIsEditing(false)
  }

  const handleReply = () => {
    if (replyContent.trim() && !isReplying) {
      setIsReplying(true)
      onReply(comment._id, replyContent)
      setReplyContent('')
      setShowReplyInput(false)
      setTimeout(() => setIsReplying(false), 500)
    }
  }

  const handleLike = () => {
    if (isLiking) return
    setIsLiking(true)
    onLike(comment._id)
    setTimeout(() => setIsLiking(false), 300)
  }

  const handleDelete = () => {
    if (isDeleting) return
    setIsDeleting(true)
    onDelete(comment._id)
    setTimeout(() => setIsDeleting(false), 300)
  }

  return (
    <div className={`relative ${level > 0 ? 'ml-6 pl-3 border-l-2' : ''}`} style={{ borderLeftColor: 'rgba(230,57,70,0.15)' }}>
      <div className="p-3 rounded-xl transition-all duration-200 hover:bg-black/5" style={{ background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(230, 57, 70, 0.08)' }}>
        <div className="flex gap-2 sm:gap-3">
          <Link to={`/profile/${comment.author?.username}`} className="flex-shrink-0">
            <Avatar src={comment.author?.avatar} name={comment.author?.displayName || comment.author?.username} size={32} />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Link to={`/profile/${comment.author?.username}`} className="font-semibold text-sm hover:underline" style={{ color: '#1a1a2e' }}>
                  {comment.author?.displayName || comment.author?.username}
                </Link>
                {comment.author?.isVerified && <span className="text-xs" style={{ color: '#E63946' }}>✓</span>}
                <span className="text-xs" style={{ color: '#999' }}>
                  · {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
                {comment.isEdited && <span className="text-xs" style={{ color: '#bbb' }}>(edited)</span>}
              </div>
              
              <div className="relative" ref={menuRef}>
                <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded-lg transition-all duration-200 hover:bg-black/5" style={{ color: '#999' }}>
                  <MoreHorizontal size={14} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-32 rounded-xl py-1 z-20 shadow-lg animate-fade-in" style={{ background: '#FFF8EE', border: '1px solid rgba(230, 57, 70, 0.1)' }}>
                    {isCommentAuthor && (
                      <button onClick={() => { setIsEditing(true); setShowMenu(false) }} className="w-full px-3 py-1.5 text-xs text-left hover:bg-black/5 transition flex items-center gap-2" style={{ color: '#666' }}>
                        <Edit2 size={12} /> Edit
                      </button>
                    )}
                    {canDelete && (
                      <button 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full px-3 py-1.5 text-xs text-left hover:bg-black/5 transition flex items-center gap-2 disabled:opacity-50" 
                        style={{ color: '#E63946' }}
                      >
                        {isDeleting ? <Spinner size={12} color="red" /> : <Trash2 size={12} />} 
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <div className="mt-2">
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(230,57,70,0.2)', color: '#1a1a2e' }}
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={handleEdit} className="px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1" style={{ background: '#10B981', color: '#fff' }}>
                    <Check size={12} /> Save
                  </button>
                  <button onClick={() => setIsEditing(false)} className="px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1" style={{ background: 'rgba(0,0,0,0.05)', color: '#666' }}>
                    <XCircle size={12} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm mt-1 leading-relaxed break-words" style={{ color: '#1a1a2e' }}>
                {comment.content}
              </p>
            )}
            
            <div className="flex items-center gap-3 mt-2">
              <button 
                onClick={handleLike}
                disabled={isLiking}
                className="flex items-center gap-1 text-xs transition-all duration-200 hover:scale-105 disabled:opacity-50"
                style={{ color: comment.isLiked ? '#E63946' : '#999' }}
              >
                {isLiking ? <Spinner size={10} color={comment.isLiked ? 'red' : 'gray'} /> : <Heart size={12} fill={comment.isLiked ? 'currentColor' : 'none'} />}
                <span>{comment.likesCount || 0}</span>
              </button>
              <button 
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center gap-1 text-xs hover:scale-105 transition-all duration-200"
                style={{ color: '#999' }}
              >
                <MessageCircle size={12} />
                <span>Reply</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reply Input */}
      {showReplyInput && (
        <div className="mt-2 ml-8">
          <div className="flex gap-2">
            <input
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              placeholder={`Reply to ${comment.author?.displayName || comment.author?.username}...`}
              className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(230,57,70,0.2)', color: '#1a1a2e' }}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleReply()}
              disabled={isReplying}
            />
            <button 
              onClick={handleReply} 
              disabled={!replyContent.trim() || isReplying}
              className="px-3 py-2 rounded-xl text-sm font-medium flex items-center justify-center min-w-[40px] disabled:opacity-50"
              style={{ background: '#E63946', color: '#fff' }}
            >
              {isReplying ? <Spinner size={14} color="white" /> : <Send size={14} />}
            </button>
          </div>
        </div>
      )}
      
      {/* Replies */}
      {comment.replies?.map((reply: any) => (
        <CommentItem
          key={reply._id}
          comment={reply}
          postAuthorId={postAuthorId}
          onDelete={onDelete}
          onEdit={onEdit}
          onLike={onLike}
          onReply={onReply}
          level={level + 1}
        />
      ))}
    </div>
  )
}

// Delete Comment Modal
function DeleteCommentModal({ isOpen, onClose, onConfirm, isDeleting }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; isDeleting: boolean }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={onClose}>
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
        <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-3xl p-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(230,57,70,0.1)' }}>
              <Trash2 size={28} style={{ color: '#E63946' }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1a2e' }}>Delete Comment?</h3>
            <p className="text-sm" style={{ color: '#666' }}>This action cannot be undone.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={isDeleting} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ background: 'rgba(0,0,0,0.05)', color: '#666' }}>
              Cancel
            </button>
            <button 
              onClick={onConfirm} 
              disabled={isDeleting}
              className="flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50" 
              style={{ background: '#E63946', color: '#fff' }}
            >
              {isDeleting ? <Spinner size={14} color="white" /> : null}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()  // ✅ ADDED for navigation
  const { user } = useAuthStore()
  const [comment, setComment] = useState('')
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const qc = useQueryClient()

  const { data: pd, isLoading: postLoading } = useQuery({ 
    queryKey: ['post', id], 
    queryFn: () => api.get(`/posts/${id}`).then(r => r.data) 
  })
  
  const { data: cd, isLoading: commentsLoading } = useQuery({ 
    queryKey: ['comments', id], 
    queryFn: () => api.get(`/comments/post/${id}`).then(r => r.data) 
  })

  // ✅ ADDED: Handle post deletion - navigate to feed
  const handlePostDelete = () => {
    navigate('/feed')
  }

  const commentMutation = useMutation({
    mutationFn: () => api.post('/comments', { content: comment, postId: id }),
    onSuccess: () => { 
      setComment(''); 
      setIsSubmittingComment(false)
      qc.invalidateQueries({ queryKey: ['comments', id] }); 
      qc.invalidateQueries({ queryKey: ['post', id] });
      toast.success('Comment added.')
    },
    onError: (e: any) => {
      setIsSubmittingComment(false)
      toast.error(e.response?.data?.message || 'Failed to post comment')
    },
  })

  const replyMutation = useMutation({
    mutationFn: ({ parentId, content }: { parentId: string; content: string }) => 
      api.post('/comments', { content, postId: id, parentId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', id] })
      toast.success('Reply added!')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to post reply'),
  })

  const editCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      api.put(`/comments/${commentId}`, { content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', id] })
      toast.success('Comment updated!')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to edit comment'),
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.delete(`/comments/${commentId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', id] })
      qc.invalidateQueries({ queryKey: ['post', id] })
      toast.success('Comment deleted!')
      setDeleteCommentId(null)
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to delete comment'),
  })

  const likeCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.post(`/comments/${commentId}/like`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', id] })
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to like comment'),
  })

  const handleSubmitComment = () => {
    if (!comment.trim() || isSubmittingComment) return
    setIsSubmittingComment(true)
    commentMutation.mutate()
  }

  if (postLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={48} />
      </div>
    )
  }

  if (!pd?.post) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(230, 57, 70, 0.1)' }}>
            <AlertTriangle size={48} style={{ color: '#E63946' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#1a1a2e' }}>Post Not Found</h2>
          <p className="text-sm mb-6" style={{ color: '#999' }}>The post you're looking for doesn't exist.</p>
          <Link to="/feed" className="px-6 py-2 rounded-full text-sm font-medium" style={{ background: '#1a1a2e', color: '#fff' }}>
            Go to Feed
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <DeleteCommentModal 
        isOpen={!!deleteCommentId}
        onClose={() => setDeleteCommentId(null)}
        onConfirm={() => deleteCommentId && deleteCommentMutation.mutate(deleteCommentId)}
        isDeleting={deleteCommentMutation.isPending}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6 pb-32 space-y-4">
        {/* ✅ UPDATED: PostCard with onDelete callback */}
        <PostCard 
          post={pd.post} 
          queryKey={['post', id]} 
          onDelete={handlePostDelete}  // ✅ Pass callback to navigate away
        />

        {/* Comment Input */}
        <div className="rounded-2xl p-4 transition-all duration-300" style={{ background: 'rgba(255, 255, 255, 0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(230, 57, 70, 0.08)' }}>
          <div className="flex gap-3">
            <Avatar src={user?.avatar} name={user?.displayName || user?.username} size={40} className="flex-shrink-0 hidden sm:block" />
            <Avatar src={user?.avatar} name={user?.displayName || user?.username} size={36} className="flex-shrink-0 block sm:hidden" />
            <div className="flex-1 min-w-0">
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Write a comment... (use @username to mention)"
                className="w-full rounded-xl px-4 py-2 text-sm focus:outline-none transition-all duration-200 resize-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(230, 57, 70, 0.15)',
                  color: '#1a1a2e',
                  minHeight: '70px'
                }}
                rows={2}
                disabled={isSubmittingComment}
              />
              
              <div className="flex items-center justify-end mt-3 gap-2 flex-wrap">
                <button 
                  onClick={handleSubmitComment}
                  disabled={!comment.trim() || isSubmittingComment}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50 flex items-center gap-2 hover:scale-105"
                  style={{
                    background: comment.trim() ? '#E63946' : 'rgba(230, 57, 70, 0.3)',
                    color: '#fff'
                  }}
                >
                  {isSubmittingComment ? <Spinner size={14} color="white" /> : <Send size={14} />}
                  <span className="hidden sm:inline">{isSubmittingComment ? 'Posting...' : 'Post'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <h3 className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>Comments</h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(230, 57, 70, 0.1)', color: '#E63946' }}>
              {cd?.comments?.length || 0}
            </span>
          </div>

          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size={28} />
            </div>
          ) : cd?.comments?.length === 0 ? (
            <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(230, 57, 70, 0.08)' }}>
              <MessageCircle size={40} className="mx-auto mb-3 opacity-30" style={{ color: '#999' }} />
              <p className="text-sm" style={{ color: '#999' }}>No comments yet</p>
              <p className="text-xs mt-1" style={{ color: '#bbb' }}>Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cd?.comments?.map((comment: any) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  postAuthorId={pd.post.author?._id}
                  onDelete={(id) => setDeleteCommentId(id)}
                  onEdit={(id, content) => editCommentMutation.mutate({ commentId: id, content })}
                  onLike={(id) => likeCommentMutation.mutate(id)}
                  onReply={(parentId, content) => replyMutation.mutate({ parentId, content })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </>
  )
}