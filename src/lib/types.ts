export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "bill-payment"
  | "airtime"
  | "float-topup"

export interface Transaction {
  id: string
  timestamp: string
  type: TransactionType
  amount: number
  reference: string
  isSuccessful: boolean
  commission: number
}

export type ViewId = "live-log" | "history" | "end-of-day" | "analytics" | "machines"

export const positiveTypes: TransactionType[] = ["deposit", "float-topup"]

export function isInflow(tx: { type: TransactionType }): boolean {
  return positiveTypes.includes(tx.type)
}

export function isOutflow(tx: { type: TransactionType }): boolean {
  return !positiveTypes.includes(tx.type)
}

export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5")
}
