import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'

export const useMessages = (consultationId) => {
  return useQuery({
    queryKey: ['messages', consultationId],
    queryFn: async () => {
      const response = await api.get('/messages', {
        params: { consultation_id: consultationId },
      })
      return response.data.messages
    },
    enabled: !!consultationId,
    refetchInterval: 5000, // Poll every 5 seconds
  })
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ consultationId, message, type = 'text' }) => {
      const response = await api.post('/messages', {
        consultation_id: consultationId,
        message,
        type,
      })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['messages', variables.consultationId])
    },
  })
}

export const useMarkMessageRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (messageId) => {
      const response = await api.put(`/messages/${messageId}/read`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages'])
    },
  })
}

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/messages/conversations')
      return response.data.conversations
    },
    refetchInterval: 10000, // Keep notification dropdown updated
    refetchOnWindowFocus: true,
  })
}

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      const response = await api.get('/messages/unread-count')
      return response.data.unread_count
    },
    refetchInterval: 10000, // Poll every 10 seconds
  })
}

export const useUnreadMessages = () => {
  return useQuery({
    queryKey: ['unread-messages'],
    queryFn: async () => {
      const response = await api.get('/messages/unread')
      return response.data.messages
    },
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  })
}
