'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { WeddingTable, WeddingTableInsert, WeddingTableUpdate, Guest } from '@/lib/types'
import { createClient, getSupabaseConfig } from '@/lib/supabase/client'
import { useRealtime } from './use-realtime'

export function useTables(weddingId: string | undefined, guests: Guest[] = []) {
  const [tables, setTables] = useState<WeddingTable[]>([])
  const [loading, setLoading] = useState(true)
  const tablesRef = useRef(tables)
  tablesRef.current = tables

  useEffect(() => {
    if (!weddingId || !getSupabaseConfig()) {
      setLoading(false)
      return
    }
    const supabase = createClient()
    let cancelled = false

    async function load() {
      const { data, error } = await supabase
        .from('wedding_tables')
        .select('*')
        .eq('wedding_id', weddingId!)
        .order('table_number', { ascending: true })

      if (!cancelled && !error && data) {
        setTables(data as WeddingTable[])
      }
      if (!cancelled) setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [weddingId])

  useRealtime<WeddingTable>('wedding_tables', weddingId, {
    onInsert: (t) => setTables(prev =>
      prev.find(x => x.id === t.id) ? prev : [...prev, t]
    ),
    onUpdate: (t) => setTables(prev => prev.map(x => {
      if (x.id !== t.id) return x
      return new Date(t.updated_at) >= new Date(x.updated_at) ? t : x
    })),
    onDelete: ({ id }) => setTables(prev => prev.filter(x => x.id !== id)),
  })

  const addTable = useCallback(async (data: WeddingTableInsert) => {
    const supabase = createClient()
    const { data: newTable, error } = await supabase
      .from('wedding_tables')
      .insert({
        wedding_id: data.wedding_id,
        table_number: data.table_number,
        label: data.label,
        seat_capacity: data.seat_capacity,
      })
      .select()
      .single()

    if (!error && newTable) {
      setTables(prev =>
        prev.find(t => t.id === newTable.id) ? prev : [...prev, newTable as WeddingTable]
      )
      return newTable as WeddingTable
    }
    return null
  }, [])

  const updateTable = useCallback(async (id: string, updates: WeddingTableUpdate) => {
    const supabase = createClient()
    const previous = tablesRef.current
    setTables(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))

    const { error } = await supabase
      .from('wedding_tables')
      .update(updates)
      .eq('id', id)

    if (error) {
      setTables(previous)
    }
  }, [])

  const deleteTable = useCallback(async (id: string) => {
    const supabase = createClient()
    const previous = tablesRef.current
    setTables(prev => prev.filter(t => t.id !== id))

    const { error } = await supabase
      .from('wedding_tables')
      .delete()
      .eq('id', id)

    if (error) {
      setTables(previous)
    }
  }, [])

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
