import { useEffect, useMemo, useState } from 'react'
import { CategoryChart, MonthlyChart } from './components/Charts'
import { SummaryCards } from './components/SummaryCards'
import { TransactionForm } from './components/TransactionForm'
import { TransactionList } from './components/TransactionList'
import { useTransactions } from './hooks/useTransactions'
import { filterByMonth, monthLabel, monthlyTotals, shiftMonth, summarize, toCSV, totalsByCategory } from './lib/finance'
import { loadSetting, saveSetting } from './lib/storage'
import { CURRENCIES, type Currency, type NewTransaction, type Transaction } from './types'
import './App.css'

const currentMonth = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

type Theme = 'light' | 'dark'

export default function App() {
  const { transactions, add, update, remove, reset } = useTransactions()
  const [month, setMonth] = useState(currentMonth)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [currency, setCurrency] = useState<Currency>(() => loadSetting('currency', 'USD', CURRENCIES))
  const [theme, setTheme] = useState<Theme>(() =>
    loadSetting<Theme>('theme', window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light', ['light', 'dark']),
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    saveSetting('theme', theme)
  }, [theme])

  useEffect(() => saveSetting('currency', currency), [currency])

  const monthTransactions = useMemo(() => filterByMonth(transactions, month), [transactions, month])
  const summary = useMemo(() => summarize(monthTransactions), [monthTransactions])
  const categories = useMemo(() => totalsByCategory(monthTransactions), [monthTransactions])
  const monthly = useMemo(() => monthlyTotals(transactions, month), [transactions, month])

  const handleSubmit = (data: NewTransaction) => {
    if (editing) {
      update(editing.id, data)
      setEditing(null)
    } else {
      add(data)
    }
  }

  const handleDelete = (id: string) => {
    if (editing?.id === id) setEditing(null)
    remove(id)
  }

  const exportCSV = () => {
    const blob = new Blob([toCSV(transactions)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${currentMonth()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const isCurrent = month === currentMonth()

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo" aria-hidden>
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 17l5-5 4 4 7-8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <h1>Expense Tracker</h1>
        </div>
        <div className="toolbar">
          <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} aria-label="Currency">
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button type="button" className="ghost" onClick={exportCSV}>Export CSV</button>
          <button type="button" className="ghost" onClick={() => {
            if (confirm('Delete all transactions? Choose OK to start empty.')) reset(false)
          }}>Clear</button>
          <button type="button" className="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
            )}
          </button>
        </div>
      </header>

      <nav className="month-nav" aria-label="Month">
        <button type="button" className="icon" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month">‹</button>
        <span className="month-label">{monthLabel(month, 'long')}</span>
        <button type="button" className="icon" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month">›</button>
        {!isCurrent && <button type="button" className="link" onClick={() => setMonth(currentMonth())}>Today</button>}
      </nav>

      <SummaryCards summary={summary} currency={currency} count={monthTransactions.length} />

      <main className="grid">
        <div className="col">
          <TransactionForm key={editing?.id ?? 'new'} editing={editing} onSubmit={handleSubmit} onCancel={() => setEditing(null)} />
          <CategoryChart data={categories} currency={currency} />
        </div>
        <div className="col">
          <MonthlyChart data={monthly} currency={currency} />
          <TransactionList transactions={monthTransactions} currency={currency} editingId={editing?.id ?? null}
            onEdit={setEditing} onDelete={handleDelete} />
        </div>
      </main>

      <footer className="footer">Data is stored in your browser only.</footer>
    </div>
  )
}
