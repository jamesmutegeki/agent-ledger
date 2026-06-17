import { createClient } from "@supabase/supabase-js"
import type { TransactionType } from "./types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

const validTypes: TransactionType[] = [
  "deposit", "withdrawal", "bill-payment", "airtime", "float-topup",
]

function isValidType(val: string): val is TransactionType {
  return validTypes.includes(val as TransactionType)
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey)
}

export type DbTransaction = {
  id: string
  timestamp: string
  type: string
  amount: number
  reference: string
  is_successful: boolean
  commission: number
  created_at?: string
}

export function toDbTransaction(tx: {
  id: string
  timestamp: string
  type: string
  amount: number
  reference: string
  isSuccessful: boolean
  commission: number
}): DbTransaction {
  return {
    id: tx.id,
    timestamp: tx.timestamp,
    type: tx.type,
    amount: tx.amount,
    reference: tx.reference,
    is_successful: tx.isSuccessful,
    commission: tx.commission,
  }
}

export function fromDbTransaction(row: DbTransaction): {
  id: string
  timestamp: string
  type: TransactionType
  amount: number
  reference: string
  isSuccessful: boolean
  commission: number
} | null {
  const type = isValidType(row.type) ? row.type : null
  if (!type) return null

  return {
    id: row.id,
    timestamp: row.timestamp,
    type,
    amount: row.amount,
    reference: row.reference,
    isSuccessful: row.is_successful,
    commission: row.commission,
  }
}
