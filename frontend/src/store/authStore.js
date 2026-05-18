import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      pendingRegistration: null,

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true })
      },

      setPendingRegistration: (payload) => {
        set({ pendingRegistration: payload })
      },

      clearPendingRegistration: () => {
        set({ pendingRegistration: null })
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      isAdmin: () => get().user?.role === 'admin',
      isLawyer: () => get().user?.role === 'lawyer',
      isClient: () => get().user?.role === 'client',
    }),
    {
      name: 'legalconnect-auth',
    }
  )
)
