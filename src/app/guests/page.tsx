'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { GuestFilters } from '@/components/guests/guest-filters'
import { GuestTable } from '@/components/guests/guest-table'
import { AddGuestDialog } from '@/components/guests/add-guest-dialog'
import { CsvImportDialog } from '@/components/guests/csv-import-dialog'
import { useWedding } from '@/hooks/use-wedding'
import { useGuests } from '@/hooks/use-guests'
import { exportGuestsToCsv } from '@/lib/csv'

export default function GuestsPage() {
  const router = useRouter()
  const { wedding, loading: weddingLoading } = useWedding()
  const {
    guests,
    allGuests,
    loading: guestsLoading,
    stats,
    search,
    setSearch,
    filterSide,
    setFilterSide,
    filterStatus,
    setFilterStatus,
    addGuest,
    addGuestsBulk,
    updateGuest,
    deleteGuest,
  } = useGuests(wedding?.id)

  useEffect(() => {
    if (!weddingLoading && !wedding) {
      router.push('/setup')
    }
  }, [wedding, weddingLoading, router])

  if (weddingLoading || guestsLoading || !wedding) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">טוען...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="ניהול אורחים"
        subtitle={`${stats.total} מוזמנים · ${stats.totalAdults + stats.totalKids} אנשים`}
        action={
          <div className="flex gap-2">
            <AddGuestDialog weddingId={wedding.id} onAdd={addGuest} />
            <CsvImportDialog weddingId={wedding.id} onImport={addGuestsBulk} />
            {allGuests.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportGuestsToCsv(allGuests)}
              >
                <Download className="h-4 w-4 ml-1" />
                ייצוא
              </Button>
            )}
          </div>
        }
      />

      <GuestFilters
        search={search}
        onSearchChange={setSearch}
        filterSide={filterSide}
        onFilterSideChange={setFilterSide}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
      />

      <GuestTable
        guests={guests}
        onUpdateGuest={updateGuest}
        onDeleteGuest={deleteGuest}
      />
    </div>
  )
}
