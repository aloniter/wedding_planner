'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Pencil } from 'lucide-react'
import { RsvpBadge } from './rsvp-badge'
import { EditGuestDialog } from './edit-guest-dialog'
import { GUEST_SIDES } from '@/lib/constants'
import type { Guest, GuestUpdate, RsvpStatus } from '@/lib/types'

interface GuestTableProps {
  guests: Guest[]
  onUpdateGuest: (id: string, updates: GuestUpdate) => void
  onDeleteGuest: (id: string) => void
}

const sideColors: Record<string, string> = {
  'חתן': 'bg-blue-100 text-blue-800',
  'כלה': 'bg-pink-100 text-pink-800',
  'משותף': 'bg-purple-100 text-purple-800',
}

export function GuestTable({ guests, onUpdateGuest, onDeleteGuest }: GuestTableProps) {
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)

  const handleStatusChange = (guestId: string, status: RsvpStatus) => {
    onUpdateGuest(guestId, { rsvp_status: status })
  }

  if (guests.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">אין אורחים עדיין</p>
        <p className="text-sm mt-1">הוסיפו אורחים ידנית או ייבאו מ-CSV</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">סטטוס</TableHead>
              <TableHead>שם</TableHead>
              <TableHead>טלפון</TableHead>
              <TableHead>צד</TableHead>
              <TableHead>מוזמנים</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.map((guest) => (
              <TableRow key={guest.id}>
                <TableCell>
                  <RsvpBadge
                    status={guest.rsvp_status}
                    onStatusChange={(status) => handleStatusChange(guest.id, status)}
                  />
                </TableCell>
                <TableCell className="font-medium">{guest.full_name}</TableCell>
                <TableCell dir="ltr" className="text-right">{guest.phone || '—'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`border-0 ${sideColors[guest.side]}`}>
                    {GUEST_SIDES.find(s => s.value === guest.side)?.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {guest.adults_count}
                  {guest.kids_count > 0 && `+${guest.kids_count}`}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => setEditingGuest(guest)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {guests.map((guest) => (
          <Card key={guest.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <RsvpBadge
                      status={guest.rsvp_status}
                      onStatusChange={(status) => handleStatusChange(guest.id, status)}
                    />
                    <span className="font-medium truncate">{guest.full_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {guest.phone && <span dir="ltr">{guest.phone}</span>}
                    <Badge variant="outline" className={`border-0 text-xs ${sideColors[guest.side]}`}>
                      {GUEST_SIDES.find(s => s.value === guest.side)?.label}
                    </Badge>
                    <span>
                      {guest.adults_count} מבוגרים
                      {guest.kids_count > 0 && ` + ${guest.kids_count} ילדים`}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setEditingGuest(guest)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit dialog */}
      {editingGuest && (
        <EditGuestDialog
          guest={editingGuest}
          open={!!editingGuest}
          onOpenChange={(open) => !open && setEditingGuest(null)}
          onUpdate={onUpdateGuest}
          onDelete={onDeleteGuest}
        />
      )}
    </>
  )
}
