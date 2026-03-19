import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import type { AuthUser, JwtClaims, LoginResponse } from '@/types/auth'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  login: (response: LoginResponse) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function decodeToken(token: string): AuthUser | null {
  try {
    const claims = jwtDecode<JwtClaims>(token)
    if (Date.now() / 1000 > claims.exp) return null
    return {
      id: claims.sub,
      email: claims.email,
      role: claims.role,
      firstName: claims.given_name,
      lastName: claims.family_name,
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('token')
    return stored ? decodeToken(stored) : null
  })

  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token)
      if (!decoded) {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      } else {
        setUser(decoded)
      }
    }
  }, [token])

  function login(response: LoginResponse) {
    localStorage.setItem('token', response.token)
    setToken(response.token)
    setUser(decodeToken(response.token))
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

// Separate component that uses useNavigate — must be rendered inside a Router
export function LogoutHandler() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
  }, [user, navigate])

  return null
}
