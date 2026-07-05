import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import {
  Club,
  getClubs,
  getRandomClubs,
  getClub,
  createClub,
  updateClub,
  deleteClub,
  getClubMembers
} from '../api/otakuApi'
import toast from 'react-hot-toast'

export const useClubs = () => {
  const { user } = useAuthStore()
  const [clubs, setClubs] = useState<Club[]>([])
  const [randomClubs, setRandomClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  })

  const fetchClubs = useCallback(async (page: number = 1) => {
    try {
      setLoading(true)
      const response = await getClubs(page)
      setClubs(response.clubs || [])
      setPagination(response.pagination)
    } catch (error: any) {
      console.error('Failed to fetch clubs:', error)
      toast.error('Failed to load clubs')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchRandomClubs = useCallback(async () => {
    try {
      const data = await getRandomClubs(6)
      setRandomClubs(data)
    } catch (error: any) {
      console.error('Failed to fetch random clubs:', error)
    }
  }, [])

  const create = useCallback(async (data: { name: string; description?: string; avatar?: string; banner?: string }) => {
    try {
      const newClub = await createClub(data)
      setClubs(prev => [newClub, ...prev])
      toast.success('Club created! 🎉')
      return newClub
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create club')
      throw error
    }
  }, [])

  const update = useCallback(async (id: string, data: { name?: string; description?: string; avatar?: string; banner?: string }) => {
    try {
      const updated = await updateClub(id, data)
      setClubs(prev => prev.map(c => c._id === id ? updated : c))
      toast.success('Club updated!')
      return updated
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update club')
      throw error
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    try {
      await deleteClub(id)
      setClubs(prev => prev.filter(c => c._id !== id))
      toast.success('Club deleted')
      return true
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete club')
      throw error
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchClubs(pagination.currentPage)
    await fetchRandomClubs()
  }, [fetchClubs, fetchRandomClubs, pagination.currentPage])

  useEffect(() => {
    fetchClubs(1)
    fetchRandomClubs()
  }, [])

  return {
    clubs,
    randomClubs,
    loading,
    pagination,
    create,
    update,
    remove,
    refresh,
    fetchClubs,
    fetchRandomClubs
  }
}

export const useClub = (slug?: string) => {
  const { user } = useAuthStore()
  const [club, setClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<any[]>([])
  const [membersLoading, setMembersLoading] = useState(false)

  const fetchClub = useCallback(async () => {
    if (!slug) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await getClub(slug)
      setClub(data)
    } catch (error: any) {
      console.error('Failed to fetch club:', error)
      toast.error(error.response?.data?.error || 'Failed to load club')
    } finally {
      setLoading(false)
    }
  }, [slug])

  const fetchMembers = useCallback(async () => {
    if (!club?._id) return

    try {
      setMembersLoading(true)
      const data = await getClubMembers(club._id)
      setMembers(data.members || [])
    } catch (error: any) {
      console.error('Failed to fetch members:', error)
    } finally {
      setMembersLoading(false)
    }
  }, [club?._id])

  const refresh = useCallback(async () => {
    await fetchClub()
  }, [fetchClub])

  useEffect(() => {
    fetchClub()
  }, [fetchClub])

  useEffect(() => {
    if (club?._id) {
      fetchMembers()
    }
  }, [club?._id, fetchMembers])

  return {
    club,
    loading,
    members,
    membersLoading,
    isAdmin: club?.isAdmin || false,
    isOwner: club?.isOwner || false,
    isMember: club?.isMember || false,
    refresh,
    fetchMembers
  }
}