'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { UserPlus, X, Trash2 } from 'lucide-react'
import { AssignGuestDialog } from './assign-guest-dialog'
import type { WeddingTable, Guest } from '@/lib/types'

interface TableCardProps {
  table: WeddingTable
  assignedGuests: Guest[]
  unassignedGuests: Guest[]
  onAssignGuest: (guestId: string, tableId: string) => void
  onUnassignGuest: (guestId: string) => void
  onDeleteTable: (tableId: string) => void
}

export function TableCard({ table, assignedGuests, unassignedGuests, onAssignGuest, onUnassignGuest, onDeleteTable }: TableCardProps) {
  const [assignOpen, setAssignOpen] = useState(false)

  const totalPeople = assignedGuests.reduce((sum, g) => sum + g.adults_count + g.kids_count, 0)
  const fillPercent = Math.min(100, Math.round((totalPeople / table.seat_capacity) * 100))
  const isFull = totalPeople >= table.seat_capacity

  return (
    <>
      <Card className={isFull ? 'border-green-200' : ''}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              שולחן {table.table_number}
              {table.label && <span className="text-sm font-normal text-muted-foreground mr-2">({table.label})</span>}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setAssignOpen(true)}
              >
                <UserPlus className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  if (confirm(`למחוק שולחן ${table.table_number}?`)) {
                    onDeleteTable(table.id)
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{totalPeople}/{table.seat_capacity} מקומות</span>
          </div>
          <Progress value={fillPercent} className="h-1.5" />
        </CardHeader>
        <CardContent className="pt-0">
          {assignedGuests.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">ריק</p>
          ) : (
            <div className="space-y-0.5">
              {assignedGuests.map(guest => (
                <div key={guest.id} className="flex items-center justify-between text-sm py-0.5">
                  <span>
                    {guest.full_name}
                    <span className="text-xs text-muted-foreground mr-1">
                      ({guest.adults_count}{guest.kids_count > 0 ? `+${guest.kids_count}` : ''})
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onUnassignGuest(guest.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AssignGuestDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        unassignedGuests={unassignedGuests}
        tableNumber={table.table_number}
        onAssign={(guestId) => {
          onAssignGuest(guestId, table.id)
        }}
      />
    </>
  )
}
