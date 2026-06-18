"use client"

import { useState } from "react"
import { LogIn, UserPlus, Eye, EyeOff } from "lucide-react"
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
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-4 relative">
      <AmbientBackground />
      <div className="w-full max-w-sm bg-white dark:bg-[#141414] rounded-2xl p-8 shadow-lg shadow-black/5 dark:shadow-black/20">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Agent Ledger
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1.5">
            {mode === "login" ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@example.com"
              required
              className="w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
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
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 text-center py-2 px-3 rounded-lg bg-red-50 dark:bg-red-950/30">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full flex items-center justify-center gap-2 font-medium py-2.5 px-4 rounded-lg text-sm transition-all",
              loading
                ? "bg-gray-200 dark:bg-zinc-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-[0.98]"
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

        <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-6">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button onClick={switchMode} className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium hover:underline transition-all">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={switchMode} className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium hover:underline transition-all">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
