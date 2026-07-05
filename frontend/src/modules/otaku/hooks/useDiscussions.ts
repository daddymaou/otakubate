import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import {
  Discussion,
  getClubDiscussions,
  getDiscussion,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  addReaction,
  removeReaction
} from '../api/otakuApi'
import toast from 'react-hot-toast'

export const useDiscussions = (clubId: string) => {
  const { user } = useAuthStore()
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  })

  const fetchDiscussions = useCallback(async (page: number = 1) => {
    if (!clubId) return

    try {
      setLoading(true)
      const response = await getClubDiscussions(clubId, page)
      setDiscussions(response.discussions || [])
      setPagination(response.pagination)
    } catch (error: any) {
      console.error('Failed to fetch discussions:', error)
      toast.error(error.response?.data?.error || 'Failed to load discussions')
    } finally {
      setLoading(false)
    }
  }, [clubId])

  const create = useCallback(async (data: {
    title: string
    content?: string
    image?: string
  }) => {
    try {
      const newDiscussion = await createDiscussion({
        clubId,
        ...data
      })
      setDiscussions(prev => [newDiscussion, ...prev])
      toast.success('Discussion posted! 📝')
      return newDiscussion
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create discussion')
      throw error
    }
  }, [clubId])

  const update = useCallback(async (discussionId: string, data: {
    title?: string
    content?: string
    image?: string | null
  }) => {
    try {
      const updated = await updateDiscussion(discussionId, data)
      setDiscussions(prev => prev.map(d => d._id === discussionId ? updated : d))
      toast.success('Discussion updated!')
      return updated
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update discussion')
      throw error
    }
  }, [])

  const remove = useCallback(async (discussionId: string) => {
    console.log('🗑️ Removing discussion:', discussionId)
    try {
      await deleteDiscussion(discussionId)
      setDiscussions(prev => prev.filter(d => d._id !== discussionId))
      toast.success('Discussion deleted')
    } catch (error: any) {
      console.error('❌ Delete discussion error:', error.response?.data)
      toast.error(error.response?.data?.error || 'Failed to delete discussion')
      throw error
    }
  }, [])

  const react = useCallback(async (discussionId: string, emoji: string) => {
    try {
      const result = await addReaction(discussionId, emoji)
      setDiscussions(prev => prev.map(d => {
        if (d._id === discussionId) {
          return {
            ...d,
            reactions: result.reactions
          }
        }
        return d
      }))
      return result
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add reaction')
      throw error
    }
  }, [])

  const unreact = useCallback(async (discussionId: string, emoji: string) => {
    try {
      const result = await removeReaction(discussionId, emoji)
      setDiscussions(prev => prev.map(d => {
        if (d._id === discussionId) {
          return {
            ...d,
            reactions: result.reactions
          }
        }
        return d
      }))
      return result
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove reaction')
      throw error
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchDiscussions(pagination.currentPage)
  }, [fetchDiscussions, pagination.currentPage])

  useEffect(() => {
    if (clubId) {
      fetchDiscussions(1)
    }
  }, [clubId])

  return {
    discussions,
    loading,
    pagination,
    create,
    update,
    remove,
    react,
    unreact,
    refresh,
    fetchDiscussions
  }
}

export const useDiscussion = (discussionId: string) => {
  const [discussion, setDiscussion] = useState<Discussion | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDiscussion = useCallback(async () => {
    if (!discussionId) return

    try {
      setLoading(true)
      const data = await getDiscussion(discussionId)
      setDiscussion(data)
    } catch (error: any) {
      console.error('Failed to fetch discussion:', error)
      toast.error(error.response?.data?.error || 'Failed to load discussion')
    } finally {
      setLoading(false)
    }
  }, [discussionId])

  const react = useCallback(async (emoji: string) => {
    if (!discussion) return

    try {
      const result = await addReaction(discussion._id, emoji)
      setDiscussion(prev => prev ? {
        ...prev,
        reactions: result.reactions
      } : null)
      return result
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add reaction')
      throw error
    }
  }, [discussion])

  const unreact = useCallback(async (emoji: string) => {
    if (!discussion) return

    try {
      const result = await removeReaction(discussion._id, emoji)
      setDiscussion(prev => prev ? {
        ...prev,
        reactions: result.reactions
      } : null)
      return result
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove reaction')
      throw error
    }
  }, [discussion])

  useEffect(() => {
    if (discussionId) {
      fetchDiscussion()
    }
  }, [discussionId])

  return {
    discussion,
    loading,
    react,
    unreact,
    refresh: fetchDiscussion
  }
}