import { useMemo, useState } from 'react'
import { formatMoney, sortByDateDesc } from '../lib/finance'
import type { Currency, Transaction } from '../types'

interface Props {
  transactions: Transaction[]
  currency: Currency
  editingId: string | null
  onEdit: (t: Transaction) => void
  onDelete: (id: string) => void
}

type Filter = 'all' | 'income' | 'expense'

const formatDay = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { day: 'numeric', month: 'short', timeZone: 'UTC' })

export function TransactionList({ transactions, currency, editingId, onEdit, onDelete }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sortByDateDesc(transactions).filter(
      (t) =>
        (filter === 'all' || t.type === filter) &&
        (!q || t.note.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)),
    )
  }, [transactions, filter, query])

  return (
    <section className="card list">
      <div className="list-header">
        <h2>Transactions</h2>
        <div className="segmented small" role="radiogroup" aria-label="Filter">
          {(['all', 'income', 'expense'] as const).map((f) => (
            <button key={f} type="button" role="radio" aria-checked={filter === f}
              className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <input className="search" type="search" placeholder="Search notes or categories"
        value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search transactions" />

      {visible.length === 0 ? (
        <p className="empty">No transactions here yet.</p>
      ) : (
        <ul>
          {visible.map((t) => (
            <li key={t.id} className={t.id === editingId ? 'editing' : ''}>
              <span className={`dot ${t.type}`} aria-hidden />
              <div className="item-main">
                <span className="item-title">{t.note || t.category}</span>
                <span className="item-sub">{t.category} · {formatDay(t.date)}</span>
              </div>
              <span className={`amount ${t.type}`}>
                {t.type === 'expense' ? '−' : '+'}{formatMoney(t.amount, currency)}
              </span>
              <div className="item-actions">
                <button type="button" className="icon" onClick={() => onEdit(t)} aria-label={`Edit ${t.note || t.category}`}>
                  <svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 20h4L19 9l-4-4L4 16v4z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
                </button>
                <button type="button" className="icon danger" onClick={() => onDelete(t.id)} aria-label={`Delete ${t.note || t.category}`}>
                  <svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
