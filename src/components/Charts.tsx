import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMoney, type CategoryTotal, type MonthTotal } from '../lib/finance'
import type { Currency } from '../types'

const CATEGORY_COLORS = ['#2563eb', '#0891b2', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#4b5563', '#65a30d']


export function CategoryChart({ data, currency }: { data: CategoryTotal[]; currency: Currency }) {
  return (
    <section className="card chart">
      <h2>Spending by category</h2>
      {data.length === 0 ? (
        <p className="empty">No expenses this month.</p>
      ) : (
        <div className="category-chart">
          <div className="pie">
            <PieChart width={180} height={180}>
              <Pie
                data={data.map((d, i) => ({ ...d, fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))}
                dataKey="total"
                nameKey="category"
                innerRadius={52}
                outerRadius={86}
                paddingAngle={2}
                stroke="none"
                isAnimationActive={false}
              />
              <Tooltip formatter={(v) => formatMoney(Number(v), currency)} />
            </PieChart>
          </div>
          <ul className="legend">
            {data.slice(0, 6).map((d, i) => (
              <li key={d.category}>
                <span className="swatch" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                <span className="legend-name">{d.category}</span>
                <span className="legend-value">{Math.round(d.share * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export function MonthlyChart({ data, currency }: { data: MonthTotal[]; currency: Currency }) {
  return (
    <section className="card chart">
      <h2>Last 6 months</h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barGap={4} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} width={56} tick={{ fill: 'var(--muted)', fontSize: 12 }}
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))} />
          <Tooltip formatter={(v) => formatMoney(Number(v), currency)} cursor={{ fill: 'var(--hover)' }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
          <Bar dataKey="income" name="Income" fill="var(--income)" radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={false} />
          <Bar dataKey="expense" name="Expenses" fill="var(--expense)" radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
