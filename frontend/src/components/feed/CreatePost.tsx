import { useState, useRef, useEffect } from 'react'
import { Image, AlertTriangle, X, Smile, Send, AtSign, Hash, Plus, Circle, Trash2, Camera, User, Users, Eye } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import Avatar from '../ui/Avatar'
import Spinner from '../ui/Spinner'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

// MentionPreview component for live preview with colored mentions
function MentionPreview({ content }: { content: string }) {
  const mentionRegex = /@(\w+)/g
  const parts = []
  let lastIndex = 0
  let match
  
  mentionRegex.lastIndex = 0
  
  while ((match = mentionRegex.exec(content)) !== null) {
    const username = match[1]
    const fullMatch = match[0]
    const matchIndex = match.index
    
    if (matchIndex > lastIndex) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex, matchIndex)
      })
    }
    
    parts.push({
      type: 'mention',
      username: username,
      content: fullMatch
    })
    
    lastIndex = matchIndex + fullMatch.length
  }
  
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.substring(lastIndex)
    })
  }
  
  return (
    <span className="whitespace-pre-wrap break-words text-sm">
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          return (
            <span
              key={index}
              className="inline-block"
              style={{ color: '#E63946', fontWeight: 500 }}
            >
              @{part.username}
            </span>
          )
        }
        return <span key={index} style={{ color: '#666' }}>{part.content}</span>
      })}
    </span>
  )
}

// Debounce function for search
const useDebounce = (value: string, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function CreatePost({ communityId }: { communityId?: string }) {
  const { user } = useAuthStore()
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [tags, setTags] = useState('')
  const [spoiler, setSpoiler] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [showMobileActions, setShowMobileActions] = useState(false)
  const [showMobileMention, setShowMobileMention] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionUsers, setMentionUsers] = useState<any[]>([])
  const [showMentions, setShowMentions] = useState(false)
  const [mentionInput, setMentionInput] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  
  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mentionInputRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  // Debounce mention search
  const debouncedMentionQuery = useDebounce(mentionQuery, 300)

  // Search for users when typing
  useEffect(() => {
    if (debouncedMentionQuery.length >= 2) {
      const searchUsers = async () => {
        try {
          const { data } = await api.get(`/users/search?q=${encodeURIComponent(debouncedMentionQuery)}`)
          setMentionUsers(data.users || [])
        } catch (error) {
          console.error('Failed to search users:', error)
          setMentionUsers([])
        }
      }
      searchUsers()
    } else {
      setMentionUsers([])
    }
  }, [debouncedMentionQuery])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [content])

  // Handle mention selection
  const handleMentionSelect = (selectedUser: any) => {
    const mentionText = `@${selectedUser.username} `
    setContent(prev => prev + mentionText)
    setMentionInput('')
    setMentionQuery('')
    setShowMentions(false)
    setMentionUsers([])
    setShowMobileMention(false)
    
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
  }

  // Handle mention input change
  const handleMentionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMentionInput(value)
    setMentionQuery(value)
    
    if (value.length >= 2) {
      setShowMentions(true)
    } else {
      setShowMentions(false)
      setMentionUsers([])
    }
  }

  // Handle mention keydown
  const handleMentionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && mentionUsers.length > 0) {
      e.preventDefault()
      handleMentionSelect(mentionUsers[0])
    }
    if (e.key === 'Escape') {
      setShowMentions(false)
      setMentionUsers([])
      setMentionInput('')
      setShowMobileMention(false)
    }
  }

  const mutation = useMutation({
    mutationFn: () => api.post('/posts', { 
      content, 
      images, 
      tags: tags.split(',').map(t => t.trim()).filter(Boolean), 
      community: communityId, 
      spoilerWarning: spoiler 
    }),
    onSuccess: () => { 
      setContent(''); 
      setImages([]); 
      setTags(''); 
      setSpoiler(false); 
      setShowMobileActions(false);
      setShowMobileMention(false);
      setShowMentions(false);
      setMentionUsers([]);
      setMentionInput('');
      setShowPreview(false);
      qc.invalidateQueries({ queryKey: ['posts'] }); 
      if (communityId) {
        qc.invalidateQueries({ queryKey: ['community-posts', communityId] });
      }
      toast.success('Post Added.') 
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to post'),
  })

  const uploadImage = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('image', file)
      const { data } = await api.post('/upload/image', fd)
      setImages(prev => [...prev, data.url])
      toast.success('Image uploaded!')
    } catch { 
      toast.error('Image upload failed') 
    }
    setUploading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' && (e.metaKey || e.ctrlKey)) && content.trim() && !mutation.isPending && !isOverLimit) {
      e.preventDefault()
      mutation.mutate()
    }
  }

  const characterCount = content.length
  const isOverLimit = characterCount > 2000
  const isValid = content.trim() && !isOverLimit
  const hasMentions = /@\w+/.test(content)

  // Toggle preview
  const togglePreview = () => {
    setShowPreview(!showPreview)
  }

  return (
    <div className="relative">
      {/* Mention Suggestions Dropdown */}
      {showMentions && mentionUsers.length > 0 && (
        <div 
          className="absolute z-50 w-64 max-h-48 overflow-y-auto rounded-xl shadow-lg"
          style={{
            top: '100%',
            left: 0,
            marginTop: '4px',
            background: '#FFF8EE',
            border: '1px solid rgba(230,57,70,0.15)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div className="p-1">
            {mentionUsers.map((user: any) => (
              <button
                key={user._id}
                onClick={() => handleMentionSelect(user)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 transition-colors"
              >
                <Avatar 
                  src={user.avatar} 
                  name={user.displayName || user.username} 
                  size={28} 
                />
                <div className="text-left">
                  <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>
                    {user.displayName || user.username}
                  </p>
                  <p className="text-xs" style={{ color: '#999' }}>
                    @{user.username}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div 
        className="rounded-2xl transition-all duration-300"
        style={{
          background: isFocused 
            ? 'rgba(255, 255, 255, 0.75)' 
            : 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(12px)',
          border: isFocused 
            ? '1px solid rgba(230, 57, 70, 0.3)' 
            : '1px solid rgba(230, 57, 70, 0.08)',
          boxShadow: isFocused 
            ? '0 8px 24px rgba(230, 57, 70, 0.12)' 
            : '0 4px 16px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div className="p-3 sm:p-4">
          <div className="flex gap-3">
            {/* Avatar */}
            <Avatar 
              src={user?.avatar} 
              name={user?.displayName || user?.username} 
              size={44} 
              className="flex-shrink-0 hidden xs:block"
            />
            <Avatar 
              src={user?.avatar} 
              name={user?.displayName || user?.username} 
              size={36} 
              className="flex-shrink-0 block xs:hidden"
            />
            
            {/* Post Input Area */}
            <div className="flex-1 min-w-0">
              <textarea 
                ref={textareaRef}
                value={content} 
                onChange={e => setContent(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setIsFocused(false)
                  setTimeout(() => setShowMentions(false), 200)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Share your thoughts about anime, manga, or light novels..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  fontSize: '15px',
                  color: '#1a1a2e',
                  resize: 'none',
                  outline: 'none',
                  minHeight: '70px',
                  maxHeight: '200px',
                  lineHeight: 1.5,
                  fontFamily: "'Segoe UI', system-ui, sans-serif"
                }}
                className="placeholder-gray-400 scrollbar-thin"
                maxLength={2000}
              />
              
              {/* Preview Toggle Button */}
              {content.length > 10 && (
                <button
                  onClick={togglePreview}
                  className="text-xs mt-1 transition-colors hover:underline flex items-center gap-1"
                  style={{ color: '#E63946' }}
                >
                  <Eye size={12} />
                  {showPreview ? 'Hide preview' : hasMentions ? 'Preview mentions' : 'Preview'}
                </button>
              )}
              
              {/* Live Preview with colored mentions */}
              {showPreview && content.trim() && (
                <div 
                  className="mt-2 p-3 rounded-xl"
                  style={{ 
                    background: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(230,57,70,0.1)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#999' }}>
                      Preview
                    </span>
                    {hasMentions && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(230,57,70,0.1)', color: '#E63946' }}>
                        Mentions highlighted
                      </span>
                    )}
                  </div>
                  <div className="text-sm whitespace-pre-wrap break-words" style={{ color: '#1a1a2e' }}>
                    <MentionPreview content={content} />
                  </div>
                  {images.length > 0 && (
                    <div className="mt-2 text-xs" style={{ color: '#999' }}>
                      📷 {images.length} image{images.length > 1 ? 's' : ''} attached
                    </div>
                  )}
                  {spoiler && (
                    <div className="mt-1 text-xs" style={{ color: '#E63946' }}>
                      ⚠️ Spoiler warning enabled
                    </div>
                  )}
                </div>
              )}
              
              {/* Character Counter */}
              {content.length > 50 && (
                <div 
                  className="text-xs text-right mt-1 transition-all duration-200"
                  style={{ color: isOverLimit ? '#E63946' : '#999' }}
                >
                  {characterCount}/2000 {isOverLimit && <span className="ml-1">Too long!</span>}
                </div>
              )}
              
              {/* Image Previews */}
              {images.length > 0 && (
                <div className={`grid gap-2 mt-3 ${
                  images.length === 1 ? 'grid-cols-1' : 
                  images.length === 2 ? 'grid-cols-2' : 
                  'grid-cols-2 sm:grid-cols-3'
                }`}>
                  {images.map((img, i) => (
                    <div key={i} className="relative group aspect-video">
                      <img 
                        src={img} 
                        className="rounded-xl w-full h-full object-cover transition-all duration-200 group-hover:brightness-90"
                        style={{ border: '1px solid rgba(230, 57, 70, 0.1)' }}
                        alt="Upload preview"
                      />
                      <button 
                        onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} 
                        className="absolute top-2 right-2 rounded-full p-1.5 transition-all duration-200 opacity-90 hover:opacity-100"
                        style={{
                          background: 'rgba(0, 0, 0, 0.6)',
                          backdropFilter: 'blur(4px)'
                        }}
                      >
                        <X size={14} style={{ color: '#fff' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Action Buttons - Desktop */}
              <div 
                className="hidden sm:flex pt-3 mt-3 items-center gap-2 flex-wrap"
                style={{ borderTop: '1px solid rgba(230, 57, 70, 0.08)' }}
              >
                {/* Image Upload */}
                <input 
                  ref={fileRef} 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} 
                  multiple
                />
                <button 
                  onClick={() => fileRef.current?.click()} 
                  disabled={uploading} 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl transition-all duration-200 hover:scale-105"
                  style={{
                    color: '#999',
                    background: 'transparent'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(26, 26, 46, 0.05)'
                    e.currentTarget.style.color = '#1a1a2e'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#999'
                  }}
                >
                  {uploading ? <Spinner size={16} /> : <Image size={16} />}
                  <span className="text-xs">Image</span>
                </button>
                
                {/* Spoiler Toggle */}
                <button 
                  onClick={() => setSpoiler(!spoiler)} 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl transition-all duration-200 hover:scale-105"
                  style={{
                    color: spoiler ? '#E63946' : '#999',
                    background: spoiler ? 'rgba(230, 57, 70, 0.1)' : 'transparent'
                  }}
                  onMouseEnter={e => {
                    if (!spoiler) {
                      e.currentTarget.style.background = 'rgba(26, 26, 46, 0.05)'
                      e.currentTarget.style.color = '#1a1a2e'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!spoiler) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#999'
                    }
                  }}
                >
                  <AlertTriangle size={16} />
                  <span className="text-xs">Spoiler</span>
                </button>
                
                {/* Tags Input */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 group hover:bg-black/5">
                  <Hash size={14} style={{ color: '#999' }} />
                  <input 
                    value={tags} 
                    onChange={e => setTags(e.target.value)} 
                    placeholder="Tags" 
                    className="bg-transparent text-xs focus:outline-none w-24"
                    style={{
                      color: '#1a1a2e',
                      fontFamily: "'Segoe UI', system-ui, sans-serif"
                    }}
                    onFocus={e => e.currentTarget.style.color = '#E63946'}
                    onBlur={e => e.currentTarget.style.color = '#1a1a2e'}
                  />
                </div>

                {/* Mention Input */}
                <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 group hover:bg-black/5">
                  <AtSign size={14} style={{ color: '#999' }} />
                  <input 
                    ref={mentionInputRef}
                    value={mentionInput} 
                    onChange={handleMentionInputChange}
                    onKeyDown={handleMentionKeyDown}
                    placeholder="Mention" 
                    className="bg-transparent text-xs focus:outline-none w-20"
                    style={{
                      color: '#1a1a2e',
                      fontFamily: "'Segoe UI', system-ui, sans-serif"
                    }}
                    onFocus={() => {
                      if (mentionInput.length >= 2) {
                        setShowMentions(true)
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowMentions(false), 200)
                    }}
                  />
                  {mentionInput && (
                    <button
                      onClick={() => {
                        setMentionInput('')
                        setMentionQuery('')
                        setShowMentions(false)
                        setMentionUsers([])
                      }}
                      className="p-0.5 rounded-full hover:bg-black/5"
                      style={{ color: '#999' }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Preview button in desktop */}
                {content.length > 10 && (
                  <button
                    onClick={togglePreview}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl transition-all duration-200 hover:scale-105"
                    style={{
                      color: showPreview ? '#E63946' : '#999',
                      background: showPreview ? 'rgba(230,57,70,0.1)' : 'transparent'
                    }}
                  >
                    <Eye size={14} />
                    <span className="text-xs">{showPreview ? 'Hide' : 'Preview'}</span>
                  </button>
                )}

                {/* ✅ FIXED: Post Button for Desktop - Always Visible */}
                <button 
                  onClick={() => mutation.mutate()} 
                  disabled={!isValid || mutation.isPending} 
                  className="ml-auto px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    background: isValid ? '#E63946' : 'rgba(230, 57, 70, 0.3)',
                    color: '#fff'
                  }}
                >
                  {mutation.isPending ? <Spinner size={14} color="white" /> : null}
                  {mutation.isPending ? 'Posting...' : 'Post'}
                </button>
              </div>

              {/* Action Buttons - Mobile */}
              <div className="flex sm:hidden pt-3 mt-3 items-center justify-between" style={{ borderTop: '1px solid rgba(230, 57, 70, 0.08)' }}>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => fileRef.current?.click()} 
                    disabled={uploading}
                    className="p-2 rounded-full transition-all duration-200"
                    style={{ color: '#999', background: 'transparent' }}
                  >
                    {uploading ? <Spinner size={18} /> : <Image size={18} />}
                  </button>
                  
                  <button 
                    onClick={() => setSpoiler(!spoiler)} 
                    className="p-2 rounded-full transition-all duration-200"
                    style={{
                      color: spoiler ? '#E63946' : '#999',
                      background: spoiler ? 'rgba(230, 57, 70, 0.1)' : 'transparent'
                    }}
                  >
                    <AlertTriangle size={18} />
                  </button>
                  
                  <button 
                    onClick={() => setShowMobileMention(!showMobileMention)}
                    className="p-2 rounded-full transition-all duration-200"
                    style={{
                      color: mentionInput ? '#E63946' : '#999',
                      background: mentionInput ? 'rgba(230, 57, 70, 0.1)' : 'transparent'
                    }}
                  >
                    <AtSign size={18} />
                  </button>
                  
                  <button 
                    onClick={() => setShowMobileActions(!showMobileActions)}
                    className="p-2 rounded-full transition-all duration-200"
                    style={{
                      color: tags ? '#E63946' : '#999',
                      background: tags ? 'rgba(230, 57, 70, 0.1)' : 'transparent'
                    }}
                  >
                    <Hash size={18} />
                  </button>
                </div>
                
                {/* Mobile Post Button */}
                <button 
                  onClick={() => mutation.mutate()} 
                  disabled={!isValid || mutation.isPending} 
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center min-w-[70px]"
                  style={{
                    background: isValid ? '#E63946' : 'rgba(230, 57, 70, 0.3)',
                    color: '#fff'
                  }}
                >
                  {mutation.isPending ? <Spinner size={14} color="white" /> : 'Post'}
                </button>
              </div>

              {/* Mobile Expanded Actions */}
              {showMobileActions && (
                <div className="mt-3 pt-3 animate-fade-in" style={{ borderTop: '1px solid rgba(230, 57, 70, 0.08)' }}>
                  <div className="flex items-center gap-2">
                    <Hash size={14} style={{ color: '#E63946' }} />
                    <input 
                      value={tags} 
                      onChange={e => setTags(e.target.value)} 
                      placeholder="Add tags (comma separated)" 
                      className="flex-1 bg-transparent text-sm focus:outline-none"
                      style={{ color: '#1a1a2e', fontFamily: "'Segoe UI', system-ui, sans-serif" }}
                      autoFocus
                    />
                  </div>
                  
                  <button 
                    onClick={() => setShowMobileActions(false)}
                    className="w-full mt-2 py-1.5 text-xs text-center rounded-lg hover:bg-black/5 transition"
                    style={{ color: '#999' }}
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Mobile Mention Input - Separate */}
              {showMobileMention && (
                <div className="mt-3 pt-3 animate-fade-in" style={{ borderTop: '1px solid rgba(230, 57, 70, 0.08)' }}>
                  <div className="flex items-center gap-2">
                    <AtSign size={14} style={{ color: '#E63946' }} />
                    <input 
                      value={mentionInput} 
                      onChange={handleMentionInputChange}
                      onKeyDown={handleMentionKeyDown}
                      placeholder="Search username to mention" 
                      className="flex-1 bg-transparent text-sm focus:outline-none"
                      style={{ color: '#1a1a2e', fontFamily: "'Segoe UI', system-ui, sans-serif" }}
                      autoFocus
                    />
                    {mentionInput && (
                      <button
                        onClick={() => {
                          setMentionInput('')
                          setMentionQuery('')
                          setShowMentions(false)
                          setMentionUsers([])
                          setShowMobileMention(false)
                        }}
                        className="p-1 rounded-full hover:bg-black/5"
                        style={{ color: '#999' }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setShowMobileMention(false)}
                    className="w-full mt-2 py-1.5 text-xs text-center rounded-lg hover:bg-black/5 transition"
                    style={{ color: '#999' }}
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Keyboard hint - Desktop only */}
              {isFocused && !content && (
                <p className="hidden sm:block text-xs mt-2 text-center" style={{ color: '#bbb' }}>
                  Press <kbd className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'rgba(0,0,0,0.05)' }}>⌘ Enter</kbd> or <kbd className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'rgba(0,0,0,0.05)' }}>Ctrl Enter</kbd> to post
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        
        @media (min-width: 480px) {
          .xs\\:block { display: block; }
          .xs\\:hidden { display: none; }
          .xs\\:inline { display: inline; }
        }
      `}</style>
    </div>
  )
}