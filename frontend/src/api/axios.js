import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      config.headers = { ...config.headers }
      delete config.headers['Content-Type']
      delete config.headers.common?.['Content-Type']
      delete config.headers.post?.['Content-Type']
      delete config.headers.put?.['Content-Type']
      delete config.headers.patch?.['Content-Type']
    }
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token expiry without breaking public auth flows.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const token = useAuthStore.getState().token

    // Allow certain requests to opt-out of the global 401 auto-logout behavior
    const skipAutoLogout = error.config?.headers?.['X-Skip-Auth-Logout'] || error.config?.headers?.['x-skip-auth-logout']

    if (status === 401 && token && !skipAutoLogout) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api
