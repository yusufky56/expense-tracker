import type { Currency, Transaction } from '../types'

export interface Summary {
  income: number
  expense: number
  balance: number
}

export interface CategoryTotal {
  category: string
  total: number
  share: number
}

export interface MonthTotal {
  month: string // YYYY-MM
  label: string
  income: number
  expense: number
}

/** Money is summed in cents to avoid floating point drift. */
const toCents = (value: number) => Math.round(value * 100)
const fromCents = (cents: number) => cents / 100

export const monthOf = (date: string) => date.slice(0, 7)

export function filterByMonth(transactions: Transaction[], month: string | null): Transaction[] {
  if (!month) return transactions
  return transactions.filter((t) => monthOf(t.date) === month)
}

export function summarize(transactions: Transaction[]): Summary {
  let income = 0
  let expense = 0
  for (const t of transactions) {
    if (t.type === 'income') income += toCents(t.amount)
    else expense += toCents(t.amount)
  }
  return { income: fromCents(income), expense: fromCents(expense), balance: fromCents(income - expense) }
}

export function totalsByCategory(transactions: Transaction[]): CategoryTotal[] {
  const totals = new Map<string, number>()
  for (const t of transactions) {
    if (t.type !== 'expense') continue
    totals.set(t.category, (totals.get(t.category) ?? 0) + toCents(t.amount))
  }
  const sum = [...totals.values()].reduce((a, b) => a + b, 0)
  return [...totals.entries()]
    .map(([category, cents]) => ({ category, total: fromCents(cents), share: sum ? cents / sum : 0 }))
    .sort((a, b) => b.total - a.total)
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(month: string, style: 'short' | 'long' = 'short'): string {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', {
    month: style,
    year: style === 'long' ? 'numeric' : undefined,
    timeZone: 'UTC',
  })
}

/** Income and expense for `count` months ending at `lastMonth`, oldest first. */
export function monthlyTotals(transactions: Transaction[], lastMonth: string, count = 6): MonthTotal[] {
  const months = Array.from({ length: count }, (_, i) => shiftMonth(lastMonth, i - count + 1))
  const index = new Map(months.map((m, i) => [m, i]))
  const cents = months.map(() => ({ income: 0, expense: 0 }))
  for (const t of transactions) {
    const i = index.get(monthOf(t.date))
    if (i === undefined) continue
    cents[i][t.type] += toCents(t.amount)
  }
  return months.map((month, i) => ({
    month,
    label: monthLabel(month),
    income: fromCents(cents[i].income),
    expense: fromCents(cents[i].expense),
  }))
}

export function sortByDateDesc(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
}

export function formatMoney(value: number, currency: Currency): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
}

function csvCell(value: string | number): string {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCSV(transactions: Transaction[]): string {
  const header = ['date', 'type', 'category', 'amount', 'note']
  const rows = sortByDateDesc(transactions).map((t) =>
    [t.date, t.type, t.category, t.amount.toFixed(2), t.note].map(csvCell).join(','),
  )
  return [header.join(','), ...rows].join('\n')
}
