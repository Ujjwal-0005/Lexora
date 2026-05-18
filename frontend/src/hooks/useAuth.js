import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export const useLogin = () => {
  const { setAuth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials) => {
      const response = await api.post('/auth/login', credentials)
      return response.data
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token)
      queryClient.invalidateQueries(['user'])
      toast.success('Welcome back!')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
    },
  })
}

export const useRegister = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userData) => {
      const response = await api.post('/auth/register', userData)
      return response.data
    },
    onSuccess: (data) => {
      // Registration initiated; OTP should be sent. Caller will store pending payload.
      queryClient.invalidateQueries(['user'])
      toast.success(data.message || 'OTP sent to your email')
    },
    onError: (error) => {
      const data = error.response?.data
      // Laravel returns validation errors as data.errors (object of arrays)
      if (data?.errors) {
        const firstError = Object.values(data.errors).flat()[0]
        toast.error(firstError || 'Registration failed')
      } else {
        const message = data?.message || 'Registration failed'
        toast.error(message)
      }
    },
  })
}

export const useLogout = () => {
  const { logout } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/logout')
      return response.data
    },
    onSuccess: () => {
      logout()
      queryClient.clear()
      toast.success('Logged out successfully')
    },
    onError: () => {
      logout()
      queryClient.clear()
    },
  })
}

export const useMe = () => {
  const { token } = useAuthStore()

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      if (!token) return null
      const response = await api.get('/auth/me')
      return response.data.user
    },
    enabled: !!token,
  })
}

export const useVerifyOtp = () => {
  const { setAuth, clearPendingRegistration } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload) => {
      const response = await api.post('/auth/verify-otp', payload)
      return response.data
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token)
      clearPendingRegistration()
      queryClient.invalidateQueries(['user'])
      toast.success('Account verified! Redirecting...')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Verification failed'
      toast.error(message)
    },
  })
}
