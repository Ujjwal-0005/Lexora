import { keepPreviousData, useQuery } from '@tanstack/react-query'
import api from '../api/axios'

export const useLawyers = (filters = {}) => {
  const { specialization, regionId, minRating, maxFee, search, sortBy, sortOrder, availability } = filters

  return useQuery({
    queryKey: ['lawyers', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (Array.isArray(specialization)) {
        specialization.forEach((item) => {
          if (item) params.append('specialization[]', item)
        })
      } else if (specialization) {
        params.append('specialization', specialization)
      }
      if (regionId) params.append('region_id', regionId)
      if (minRating) params.append('min_rating', minRating)
      if (maxFee) params.append('max_fee', maxFee)
      if (search) params.append('search', search)
      if (sortBy) params.append('sort_by', sortBy)
      if (sortOrder) params.append('sort_order', sortOrder)
      if (availability) params.append('availability', availability)

      const response = await api.get(`/lawyers?${params.toString()}`)
      return response.data
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useLawyer = (id) => {
  return useQuery({
    queryKey: ['lawyer', id],
    queryFn: async () => {
      const response = await api.get(`/lawyers/${id}`)
      return response.data.lawyer
    },
    enabled: !!id,
  })
}

export const useLawyerAvailability = (id, duration = 30) => {
  return useQuery({
    queryKey: ['lawyer-availability', id, duration],
    queryFn: async () => {
      const response = await api.get(`/lawyers/${id}/availability`, { params: { duration } })
      return response.data.availability
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  })
}

export const useLawyerReviews = (id) => {
  return useQuery({
    queryKey: ['lawyer-reviews', id],
    queryFn: async () => {
      const response = await api.get(`/lawyers/${id}/reviews`)
      return response.data
    },
    enabled: !!id,
  })
}
