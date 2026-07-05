import api from '../../../lib/api'

export interface Club {
  _id: string
  name: string
  slug: string
  description: string
  avatar: string
  banner: string
  membersCount: number
  discussionsCount: number
  isAdmin: boolean
  isOwner: boolean
  isMember: boolean
  admins: string[]
  ownerId: string
  members: string[]
  createdAt: string
}

export interface Discussion {
  _id: string
  clubId: string
  authorId: {
    _id: string
    username: string
    displayName: string
    avatar: string
  }
  title: string
  content: string
  image: string | null
  reactions: {
    emoji: string
    users: string[]
  }[]
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  success: boolean
  clubs?: T[]
  discussions?: T[]
  pagination: {
    currentPage: number
    totalPages: number
    total: number
  }
}

// ============================================
// CLUB API CALLS
// ============================================

export const getClubs = async (page: number = 1, limit: number = 20): Promise<PaginatedResponse<Club>> => {
  const response = await api.get(`/otaku/clubs?page=${page}&limit=${limit}`)
  return response.data
}

export const getRandomClubs = async (limit: number = 6): Promise<Club[]> => {
  const response = await api.get(`/otaku/clubs/random?limit=${limit}`)
  return response.data.clubs || []
}

export const getClub = async (slug: string): Promise<Club> => {
  const response = await api.get(`/otaku/clubs/${slug}`)
  return response.data.club
}

export const createClub = async (data: { name: string; description?: string; avatar?: string; banner?: string }): Promise<Club> => {
  const response = await api.post('/otaku/clubs', data)
  return response.data.club
}

export const updateClub = async (id: string, data: { name?: string; description?: string; avatar?: string; banner?: string }): Promise<Club> => {
  const response = await api.put(`/otaku/clubs/${id}`, data)
  return response.data.club
}

export const deleteClub = async (id: string): Promise<void> => {
  await api.delete(`/otaku/clubs/${id}`)
}

export const getClubMembers = async (id: string): Promise<any> => {
  const response = await api.get(`/otaku/clubs/${id}/members`)
  return response.data
}

// ============================================
// DISCUSSION API CALLS
// ============================================

export const createDiscussion = async (data: { clubId: string; title: string; content?: string; image?: string }): Promise<Discussion> => {
  const response = await api.post('/otaku/discussions', data)
  return response.data.discussion
}

export const getClubDiscussions = async (
  clubId: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Discussion>> => {
  const response = await api.get(`/otaku/discussions/club/${clubId}`, {
    params: { page, limit }
  })
  return response.data
}

export const getDiscussion = async (discussionId: string): Promise<Discussion> => {
  const response = await api.get(`/otaku/discussions/${discussionId}`)
  return response.data.discussion
}

export const updateDiscussion = async (discussionId: string, data: { title?: string; content?: string; image?: string | null }): Promise<Discussion> => {
  const response = await api.put(`/otaku/discussions/${discussionId}`, data)
  return response.data.discussion
}

export const deleteDiscussion = async (discussionId: string): Promise<void> => {
  await api.delete(`/otaku/discussions/${discussionId}`)
}

export const addReaction = async (discussionId: string, emoji: string): Promise<{ reactions: { emoji: string; users: string[] }[] }> => {
  const response = await api.post(`/otaku/discussions/${discussionId}/reactions`, { emoji })
  return response.data
}

export const removeReaction = async (discussionId: string, emoji: string): Promise<{ reactions: { emoji: string; users: string[] }[] }> => {
  const response = await api.delete(`/otaku/discussions/${discussionId}/reactions/${emoji}`)
  return response.data
}