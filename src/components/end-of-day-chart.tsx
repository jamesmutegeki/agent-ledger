"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import type { Transaction } from "@/lib/types"

const CHART_COLORS = ["#a3a3a3", "#808080", "#5c5c5c", "#3d3d3d", "#262626"]

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
    <div>
      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-4">
        Amount by Type
      </p>
      <div className="h-56">
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
              {pieData.map((entry, i) => (
                <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`UGX ${Number(value).toLocaleString()}`, "Amount"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e5e5",
                fontSize: "12px",
                background: "#fff",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
