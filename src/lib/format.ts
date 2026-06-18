export function formatTimestamp(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "--:-- --"
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? "PM" : "AM"
  const h12 = hours % 12 || 12
  return `${h12}:${minutes.toString().padStart(2, "0")} ${ampm}`
}

export function formatTimestampAgo(minutesAgo: number): string {
  const now = new Date()
  const past = new Date(now.getTime() - minutesAgo * 60 * 1000)
  return formatTimestamp(past)
}

export function formatCurrency(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) return "UGX 0"
  return `UGX ${amount.toLocaleString()}`
}

export function formatDate(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "--"
  return date.toLocaleDateString("en-UG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatTimeAgo(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) return ""
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  return `${diffDays}d ago`
}
