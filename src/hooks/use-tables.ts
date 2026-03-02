'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { WeddingTable, WeddingTableInsert, WeddingTableUpdate, Guest } from '@/lib/types'
import { getStoredTables, setStoredTables } from '@/lib/storage'
import { generateId } from '@/lib/utils'

export function useTables(weddingId: string | undefined, guests: Guest[] = []) {
  const [tables, setTables] = useState<WeddingTable[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!weddingId) return
    const stored = getStoredTables().filter(t => t.wedding_id === weddingId)
    setTables(stored)
    setLoading(false)
  }, [weddingId])

  const persist = useCallback((updated: WeddingTable[]) => {
    const all = getStoredTables()
    const others = all.filter(t => t.wedding_id !== weddingId)
    setStoredTables([...others, ...updated])
  }, [weddingId])

  const addTable = useCallback((data: WeddingTableInsert) => {
    const newTable: WeddingTable = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
    }
    setTables(prev => {
      const updated = [...prev, newTable]
      persist(updated)
      return updated
    })
    return newTable
  }, [persist])

  const updateTable = useCallback((id: string, updates: WeddingTableUpdate) => {
    setTables(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t)
      persist(updated)
      return updated
    })
  }, [persist])

  const deleteTable = useCallback((id: string) => {
    setTables(prev => {
      const updated = prev.filter(t => t.id !== id)
      persist(updated)
      return updated
    })
  }, [persist])

  const tableAssignments = useMemo(() => {
    const map = new Map<string, Guest[]>()
    for (const t of tables) {
      map.set(t.id, [])
    }
    for (const g of guests) {
      if (g.table_id && map.has(g.table_id)) {
        map.get(g.table_id)!.push(g)
      }
    }
    return map
  }, [tables, guests])

  const unassignedGuests = useMemo(() => {
    return guests.filter(g => !g.table_id && g.rsvp_status === 'אישר')
  }, [guests])

  return {
    tables,
    loading,
    addTable,
    updateTable,
    deleteTable,
    tableAssignments,
    unassignedGuests,
  }
}
