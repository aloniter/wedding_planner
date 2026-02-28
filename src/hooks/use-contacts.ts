'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { ImportedContact, ImportedContactUpdate } from '@/lib/types'
import { getStoredContacts, setStoredContacts } from '@/lib/storage'

function normalizePhone(phone: string | null): string | null {
  if (!phone) return null
  return phone.replace(/[\s\-\(\)\.]/g, '') || null
}

function mergeContacts(
  existing: ImportedContact[],
  incoming: ImportedContact[]
): { merged: ImportedContact[]; duplicateCount: number } {
  const seen = new Set(
    existing.map((c) => normalizePhone(c.phone) ?? c.full_name)
  )
  const unique = incoming.filter((c) => {
    const key = normalizePhone(c.phone) ?? c.full_name
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return {
    merged: [...existing, ...unique],
    duplicateCount: incoming.length - unique.length,
  }
}

export function useContacts() {
  const [contacts, setContacts] = useState<ImportedContact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterGroup, setFilterGroup] = useState<string | 'all'>('all')

  useEffect(() => {
    setContacts(getStoredContacts())
    setLoading(false)
  }, [])

  const persist = useCallback((updated: ImportedContact[]) => {
    setStoredContacts(updated)
  }, [])

  const importContacts = useCallback(
    (incoming: ImportedContact[]): number => {
      let dupeCount = 0
      setContacts((prev) => {
        const { merged, duplicateCount } = mergeContacts(prev, incoming)
        dupeCount = duplicateCount
        persist(merged)
        return merged
      })
      return dupeCount
    },
    [persist]
  )

  const updateContact = useCallback(
    (id: string, updates: ImportedContactUpdate) => {
      setContacts((prev) => {
        const updated = prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...updates,
                full_name:
                  updates.first_name !== undefined || updates.last_name !== undefined
                    ? `${updates.first_name ?? c.first_name} ${updates.last_name ?? c.last_name}`.trim()
                    : updates.full_name ?? c.full_name,
              }
            : c
        )
        persist(updated)
        return updated
      })
    },
    [persist]
  )

  const updateGroupBulk = useCallback(
    (ids: string[], groupTag: string | null) => {
      setContacts((prev) => {
        const idSet = new Set(ids)
        const updated = prev.map((c) =>
          idSet.has(c.id) ? { ...c, group_tag: groupTag } : c
        )
        persist(updated)
        return updated
      })
    },
    [persist]
  )

  const deleteContact = useCallback(
    (id: string) => {
      setContacts((prev) => {
        const updated = prev.filter((c) => c.id !== id)
        persist(updated)
        return updated
      })
    },
    [persist]
  )

  const clearAll = useCallback(() => {
    setContacts([])
    persist([])
  }, [persist])

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      if (
        search &&
        !c.full_name.includes(search) &&
        !c.phone?.includes(search) &&
        !c.email?.includes(search)
      )
        return false
      if (filterGroup !== 'all' && c.group_tag !== filterGroup) return false
      return true
    })
  }, [contacts, search, filterGroup])

  const groupTags = useMemo(
    () =>
      [...new Set(contacts.map((c) => c.group_tag).filter(Boolean))] as string[],
    [contacts]
  )

  return {
    contacts: filteredContacts,
    allContacts: contacts,
    loading,
    search,
    setSearch,
    filterGroup,
    setFilterGroup,
    groupTags,
    importContacts,
    updateContact,
    updateGroupBulk,
    deleteContact,
    clearAll,
  }
}
