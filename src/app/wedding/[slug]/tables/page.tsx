'use client'

import { PageHeader } from '@/components/layout/page-header'
import { AddTableDialog } from '@/components/tables/add-table-dialog'
import { TablesExportDropdown } from '@/components/tables/export-dropdown'
import { TableCard } from '@/components/tables/table-card'
import { TableOverview } from '@/components/tables/table-overview'
import { useWeddingSlugContext } from '@/providers/wedding-slug-provider'
import { useGuests } from '@/hooks/use-guests'
import { useTables } from '@/hooks/use-tables'

export default function TablesPage() {
  const { wedding, loading: weddingLoading } = useWeddingSlugContext()
  const { allGuests, loading: guestsLoading, updateGuest } = useGuests(wedding?.id)
  const {
    tables,
    loading: tablesLoading,
    addTable,
    deleteTable,
    tableAssignments,
    unassignedGuests,
  } = useTables(wedding?.id, allGuests)

  if (weddingLoading || guestsLoading || tablesLoading || !wedding) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">טוען...</div>
      </div>
    )
  }

  const nextTableNumber = tables.length > 0
    ? Math.max(...tables.map(t => t.table_number)) + 1
    : 1

  const handleAssignGuest = (guestId: string, tableId: string) => {
    updateGuest(guestId, { table_id: tableId })
  }

  const handleUnassignGuest = (guestId: string) => {
    updateGuest(guestId, { table_id: null })
  }

  const sortedTables = [...tables].sort((a, b) => a.table_number - b.table_number)
  const hasExportableData = tables.length > 0 || unassignedGuests.length > 0

  return (
    <div className="space-y-4">
      <PageHeader
        title="סידורי ישיבה"
        subtitle={`${tables.length} שולחנות · ${unassignedGuests.length} ממתינים לשיבוץ`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {hasExportableData && (
              <TablesExportDropdown
                tables={tables}
                tableAssignments={tableAssignments}
                unassignedGuests={unassignedGuests}
                wedding={wedding}
              />
            )}
            <AddTableDialog
              weddingId={wedding.id}
              nextNumber={nextTableNumber}
              onAdd={addTable}
            />
          </div>
        }
      />

      {tables.length > 0 && (
        <TableOverview
          tables={tables}
          tableAssignments={tableAssignments}
          unassignedCount={unassignedGuests.length}
        />
      )}

      {tables.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">אין שולחנות עדיין</p>
          <p className="text-sm mt-1">הוסיפו שולחנות ושבצו אורחים</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTables.map(table => (
            <TableCard
              key={table.id}
              table={table}
              assignedGuests={tableAssignments.get(table.id) || []}
              unassignedGuests={unassignedGuests}
              onAssignGuest={handleAssignGuest}
              onUnassignGuest={handleUnassignGuest}
              onDeleteTable={deleteTable}
            />
          ))}
        </div>
      )}
    </div>
  )
}
