import { formatMoney, type Summary } from '../lib/finance'
import type { Currency } from '../types'

interface Props {
  summary: Summary
  currency: Currency
  count: number
}

export function SummaryCards({ summary, currency, count }: Props) {
  const savingsRate = summary.income > 0 ? Math.max(summary.balance / summary.income, 0) : 0
  return (
    <section className="cards" aria-label="Summary">
      <div className="card stat">
        <span className="stat-label">Balance</span>
        <strong className={`stat-value ${summary.balance < 0 ? 'negative' : ''}`}>
          {formatMoney(summary.balance, currency)}
        </strong>
        <span className="stat-hint">{count} transactions</span>
      </div>
      <div className="card stat">
        <span className="stat-label">Income</span>
        <strong className="stat-value income">{formatMoney(summary.income, currency)}</strong>
        <span className="stat-hint">Money in</span>
      </div>
      <div className="card stat">
        <span className="stat-label">Expenses</span>
        <strong className="stat-value expense">{formatMoney(summary.expense, currency)}</strong>
        <span className="stat-hint">Money out</span>
      </div>
      <div className="card stat">
        <span className="stat-label">Savings rate</span>
        <strong className="stat-value">{Math.round(savingsRate * 100)}%</strong>
        <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(savingsRate * 100)}>
          <div className="meter-fill" style={{ width: `${Math.min(savingsRate, 1) * 100}%` }} />
        </div>
      </div>
    </section>
  )
}
