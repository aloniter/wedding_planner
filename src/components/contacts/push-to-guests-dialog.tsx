'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserPlus } from 'lucide-react'
import { GUEST_SIDES } from '@/lib/constants'
import type { ImportedContact, GuestInsert, GuestSide } from '@/lib/types'

interface PushToGuestsDialogProps {
  filteredContacts: ImportedContact[]
  allContacts: ImportedContact[]
  weddingId: string
  onPush: (guests: GuestInsert[]) => void
}

export function PushToGuestsDialog({
  filteredContacts,
  allContacts,
  weddingId,
  onPush,
}: PushToGuestsDialogProps) {
  const [open, setOpen] = useState(false)
  const [scope, setScope] = useState<'all' | 'filtered'>('all')
  const [side, setSide] = useState<GuestSide>('משותף')

  const contactsToAdd = scope === 'all' ? allContacts : filteredContacts
  const showFilteredOption =
    filteredContacts.length !== allContacts.length && filteredContacts.length > 0

  const handlePush = () => {
    const guests: GuestInsert[] = contactsToAdd.map((c) => ({
      wedding_id: weddingId,
      full_name: c.full_name,
      phone: c.phone,
      side,
      group_name: c.group_tag,
      adults_count: 1,
      kids_count: 0,
      rsvp_status: 'ממתין',
      notes: null,
    }))
    onPush(guests)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="h-4 w-4 ml-1" />
          הוסף לאורחים
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>הוספת אנשי קשר לרשימת האורחים</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Scope selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">אילו אנשי קשר להוסיף?</label>
            <Select
              value={scope}
              onValueChange={(v) => setScope(v as 'all' | 'filtered')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  כל אנשי הקשר ({allContacts.length})
                </SelectItem>
                {showFilteredOption && (
                  <SelectItem value="filtered">
                    המסוננים בלבד ({filteredContacts.length})
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Side selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              מה הצד של האורחים החדשים?
            </label>
            <Select
              value={side}
              onValueChange={(v) => setSide(v as GuestSide)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GUEST_SIDES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {contactsToAdd.length > 0 && (
            <div className="border rounded-md max-h-40 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-right p-2 font-medium">שם</th>
                    <th className="text-right p-2 font-medium">טלפון</th>
                    <th className="text-right p-2 font-medium">קבוצה</th>
                  </tr>
                </thead>
                <tbody>
                  {contactsToAdd.slice(0, 5).map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="p-2">{c.full_name}</td>
                      <td className="p-2" dir="ltr">
                        {c.phone || '—'}
                      </td>
                      <td className="p-2">{c.group_tag || '—'}</td>
                    </tr>
                  ))}
                  {contactsToAdd.length > 5 && (
                    <tr className="border-t">
                      <td
                        colSpan={3}
                        className="p-2 text-center text-muted-foreground"
                      >
                        ועוד {contactsToAdd.length - 5} אנשי קשר...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <Button
            onClick={handlePush}
            className="w-full"
            disabled={contactsToAdd.length === 0}
          >
            הוסף {contactsToAdd.length} אנשי קשר לאורחים
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
