"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { Transaction } from "@/lib/types"

const TYPE_COLORS: Record<string, string> = {
  deposit: "#16a34a",
  withdrawal: "#ef4444",
  "bill-payment": "#3b82f6",
  airtime: "#a855f7",
  "float-topup": "#059669",
}

const TYPE_LABELS: Record<string, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  "bill-payment": "Bill Payment",
  airtime: "Airtime",
  "float-topup": "Float Top-up",
}

interface EndOfDayChartProps {
  transactions: Transaction[]
}

export default function EndOfDayChart({ transactions }: EndOfDayChartProps) {
  const pieData = useMemo(() => {
    const byType = transactions.reduce(
      (acc, t) => {
        const label = TYPE_LABELS[t.type] || t.type
        acc[label] = (acc[label] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>
    )
    return Object.entries(byType).map(([name, value]) => ({ name, value }))
  }, [transactions])

  if (pieData.length === 0) return null

  return (
    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-gray-100 dark:border-zinc-700">
      <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase font-medium mb-3">
        Amount by Type
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={TYPE_COLORS[entry.name.toLowerCase().replace(" ", "-")] || "#6b7280"}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`UGX ${Number(value).toLocaleString()}`, "Amount"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "12px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
