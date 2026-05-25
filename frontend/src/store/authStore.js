import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const AUTH_STORAGE_KEY = 'legalconnect-auth'

const authStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') {
      return null
    }

    return window.localStorage.getItem(name) || window.sessionStorage.getItem(name)
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') {
      return
    }

    let rememberMe = true
    try {
      const parsed = JSON.parse(value)
      rememberMe = parsed?.state?.rememberMe !== false
    } catch {
      rememberMe = true
    }

    const primaryStorage = rememberMe ? window.localStorage : window.sessionStorage
    const secondaryStorage = rememberMe ? window.sessionStorage : window.localStorage

    primaryStorage.setItem(name, value)
    secondaryStorage.removeItem(name)
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.removeItem(name)
    window.sessionStorage.removeItem(name)
  },
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      pendingRegistration: null,
      rememberMe: true,

      setAuth: (user, token, rememberMe = true) => {
        set({ user, token, isAuthenticated: true, rememberMe })
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
        set({ user: null, token: null, isAuthenticated: false, rememberMe: true })
      },

      isAdmin: () => get().user?.role === 'admin',
      isLawyer: () => get().user?.role === 'lawyer',
      isClient: () => get().user?.role === 'client',
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => authStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
    }
  )
)
