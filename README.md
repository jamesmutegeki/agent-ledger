# Agent Ledger

A clean, minimalist web application for agents to log and track daily financial transactions. Built with a light green and white theme for a fresh, professional look, with full dark mode support.

## Features

- **Transaction Logging** — Log deposits, withdrawals, bill payments, airtime, and float top-ups with a single form
- **Smart Commission Calculation** — Auto-calculates estimated commission based on tiered rules (UGX 100 for amounts ≤ 5,000, 2% for amounts > 5,000)
- **Real-time Activity Feed** — View all logged transactions instantly with type icons, amounts, timestamps, and success/failure status
- **Live Summary Dashboard** — See aggregated totals for inflow, outflow, and commissions at a glance
- **Pie Chart Analytics** — Visual breakdown of transaction amounts by type on the End of Day page
- **Dark Mode** — Toggle between light and dark themes
- **Keyboard Shortcuts** — Press Enter to submit a transaction without reaching for the mouse
- **Audio Feedback** — A chime plays on successful transaction log
- **Shareable Receipt Links** — Each transaction has a unique receipt URL (`/receipt/:id`) with a print-friendly view
- **CSV Export** — Export all transactions to a CSV file from History or End of Day
- **Responsive Layout** — Split-panel desktop view adapts to a stacked mobile layout seamlessly
- **Demo Data** — Pre-loaded sample transactions so you can explore the UI immediately
- **Supabase Integration** — Optional cloud persistence (see setup below)

## Demo

The app loads with 10 sample transactions on first visit. Click **"Load demo data"** below the form to reset the demo, or **"Clear all"** to start fresh.

## Built With

- [Next.js](https://nextjs.org/) — React framework
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling
- [Lucide React](https://lucide.dev/icons/) — Icon library
- [Recharts](https://recharts.org/) — Charting library
- [Supabase](https://supabase.com/) — Optional persistence layer

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Supabase Integration (Optional)

1. Create a free project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env.local` and fill in your project URL and anon key
3. Run the SQL from `supabase/schema.sql` in your Supabase SQL editor
4. Restart the dev server — transactions will now sync to your database
