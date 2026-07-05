import { useState, useEffect, useCallback } from 'react'
import { 
  onOnlineUsers, 
  offOnlineUsers, 
  onUserOnlineStatus,
  offUserOnlineStatus,
  getOnlineUsers,
  socket
} from '../lib/socket'

interface OnlineStatus {
  userId: string
  isOnline: boolean
}

export function useOnlineStatus(userId?: string) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [isOnline, setIsOnline] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Get initial online users
  useEffect(() => {
    if (socket.connected) {
      getOnlineUsers()
    }
  }, [])

  // Listen for online users list updates
  useEffect(() => {
    const handleOnlineUsers = (users: string[]) => {
      setOnlineUsers(users)
      setIsLoading(false)
    }

    onOnlineUsers(handleOnlineUsers)

    return () => {
      offOnlineUsers()
    }
  }, [])

  // Listen for individual user online status changes
  useEffect(() => {
    const handleUserStatus = (data: { userId: string; isOnline: boolean }) => {
      setOnlineUsers(prev => {
        if (data.isOnline) {
          // Add user to online list if not already there
          if (!prev.includes(data.userId)) {
            return [...prev, data.userId]
          }
          return prev
        } else {
          // Remove user from online list
          return prev.filter(id => id !== data.userId)
        }
      })

      // Update individual user status if watching specific user
      if (userId && data.userId === userId) {
        setIsOnline(data.isOnline)
      }
    }

    onUserOnlineStatus(handleUserStatus)

    return () => {
      offUserOnlineStatus()
    }
  }, [userId])

  // Check if specific user is online
  const checkUserOnline = useCallback((userIdToCheck: string): boolean => {
    return onlineUsers.includes(userIdToCheck)
  }, [onlineUsers])

  // Get all online users
  const getOnlineUsersList = useCallback((): string[] => {
    return onlineUsers
  }, [onlineUsers])

  // Get count of online users
  const getOnlineCount = useCallback((): number => {
    return onlineUsers.length
  }, [onlineUsers])

  // Refresh online users
  const refreshOnlineUsers = useCallback(() => {
    if (socket.connected) {
      getOnlineUsers()
    }
  }, [])

  // Set specific user online status
  useEffect(() => {
    if (userId) {
      setIsOnline(onlineUsers.includes(userId))
    }
  }, [userId, onlineUsers])

  return {
    onlineUsers,
    isOnline,
    isLoading,
    checkUserOnline,
    getOnlineUsersList,
    getOnlineCount,
    refreshOnlineUsers,
  }
}