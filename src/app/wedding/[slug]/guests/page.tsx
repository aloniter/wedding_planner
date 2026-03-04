'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { GuestFilters } from '@/components/guests/guest-filters'
import { GuestTable } from '@/components/guests/guest-table'
import { AddGuestDialog } from '@/components/guests/add-guest-dialog'
import { CsvImportDialog } from '@/components/guests/csv-import-dialog'
import { CategoryManager } from '@/components/guests/category-manager'
import { ExportDropdown } from '@/components/guests/export-dropdown'
import { DuplicateDetector } from '@/components/guests/duplicate-detector'
import { GuestPagination } from '@/components/guests/guest-pagination'
import { useWeddingSlugContext } from '@/providers/wedding-slug-provider'
import { useGuests } from '@/hooks/use-guests'
import { useCategories } from '@/hooks/use-categories'

export default function GuestsPage() {
  const { wedding, loading: weddingLoading } = useWeddingSlugContext()
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

  useEffect(() => {
    setPage(0)
  }, [search, filterSide, filterStatus, filterCategory, sortField, sortDirection])

  if (weddingLoading || guestsLoading || !wedding) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">טוען...</div>
      </div>
    )
  }

  const totalPages = pageSize > 0 ? Math.ceil(guests.length / pageSize) : 1

  return (
    <div className="space-y-4">
      <PageHeader
        title="ניהול אורחים"
        subtitle={`${stats.total} מוזמנים · ${stats.totalAdults + stats.totalKids} אנשים`}
        action={
          <div className="flex gap-2 flex-wrap justify-end">
            <AddGuestDialog weddingId={wedding.id} categories={categories} onAdd={addGuest} />
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
        onSearchChange={setSearch}
        filterSide={filterSide}
        onFilterSideChange={setFilterSide}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        filterCategory={filterCategory}
        onFilterCategoryChange={setFilterCategory}
        categories={categories}
        sortField={sortField}
        onSortFieldChange={setSortField}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
      />

      <GuestTable
        guests={guests}
        onUpdateGuest={updateGuest}
        onDeleteGuest={deleteGuest}
        categories={categories}
        page={page}
        pageSize={pageSize}
      />

      {guests.length > 25 && (
        <GuestPagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={guests.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(0) }}
        />
      )}
    </div>
  )
}
