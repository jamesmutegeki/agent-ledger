"use client"

import { useState } from "react"
import { LogIn, UserPlus, BookOpen, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { AmbientBackground } from "./ambient-background"

interface LoginFormProps {
  onComplete?: () => void
}

export function LoginForm({ onComplete }: LoginFormProps) {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result =
      mode === "login"
        ? await login(email, password)
        : await signup(name, email, password)

    setLoading(false)

    if (!result.ok) {
      setError(result.error || "An error occurred")
      return
    }

    onComplete?.()
  }

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login")
    setError(null)
  }

  return (
    <div className="min-h-screen bg-green-50/40 dark:bg-zinc-950 flex items-center justify-center p-4 relative">
      <AmbientBackground />
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-green-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-lg font-bold text-green-800 dark:text-green-400">Agent Ledger</h1>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
            {mode === "login" ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@example.com"
              required
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={4}
                className="w-full px-3 py-2.5 pr-10 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 text-center bg-red-50 dark:bg-red-950/30 py-2 rounded-md">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full flex items-center justify-center gap-2 font-medium py-2.5 px-4 rounded-lg text-sm transition-all shadow-sm",
              loading
                ? "bg-green-400 text-white cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white active:scale-[0.98]"
            )}
          >
            {loading ? (
              "Please wait..."
            ) : mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-gray-400 dark:text-zinc-500 text-center mt-4">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button onClick={switchMode} className="text-green-600 dark:text-green-400 hover:underline font-medium">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={switchMode} className="text-green-600 dark:text-green-400 hover:underline font-medium">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
