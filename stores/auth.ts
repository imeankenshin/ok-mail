interface AuthState {
  isAuthenticated: boolean
  userEmail: string | null
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    userEmail: null,
    error: null
  }),

  actions: {
    setAuthenticated(email: string) {
      this.isAuthenticated = true
      this.userEmail = email
      this.error = null
    },

    setError(error: string) {
      this.isAuthenticated = false
      this.userEmail = null
      this.error = error
    },

    logout() {
      this.isAuthenticated = false
      this.userEmail = null
      this.error = null
    }
  }
})
