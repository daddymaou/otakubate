import { useState, useRef } from 'react'
import { X, Image, Loader2, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../lib/api'

interface CreateDiscussionProps {
  onClose: () => void
  onSubmit: (data: { title: string; content: string; image?: string }) => void
}

export default function CreateDiscussion({ onClose, onSubmit }: CreateDiscussionProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    setIsSubmitting(true)
    try {
      let imageUrl = ''

      // Upload image if exists
      if (imageFile) {
        setIsUploading(true)
        const formData = new FormData()
        formData.append('image', imageFile)
        const res = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        imageUrl = res.data.url
        setIsUploading(false)
      }

      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        image: imageUrl || undefined
      })
      setTitle('')
      setContent('')
      setImageFile(null)
      setImagePreview(null)
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create discussion')
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-10 blur-xl" />
        
        <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(230,57,70,0.1)' }}>
            <div className="flex items-center gap-2">
              <Sparkles size={18} style={{ color: '#E63946' }} />
              <h2 className="font-bold" style={{ color: '#1a1a2e' }}>New Discussion</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
              style={{ color: '#999' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Title Input */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Discussion title..."
              className="w-full px-4 py-2.5 rounded-xl focus:outline-none transition-all duration-200 text-sm font-medium bg-white"
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

            {/* Content Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's your discussion about? (optional)"
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl focus:outline-none transition-all duration-200 text-sm resize-none bg-white"
              style={{ border: '1px solid rgba(230,57,70,0.15)', color: '#555' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#E63946'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230,57,70,0.08)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(230,57,70,0.15)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />

            {/* Image Upload */}
            <div
              className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
                isDragging ? 'border-[#E63946] bg-[rgba(230,57,70,0.04)]' : 'border-[rgba(230,57,70,0.15)] hover:border-[rgba(230,57,70,0.3)]'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Upload preview"
                    className="w-full max-h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(null) }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-6 flex flex-col items-center gap-2 transition-colors"
                >
                  <div className="p-2 rounded-full" style={{ background: 'rgba(230,57,70,0.06)' }}>
                    <Image size={20} style={{ color: '#E63946' }} />
                  </div>
                  <span className="text-xs" style={{ color: '#999' }}>
                    Click or drag to upload an image
                  </span>
                  <span className="text-[10px]" style={{ color: '#ccc' }}>
                    PNG, JPG, GIF up to 5MB
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t" style={{ borderColor: 'rgba(230,57,70,0.1)' }}>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-black/5"
              style={{ color: '#666' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || isSubmitting || isUploading}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#E63946' }}
            >
              {isSubmitting || isUploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                'Post Discussion'
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </div>
  )
}