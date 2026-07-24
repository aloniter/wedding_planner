'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { GuestFilters } from '@/components/guests/guest-filters'
import { GuestTable } from '@/components/guests/guest-table'
import { AddGuestDialog } from '@/components/guests/add-guest-dialog'
import { CsvImportDialog } from '@/components/guests/csv-import-dialog'
import { CategoryManager } from '@/components/guests/category-manager'
import { ExportDropdown } from '@/components/guests/export-dropdown'
import { DuplicateDetector } from '@/components/guests/duplicate-detector'
import { GuestPagination } from '@/components/guests/guest-pagination'
import { BulkSendDialog } from '@/components/guests/bulk-send-dialog'
import { Button } from '@/components/ui/button'
import { useWeddingSlugContext } from '@/providers/wedding-slug-provider'
import { useGuests } from '@/hooks/use-guests'
import { useCategories } from '@/hooks/use-categories'
import { downloadGuestTemplate } from '@/lib/guest-template'
import { Download, Send } from 'lucide-react'

export default function GuestsPage() {
  const { wedding, loading: weddingLoading, updateWedding } = useWeddingSlugContext()
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
    filterCategory,
    setFilterCategory,
    filterInvitation,
    setFilterInvitation,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    addGuest,
    addGuestsBulk,
    updateGuest,
    deleteGuest,
    findDuplicates,
  } = useGuests(wedding?.id)

  const { categories, addCategory, renameCategory, deleteCategory } = useCategories(wedding?.id)

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [bulkSendOpen, setBulkSendOpen] = useState(false)
  const [bulkSendQueue, setBulkSendQueue] = useState<typeof guests>([])

  if (weddingLoading || guestsLoading || !wedding) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">טוען...</div>
      </div>
    )
  }

  const totalPages = pageSize > 0 ? Math.ceil(guests.length / pageSize) : 1
  const currentPage = totalPages > 0 ? Math.min(page, totalPages - 1) : 0

  const resetPagination = () => setPage(0)

  const pendingWithPhone = guests.filter((g) => g.phone && !g.invitation_sent_at)

  const startBulkSend = () => {
    setBulkSendQueue(pendingWithPhone)
    setBulkSendOpen(true)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="ניהול אורחים"
        subtitle={`${stats.total} מוזמנים · ${stats.totalAdults + stats.totalKids} אנשים`}
        action={
          <div className="flex gap-2 flex-wrap justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={startBulkSend}
              disabled={pendingWithPhone.length === 0}
            >
              <Send className="h-4 w-4 ml-1" />
              שליחה מהירה לממתינים ({pendingWithPhone.length})
            </Button>
            <AddGuestDialog weddingId={wedding.id} categories={categories} onAdd={addGuest} />
            <Button variant="outline" size="sm" onClick={() => void downloadGuestTemplate()}>
              <Download className="h-4 w-4 ml-1" />
              הורד תבנית אורחים
            </Button>
            <CsvImportDialog
              weddingId={wedding.id}
              groomName={wedding.groom_name}
              brideName={wedding.bride_name}
              onImport={addGuestsBulk}
            />
            <CategoryManager
              categories={categories}
              onAdd={addCategory}
              onRename={renameCategory}
              onDelete={deleteCategory}
            />
            <DuplicateDetector
              findDuplicates={findDuplicates}
              onDelete={deleteGuest}
              onUpdate={updateGuest}
            />
            {allGuests.length > 0 && (
              <ExportDropdown guests={allGuests} wedding={wedding} stats={stats} />
            )}
          </div>
        }
      />

      <GuestFilters
        search={search}
        onSearchChange={(value) => {
          resetPagination()
          setSearch(value)
        }}
        filterSide={filterSide}
        onFilterSideChange={(value) => {
          resetPagination()
          setFilterSide(value)
        }}
        filterStatus={filterStatus}
        onFilterStatusChange={(value) => {
          resetPagination()
          setFilterStatus(value)
        }}
        filterCategory={filterCategory}
        onFilterCategoryChange={(value) => {
          resetPagination()
          setFilterCategory(value)
        }}
        filterInvitation={filterInvitation}
        onFilterInvitationChange={(value) => {
          resetPagination()
          setFilterInvitation(value)
        }}
        categories={categories}
        sortField={sortField}
        onSortFieldChange={(value) => {
          resetPagination()
          setSortField(value)
        }}
        sortDirection={sortDirection}
        onSortDirectionChange={(value) => {
          resetPagination()
          setSortDirection(value)
        }}
      />

      <GuestTable
        guests={guests}
        onUpdateGuest={updateGuest}
        onDeleteGuest={deleteGuest}
        categories={categories}
        wedding={wedding}
        onUpdateWedding={updateWedding}
        page={currentPage}
        pageSize={pageSize}
      />

      {guests.length > 25 && (
        <GuestPagination
          page={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={guests.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(0) }}
        />
      )}

      <BulkSendDialog
        guests={bulkSendQueue}
        wedding={wedding}
        open={bulkSendOpen}
        onOpenChange={setBulkSendOpen}
        onUpdateGuest={updateGuest}
        onUpdateWedding={updateWedding}
      />
    </div>
  )
}
