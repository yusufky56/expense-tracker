import { describe, expect, it } from 'vitest'
import type { Transaction } from '../types'
import {
  filterByMonth,
  formatMoney,
  monthlyTotals,
  shiftMonth,
  sortByDateDesc,
  summarize,
  toCSV,
  totalsByCategory,
} from './finance'
import { demoTransactions } from './storage'

const tx = (overrides: Partial<Transaction>): Transaction => ({
  id: Math.random().toString(36).slice(2),
  type: 'expense',
  amount: 10,
  category: 'Food',
  note: '',
  date: '2026-03-10',
  ...overrides,
})

describe('summarize', () => {
  it('adds income and expenses and computes the balance', () => {
    const s = summarize([
      tx({ type: 'income', amount: 1000 }),
      tx({ amount: 250.5 }),
      tx({ amount: 49.5 }),
    ])
    expect(s).toEqual({ income: 1000, expense: 300, balance: 700 })
  })

  it('does not accumulate floating point errors', () => {
    const s = summarize(Array.from({ length: 10 }, () => tx({ amount: 0.1 })))
    expect(s.expense).toBe(1)
  })

  it('handles an empty list', () => {
    expect(summarize([])).toEqual({ income: 0, expense: 0, balance: 0 })
  })
})

describe('totalsByCategory', () => {
  it('groups expenses, ignores income and sorts by total', () => {
    const totals = totalsByCategory([
      tx({ category: 'Food', amount: 30 }),
      tx({ category: 'Rent', amount: 60 }),
      tx({ category: 'Food', amount: 10 }),
      tx({ type: 'income', category: 'Salary', amount: 500 }),
    ])
    expect(totals.map((t) => [t.category, t.total])).toEqual([
      ['Rent', 60],
      ['Food', 40],
    ])
    expect(totals[0].share).toBe(0.6)
  })
})

describe('months', () => {
  it('shifts across year boundaries', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(shiftMonth('2025-11', 3)).toBe('2026-02')
  })

  it('filters by month', () => {
    const list = [tx({ date: '2026-03-01' }), tx({ date: '2026-04-01' })]
    expect(filterByMonth(list, '2026-03')).toHaveLength(1)
    expect(filterByMonth(list, null)).toHaveLength(2)
  })

  it('builds a fixed window of monthly totals, oldest first', () => {
    const totals = monthlyTotals(
      [
        tx({ date: '2026-03-05', amount: 20 }),
        tx({ date: '2026-03-06', type: 'income', amount: 100 }),
        tx({ date: '2026-01-02', amount: 5 }),
        tx({ date: '2025-06-01', amount: 999 }), // outside the window
      ],
      '2026-03',
      3,
    )
    expect(totals.map((m) => m.month)).toEqual(['2026-01', '2026-02', '2026-03'])
    expect(totals[2]).toMatchObject({ income: 100, expense: 20 })
    expect(totals[0].expense).toBe(5)
    expect(totals[1].expense).toBe(0)
  })
})

describe('sortByDateDesc', () => {
  it('puts the newest first without mutating the input', () => {
    const list = [tx({ date: '2026-01-01' }), tx({ date: '2026-03-01' })]
    const sorted = sortByDateDesc(list)
    expect(sorted[0].date).toBe('2026-03-01')
    expect(list[0].date).toBe('2026-01-01')
  })
})

describe('toCSV', () => {
  it('escapes commas and quotes', () => {
    const csv = toCSV([tx({ note: 'Coffee, "large"', amount: 4.5 })])
    expect(csv.split('\n')).toEqual([
      'date,type,category,amount,note',
      '2026-03-10,expense,Food,4.50,"Coffee, ""large"""',
    ])
  })
})

describe('formatMoney', () => {
  it('formats with the selected currency', () => {
    expect(formatMoney(1234.5, 'USD')).toBe('$1,234.50')
    expect(formatMoney(10, 'EUR')).toBe('€10.00')
  })
})

describe('demoTransactions', () => {
  it('creates six months of data and never dates entries in the future', () => {
    const today = new Date(2026, 9, 7) // 7 Oct 2026
    const demo = demoTransactions(today)
    const months = new Set(demo.map((t) => t.date.slice(0, 7)))
    expect(months.size).toBe(6)
    expect(demo.every((t) => t.date <= '2026-10-07')).toBe(true)
    expect(new Set(demo.map((t) => t.id)).size).toBe(demo.length)
  })
})
