/**
 * AuthContext — JWT-based auth for Cyber-Masry
 * Persists token in localStorage. Falls back gracefully if backend is offline.
 */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

const API = 'http://localhost:5000'

export interface AuthUser {
    id: number
    username: string
    student_id: string
    email: string
    is_admin: boolean
    total_score: number
}

interface AuthContextType {
    user: AuthUser | null
    token: string | null
    loading: boolean
    login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>
    signup: (username: string, studentId: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>
    logout: () => void
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('cm_token'))
    const [loading, setLoading] = useState(true)

    const authHeaders = useCallback((tok: string) => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tok}`,
    }), [])

    const refreshUser = useCallback(async () => {
        const tok = localStorage.getItem('cm_token')
        if (!tok) { setLoading(false); return }
        try {
            const res = await fetch(`${API}/api/auth/me`, {
                headers: authHeaders(tok),
                signal: AbortSignal.timeout(4000),
            })
            if (!res.ok) { localStorage.removeItem('cm_token'); setToken(null); setUser(null) }
            else { const data = await res.json(); setUser(data.user) }
        } catch {
            // Backend offline — keep local token for offline mode, no user shown
        } finally {
            setLoading(false)
        }
    }, [authHeaders])

    useEffect(() => { refreshUser() }, [refreshUser])

    const login = async (username: string, password: string) => {
        try {
            const res = await fetch(`${API}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                signal: AbortSignal.timeout(5000),
            })
            const data = await res.json()
            if (!res.ok) return { ok: false, error: data.error || 'Login failed' }
            localStorage.setItem('cm_token', data.token)
            setToken(data.token)
            setUser(data.user)
            return { ok: true }
        } catch {
            return { ok: false, error: 'Cannot reach server — check backend is running' }
        }
    }

    const signup = async (username: string, studentId: string, email: string, password: string) => {
        try {
            const res = await fetch(`${API}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, student_id: studentId, email, password }),
                signal: AbortSignal.timeout(5000),
            })
            const data = await res.json()
            if (!res.ok) return { ok: false, error: data.error || 'Signup failed' }
            localStorage.setItem('cm_token', data.token)
            setToken(data.token)
            setUser(data.user)
            return { ok: true }
        } catch {
            return { ok: false, error: 'Cannot reach server — check backend is running' }
        }
    }

    const logout = () => {
        localStorage.removeItem('cm_token')
        localStorage.removeItem('cm_progress')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
