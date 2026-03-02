'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { Vendor, VendorInsert, VendorUpdate } from '@/lib/types'
import { createClient, getSupabaseConfig } from '@/lib/supabase/client'
import { useRealtime } from './use-realtime'

export function useVendors(weddingId: string | undefined) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const vendorsRef = useRef(vendors)
  vendorsRef.current = vendors

  useEffect(() => {
    if (!weddingId || !getSupabaseConfig()) {
      setLoading(false)
      return
    }
    const supabase = createClient()
    let cancelled = false

    async function load() {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('wedding_id', weddingId!)
        .order('created_at', { ascending: true })

      if (!cancelled && !error && data) {
        setVendors(data as Vendor[])
      }
      if (!cancelled) setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [weddingId])

  useRealtime<Vendor>('vendors', weddingId, {
    onInsert: (v) => setVendors(prev =>
      prev.find(x => x.id === v.id) ? prev : [...prev, v]
    ),
    onUpdate: (v) => setVendors(prev => prev.map(x => {
      if (x.id !== v.id) return x
      return new Date(v.updated_at) >= new Date(x.updated_at) ? v : x
    })),
    onDelete: ({ id }) => setVendors(prev => prev.filter(x => x.id !== id)),
  })

  const addVendor = useCallback(async (data: VendorInsert) => {
    const supabase = createClient()
    const { data: newVendor, error } = await supabase
      .from('vendors')
      .insert({
        wedding_id: data.wedding_id,
        name: data.name,
        category: data.category,
        contact_phone: data.contact_phone,
        total_price: data.total_price,
        deposit_paid: data.deposit_paid,
        notes: data.notes,
      })
      .select()
      .single()

    if (!error && newVendor) {
      setVendors(prev =>
        prev.find(v => v.id === newVendor.id) ? prev : [...prev, newVendor as Vendor]
      )
      return newVendor as Vendor
    }
    return null
  }, [])

  const updateVendor = useCallback(async (id: string, updates: VendorUpdate) => {
    const supabase = createClient()
    const previous = vendorsRef.current
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v))

    const { error } = await supabase
      .from('vendors')
      .update(updates)
      .eq('id', id)

    if (error) {
      setVendors(previous)
    }
  }, [])

  const deleteVendor = useCallback(async (id: string) => {
    const supabase = createClient()
    const previous = vendorsRef.current
    setVendors(prev => prev.filter(v => v.id !== id))

    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id)

    if (error) {
      setVendors(previous)
    }
  }, [])

  const totals = useMemo(() => {
    const totalPrice = vendors.reduce((sum, v) => sum + v.total_price, 0)
    const totalPaid = vendors.reduce((sum, v) => sum + v.deposit_paid, 0)
    return {
      totalPrice,
      totalPaid,
      totalRemaining: totalPrice - totalPaid,
    }
  }, [vendors])

  return {
    vendors,
    loading,
    totals,
    addVendor,
    updateVendor,
    deleteVendor,
  }
}
