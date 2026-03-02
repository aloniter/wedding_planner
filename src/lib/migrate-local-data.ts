import { createClient } from '@/lib/supabase/client'
import { getStoredGuests, getStoredVendors, getStoredTables, getStoredCategories } from './storage'

const MIGRATION_KEY = 'supabase_migration_complete_v1'

export function hasPendingMigration(weddingId: string): boolean {
  if (typeof window === 'undefined') return false
  if (localStorage.getItem(MIGRATION_KEY)) return false

  const guests = getStoredGuests().filter(g => g.wedding_id === weddingId)
  const vendors = getStoredVendors().filter(v => v.wedding_id === weddingId)
  const tables = getStoredTables().filter(t => t.wedding_id === weddingId)
  const categories = getStoredCategories().filter(c => c.wedding_id === weddingId)

  return guests.length > 0 || vendors.length > 0 || tables.length > 0 || categories.length > 0
}

export function getLocalDataCounts(weddingId: string) {
  const guests = getStoredGuests().filter(g => g.wedding_id === weddingId)
  const vendors = getStoredVendors().filter(v => v.wedding_id === weddingId)
  const tables = getStoredTables().filter(t => t.wedding_id === weddingId)
  const categories = getStoredCategories().filter(c => c.wedding_id === weddingId)

  return { guests: guests.length, vendors: vendors.length, tables: tables.length, categories: categories.length }
}

export async function migrateLocalDataToSupabase(weddingId: string): Promise<{
  migrated: boolean
  counts: Record<string, number>
}> {
  const supabase = createClient()

  const guests = getStoredGuests().filter(g => g.wedding_id === weddingId)
  const vendors = getStoredVendors().filter(v => v.wedding_id === weddingId)
  const tables = getStoredTables().filter(t => t.wedding_id === weddingId)
  const categories = getStoredCategories().filter(c => c.wedding_id === weddingId)

  if (guests.length === 0 && vendors.length === 0 && tables.length === 0 && categories.length === 0) {
    localStorage.setItem(MIGRATION_KEY, 'true')
    return { migrated: false, counts: {} }
  }

  // Insert categories first
  if (categories.length > 0) {
    await supabase
      .from('guest_categories')
      .upsert(
        categories.map(c => ({
          id: c.id,
          wedding_id: weddingId,
          name: c.name,
          color: c.color,
        })),
        { onConflict: 'id', ignoreDuplicates: true }
      )
  }

  // Insert tables before guests (FK dependency)
  if (tables.length > 0) {
    await supabase
      .from('wedding_tables')
      .upsert(
        tables.map(t => ({
          id: t.id,
          wedding_id: weddingId,
          table_number: t.table_number,
          label: t.label,
          seat_capacity: t.seat_capacity,
        })),
        { onConflict: 'id', ignoreDuplicates: true }
      )
  }

  // Insert guests in batches of 100
  if (guests.length > 0) {
    const BATCH = 100
    for (let i = 0; i < guests.length; i += BATCH) {
      const batch = guests.slice(i, i + BATCH)
      await supabase
        .from('guests')
        .upsert(
          batch.map(g => ({
            id: g.id,
            wedding_id: weddingId,
            full_name: g.full_name,
            phone: g.phone,
            side: g.side,
            group_name: g.group_name,
            adults_count: g.adults_count,
            kids_count: g.kids_count,
            rsvp_status: g.rsvp_status,
            gift_amount: g.gift_amount,
            table_id: g.table_id,
            notes: g.notes,
          })),
          { onConflict: 'id', ignoreDuplicates: true }
        )
    }
  }

  // Insert vendors
  if (vendors.length > 0) {
    await supabase
      .from('vendors')
      .upsert(
        vendors.map(v => ({
          id: v.id,
          wedding_id: weddingId,
          name: v.name,
          category: v.category,
          contact_phone: v.contact_phone,
          total_price: v.total_price,
          deposit_paid: v.deposit_paid,
          notes: v.notes,
        })),
        { onConflict: 'id', ignoreDuplicates: true }
      )
  }

  // Clear localStorage (keep contacts — they're device-local)
  localStorage.removeItem('wedding_data')
  localStorage.removeItem('guests_data')
  localStorage.removeItem('vendors_data')
  localStorage.removeItem('tables_data')
  localStorage.removeItem('categories_data')
  localStorage.setItem(MIGRATION_KEY, 'true')

  return {
    migrated: true,
    counts: {
      guests: guests.length,
      vendors: vendors.length,
      tables: tables.length,
      categories: categories.length,
    },
  }
}
