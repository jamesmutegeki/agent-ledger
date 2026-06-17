import type { TransactionType } from "./types"

export function calculateCommission(type: TransactionType, amount: number): number {
  if (type === "airtime" || type === "bill-payment") return 0
  if (amount <= 0) return 0
  if (amount <= 5000) return 100
  return Math.round(amount * 0.02)
}

export function sanitizeReference(ref: string): string {
  return ref.trim().slice(0, 50)
}
