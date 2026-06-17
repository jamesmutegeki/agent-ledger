import type { Transaction } from "./types"

export function exportTransactionsToCSV(transactions: Transaction[], filename = "transactions.csv") {
  const headers = ["ID", "Time", "Type", "Amount (UGX)", "Reference", "Status", "Commission (UGX)"]
  const rows = transactions.map((t) => [
    t.id.slice(0, 8),
    t.timestamp,
    t.type,
    t.amount.toString(),
    t.reference || "",
    t.isSuccessful ? "Success" : "Failed",
    t.commission.toString(),
  ])

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
