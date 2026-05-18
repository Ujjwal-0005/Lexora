import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import toast from 'react-hot-toast'

export const useConsultations = () => {
  return useQuery({
    queryKey: ['consultations'],
    queryFn: async () => {
      const response = await api.get('/consultations')
      return response.data.consultations
    },
  })
}

export const useConsultation = (id) => {
  return useQuery({
    queryKey: ['consultation', id],
    queryFn: async () => {
      const response = await api.get(`/consultations/${id}`)
      return response.data.consultation
    },
    enabled: !!id,
  })
}

export const useCreateConsultation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/consultations', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['consultations'])
      toast.success('Consultation booked successfully!')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to book consultation'
      toast.error(message)
    },
  })
}

export const useUpdateConsultationStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, meetingLink }) => {
      const response = await api.put(`/consultations/${id}/status`, {
        status,
        meeting_link: meetingLink,
      })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['consultation', variables.id])
      queryClient.invalidateQueries(['consultations'])
      toast.success('Status updated successfully')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update status'
      toast.error(message)
    },
  })
}
