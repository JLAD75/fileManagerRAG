import { jwtDecode } from 'jwt-decode'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user_data'

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

export const setUserData = (user: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

export const getUserData = () => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem(USER_KEY)
    return userData ? JSON.parse(userData) : null
  }
  return null
}

export const removeAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

export const checkAuth = (): boolean => {
  const token = getAuthToken()
  if (!token) return false

  try {
    const decoded: any = jwtDecode(token)
    const currentTime = Date.now() / 1000

    if (decoded.exp < currentTime) {
      removeAuthData()
      return false
    }

    return true
  } catch (error) {
    removeAuthData()
    return false
  }
}
