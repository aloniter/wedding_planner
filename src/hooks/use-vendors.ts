'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Vendor, VendorInsert, VendorUpdate } from '@/lib/types'
import { getStoredVendors, setStoredVendors } from '@/lib/storage'
import { generateId } from '@/lib/utils'

export function useVendors(weddingId: string | undefined) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!weddingId) return
    const stored = getStoredVendors().filter(v => v.wedding_id === weddingId)
    setVendors(stored)
    setLoading(false)
  }, [weddingId])

  const persist = useCallback((updated: Vendor[]) => {
    const allVendors = getStoredVendors()
    const otherWeddings = allVendors.filter(v => v.wedding_id !== weddingId)
    setStoredVendors([...otherWeddings, ...updated])
  }, [weddingId])

  const addVendor = useCallback((data: VendorInsert) => {
    const newVendor: Vendor = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
    }
    setVendors(prev => {
      const updated = [...prev, newVendor]
      persist(updated)
      return updated
    })
    return newVendor
  }, [persist])

  const updateVendor = useCallback((id: string, updates: VendorUpdate) => {
    setVendors(prev => {
      const updated = prev.map(v => v.id === id ? { ...v, ...updates } : v)
      persist(updated)
      return updated
    })
  }, [persist])

  const deleteVendor = useCallback((id: string) => {
    setVendors(prev => {
      const updated = prev.filter(v => v.id !== id)
      persist(updated)
      return updated
    })
  }, [persist])

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
