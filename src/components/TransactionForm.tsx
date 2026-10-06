import { useState } from 'react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, type NewTransaction, type Transaction, type TransactionType } from '../types'

interface Props {
  editing: Transaction | null
  onSubmit: (data: NewTransaction) => void
  onCancel: () => void
}

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface FormState {
  type: TransactionType
  amount: string
  category: string
  note: string
  date: string
}

const empty = (type: TransactionType = 'expense'): FormState => ({
  type,
  amount: '',
  category: type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0],
  note: '',
  date: today(),
})

export function TransactionForm({ editing, onSubmit, onCancel }: Props) {
  // The parent remounts this component (via `key`) when the edited item changes,
  // so initial state is enough and no syncing effect is needed.
  const [form, setForm] = useState<FormState>(() =>
    editing
      ? { type: editing.type, amount: String(editing.amount), category: editing.category, note: editing.note, date: editing.date }
      : empty(),
  )
  const [error, setError] = useState<string | null>(null)

  const categories: readonly string[] = form.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const setType = (type: TransactionType) =>
    setForm((f) => ({
      ...f,
      type,
      category: (type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES)[0],
    }))

  const submit = (e: { preventDefault(): void }) => {
    e.preventDefault()
    const amount = Number(form.amount.replace(',', '.'))
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter an amount greater than zero.')
      return
    }
    if (!form.date) {
      setError('Pick a date.')
      return
    }
    onSubmit({
      type: form.type,
      amount: Math.round(amount * 100) / 100,
      category: form.category,
      note: form.note.trim(),
      date: form.date,
    })
    if (!editing) {
      setForm(empty(form.type))
      setError(null)
    }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h2>{editing ? 'Edit transaction' : 'Add transaction'}</h2>

      <div className="segmented" role="radiogroup" aria-label="Type">
        {(['expense', 'income'] as const).map((type) => (
          <button
            type="button"
            key={type}
            role="radio"
            aria-checked={form.type === type}
            className={form.type === type ? `active ${type}` : ''}
            onClick={() => setType(type)}
          >
            {type === 'expense' ? 'Expense' : 'Income'}
          </button>
        ))}
      </div>

      <label>
        Amount
        <input
          inputMode="decimal"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          autoFocus={!!editing}
        />
      </label>

      <div className="row">
        <label>
          Category
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </label>
      </div>

      <label>
        Note
        <input
          placeholder="Optional"
          maxLength={80}
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="actions">
        <button type="submit" className="primary">
          {editing ? 'Save changes' : 'Add'}
        </button>
        {editing && (
          <button type="button" className="ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
