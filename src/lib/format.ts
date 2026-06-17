export function formatTimestamp(date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? "PM" : "AM"
  const h12 = hours % 12 || 12
  return `${h12}:${minutes.toString().padStart(2, "0")} ${ampm}`
}

export function formatTimestampAgo(minutesAgo: number): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() - minutesAgo)
  return formatTimestamp(now)
}

export function formatCurrency(amount: number): string {
  return `UGX ${amount.toLocaleString()}`
}
