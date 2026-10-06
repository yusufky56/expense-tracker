import type { Transaction } from '../types'
import { shiftMonth } from './finance'

const KEY = 'expense-tracker:v1'

function isTransaction(value: unknown): value is Transaction {
  if (typeof value !== 'object' || value === null) return false
  const t = value as Record<string, unknown>
  return (
    typeof t.id === 'string' &&
    (t.type === 'income' || t.type === 'expense') &&
    typeof t.amount === 'number' &&
    Number.isFinite(t.amount) &&
    typeof t.category === 'string' &&
    typeof t.note === 'string' &&
    typeof t.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(t.date)
  )
}

export function loadTransactions(): Transaction[] | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isTransaction) : null
  } catch {
    return null
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(transactions))
  } catch {
    // Storage can be full or disabled (private mode). The app keeps working in memory.
  }
}

export function loadSetting<T extends string>(name: string, fallback: T, allowed: readonly T[]): T {
  try {
    const value = localStorage.getItem(`expense-tracker:${name}`)
    return value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : fallback
  } catch {
    return fallback
  }
}

export function saveSetting(name: string, value: string): void {
  try {
    localStorage.setItem(`expense-tracker:${name}`, value)
  } catch {
    // ignore
  }
}

/** Sample data for the last six months so a first visit isn't an empty screen. */
export function demoTransactions(today = new Date()): Transaction[] {
  const current = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const lastDay = today.getDate()
  const plan: [number, Transaction['type'], string, number, string][] = [
    [1, 'income', 'Salary', 3200, 'Monthly salary'],
    [1, 'expense', 'Rent', 1100, 'Apartment'],
    [3, 'expense', 'Bills', 85.4, 'Electricity'],
    [4, 'expense', 'Food', 62.75, 'Groceries'],
    [6, 'expense', 'Transport', 45, 'Metro card'],
    [9, 'expense', 'Food', 38.2, 'Dinner with friends'],
    [11, 'income', 'Freelance', 450, 'Landing page project'],
    [12, 'expense', 'Shopping', 129.99, 'Running shoes'],
    [15, 'expense', 'Health', 40, 'Pharmacy'],
    [17, 'expense', 'Food', 71.3, 'Groceries'],
    [20, 'expense', 'Entertainment', 24, 'Cinema'],
    [22, 'expense', 'Education', 15, 'Online course'],
    [25, 'expense', 'Bills', 39.9, 'Internet'],
    [27, 'expense', 'Food', 55.6, 'Groceries'],
  ]
  const result: Transaction[] = []
  for (let back = 5; back >= 0; back--) {
    const month = shiftMonth(current, -back)
    // Vary amounts a little from month to month so the charts look natural.
    const factor = 1 + ((back * 7) % 5) / 20
    plan.forEach(([day, type, category, amount, note], i) => {
      if (back === 0 && day > lastDay) return
      const varied = type === 'income' && category === 'Salary' ? amount : Math.round(amount * factor * 100) / 100
      result.push({
        id: `demo-${month}-${i}`,
        type,
        category,
        amount: varied,
        note,
        date: `${month}-${String(day).padStart(2, '0')}`,
      })
    })
  }
  return result
}
