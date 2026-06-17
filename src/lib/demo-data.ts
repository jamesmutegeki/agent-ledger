import type { Transaction, TransactionType } from "@/components/transaction-form"

function generateId(): string {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

type SeedEntry = {
  type: TransactionType
  amount: number
  reference: string
  isSuccessful: boolean
  minutesAgo: number
}

function generateCommission(type: TransactionType, amount: number): number {
  if (type === "airtime" || type === "bill-payment") return 0
  if (amount <= 0) return 0
  if (amount <= 5000) return 100
  return Math.round(amount * 0.02)
}

const seedEntries: SeedEntry[] = [
  { type: "deposit", amount: 50000, reference: "240615001", isSuccessful: true, minutesAgo: 2 },
  { type: "withdrawal", amount: 15000, reference: "240615002", isSuccessful: true, minutesAgo: 15 },
  { type: "float-topup", amount: 100000, reference: "240615003", isSuccessful: true, minutesAgo: 32 },
  { type: "deposit", amount: 25000, reference: "240615004", isSuccessful: true, minutesAgo: 48 },
  { type: "bill-payment", amount: 8500, reference: "240615005", isSuccessful: false, minutesAgo: 60 },
  { type: "airtime", amount: 5000, reference: "240615006", isSuccessful: true, minutesAgo: 75 },
  { type: "withdrawal", amount: 30000, reference: "240615007", isSuccessful: true, minutesAgo: 90 },
  { type: "deposit", amount: 75000, reference: "240615008", isSuccessful: true, minutesAgo: 110 },
  { type: "float-topup", amount: 50000, reference: "240615009", isSuccessful: false, minutesAgo: 130 },
  { type: "deposit", amount: 12000, reference: "240615010", isSuccessful: true, minutesAgo: 150 },
]

function formatTimestamp(minutesAgo: number): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() - minutesAgo)
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const ampm = hours >= 12 ? "PM" : "AM"
  const h12 = hours % 12 || 12
  return `${h12}:${minutes.toString().padStart(2, "0")} ${ampm}`
}

export function generateDemoTransactions(): Transaction[] {
  return seedEntries.map((entry) => ({
    id: generateId(),
    timestamp: formatTimestamp(entry.minutesAgo),
    type: entry.type,
    amount: entry.amount,
    reference: entry.reference,
    isSuccessful: entry.isSuccessful,
    commission: generateCommission(entry.type, entry.amount),
  }))
}
