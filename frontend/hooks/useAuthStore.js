import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (token, user) => {
    set({ token, user, isAuthenticated: true })
  },

  clearAuth: () => {
    set({ token: null, user: null, isAuthenticated: false })
  },

  initAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const user_id = localStorage.getItem('user_id')
      
      if (token && user_id) {
        set({ token, user: { id: user_id }, isAuthenticated: true })
      }
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    set({ token: null, user: null, isAuthenticated: false })
  },
}))

export { useAuthStore }
