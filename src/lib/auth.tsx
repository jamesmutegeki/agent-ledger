"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { safeGetItem, safeSetItem, safeRemoveItem } from "./storage"

export type AgentUser = {
  id: string
  name: string
  email: string
  machineId: string
}

type AuthContextType = {
  user: AgentUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  demoLogin: () => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  sessionId: string
}

const AuthContext = createContext<AuthContextType | null>(null)

const SESSION_ID_KEY = "agent-ledger-session-id"
const USERS_KEY = "agent-ledger-users"
const CURRENT_USER_KEY = "agent-ledger-current-user"

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AgentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionId] = useState(() => safeGetItem(SESSION_ID_KEY) || generateSessionId())

  // Persist session ID
  useEffect(() => {
    safeSetItem(SESSION_ID_KEY, sessionId)
  }, [sessionId])

  // Restore user on mount
  useEffect(() => {
    const raw = safeGetItem(CURRENT_USER_KEY)
    if (raw) {
      try {
        setUser(JSON.parse(raw))
      } catch {
        safeRemoveItem(CURRENT_USER_KEY)
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const raw = safeGetItem(USERS_KEY)
    const users: { email: string; password: string; name: string; id: string }[] = raw
      ? JSON.parse(raw)
      : []

    const found = users.find((u) => u.email === email && u.password === password)
    if (!found) {
      return { ok: false, error: "Invalid email or password" }
    }

    const agentUser: AgentUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      machineId: `MC-${found.id.slice(0, 6).toUpperCase()}`,
    }

    setUser(agentUser)
    safeSetItem(CURRENT_USER_KEY, JSON.stringify(agentUser))
    return { ok: true }
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    if (!email || !password || !name) {
      return { ok: false, error: "All fields are required" }
    }
    if (password.length < 4) {
      return { ok: false, error: "Password must be at least 4 characters" }
    }

    const raw = safeGetItem(USERS_KEY)
    const users: { email: string; password: string; name: string; id: string }[] = raw
      ? JSON.parse(raw)
      : []

    if (users.some((u) => u.email === email)) {
      return { ok: false, error: "Email already registered" }
    }

    const id = crypto.randomUUID?.() || `user_${Date.now()}`
    users.push({ id, name, email, password })
    safeSetItem(USERS_KEY, JSON.stringify(users))

    const agentUser: AgentUser = { id, name, email, machineId: `MC-${id.slice(0, 6).toUpperCase()}` }
    setUser(agentUser)
    safeSetItem(CURRENT_USER_KEY, JSON.stringify(agentUser))
    return { ok: true }
  }, [])

  const demoLogin = useCallback(async () => {
    const raw = safeGetItem(USERS_KEY)
    const users: { email: string; password: string; name: string; id: string }[] = raw
      ? JSON.parse(raw)
      : []

    let demoUser = users.find((u) => u.email === "demo@agent-ledger.app")

    if (!demoUser) {
      const id = crypto.randomUUID?.() || `user_${Date.now()}`
      demoUser = { id, name: "Demo Agent", email: "demo@agent-ledger.app", password: "demo123" }
      users.push(demoUser)
      safeSetItem(USERS_KEY, JSON.stringify(users))
    }

    const agentUser: AgentUser = {
      id: demoUser.id,
      name: demoUser.name,
      email: demoUser.email,
      machineId: `MC-${demoUser.id.slice(0, 6).toUpperCase()}`,
    }

    setUser(agentUser)
    safeSetItem(CURRENT_USER_KEY, JSON.stringify(agentUser))
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    safeRemoveItem(CURRENT_USER_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, demoLogin, logout, sessionId }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
