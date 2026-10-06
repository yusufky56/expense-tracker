import { useCallback, useEffect, useState } from 'react'
import { demoTransactions, loadTransactions, saveTransactions } from '../lib/storage'
import type { NewTransaction, Transaction } from '../types'

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(
    () => loadTransactions() ?? demoTransactions(),
  )

  useEffect(() => {
    saveTransactions(transactions)
  }, [transactions])

  const add = useCallback((data: NewTransaction) => {
    setTransactions((list) => [...list, { ...data, id: newId() }])
  }, [])

  const update = useCallback((id: string, data: NewTransaction) => {
    setTransactions((list) => list.map((t) => (t.id === id ? { ...data, id } : t)))
  }, [])

  const remove = useCallback((id: string) => {
    setTransactions((list) => list.filter((t) => t.id !== id))
  }, [])

  const reset = useCallback((withDemo: boolean) => {
    setTransactions(withDemo ? demoTransactions() : [])
  }, [])

  return { transactions, add, update, remove, reset }
}
