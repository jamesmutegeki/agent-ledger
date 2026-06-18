export function safeGetItem(key: string, fallback: string | null = null): string | null {
  if (typeof window === "undefined") return fallback
  try {
    return localStorage.getItem(key)
  } catch (e) {
    console.warn("localStorage.getItem failed:", e)
    return fallback
  }
}

export function safeSetItem(key: string, value: string): boolean {
  if (typeof window === "undefined") return false
  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    console.warn("localStorage.setItem failed:", e)
    return false
  }
}

export function safeRemoveItem(key: string): boolean {
  if (typeof window === "undefined") return false
  try {
    localStorage.removeItem(key)
    return true
  } catch (e) {
    console.warn("localStorage.removeItem failed:", e)
    return false
  }
}

export function safeJSONParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}
