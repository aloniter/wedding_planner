'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, UserPlus } from 'lucide-react'
import type { Guest } from '@/lib/types'

interface AssignGuestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unassignedGuests: Guest[]
  tableNumber: number
  onAssign: (guestId: string) => void
}

export function AssignGuestDialog({ open, onOpenChange, unassignedGuests, tableNumber, onAssign }: AssignGuestDialogProps) {
  const [search, setSearch] = useState('')

  const filtered = search
    ? unassignedGuests.filter(g => g.full_name.includes(search) || g.phone?.includes(search))
    : unassignedGuests

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>שיבוץ לשולחן {tableNumber}</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש אורח..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>

        <div className="overflow-y-auto max-h-[400px] space-y-1">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-6">
              {unassignedGuests.length === 0
                ? 'כל האורחים שאישרו כבר שובצו'
                : 'לא נמצאו אורחים'}
            </p>
          ) : (
            filtered.map(guest => (
              <div
                key={guest.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
                onClick={() => {
                  onAssign(guest.id)
                }}
              >
                <div>
                  <span className="text-sm font-medium">{guest.full_name}</span>
                  <span className="text-xs text-muted-foreground mr-2">
                    ({guest.adults_count}{guest.kids_count > 0 ? `+${guest.kids_count}` : ''})
                  </span>
                </div>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
