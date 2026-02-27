'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GUEST_SIDES, RSVP_STATUSES } from '@/lib/constants'
import type { Guest, GuestUpdate, GuestSide, RsvpStatus } from '@/lib/types'

interface EditGuestDialogProps {
  guest: Guest
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (id: string, updates: GuestUpdate) => void
  onDelete: (id: string) => void
}

export function EditGuestDialog({ guest, open, onOpenChange, onUpdate, onDelete }: EditGuestDialogProps) {
  const [fullName, setFullName] = useState(guest.full_name)
  const [phone, setPhone] = useState(guest.phone || '')
  const [side, setSide] = useState<GuestSide>(guest.side)
  const [groupName, setGroupName] = useState(guest.group_name || '')
  const [adultsCount, setAdultsCount] = useState(String(guest.adults_count))
  const [kidsCount, setKidsCount] = useState(String(guest.kids_count))
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>(guest.rsvp_status)
  const [notes, setNotes] = useState(guest.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) return

    onUpdate(guest.id, {
      full_name: fullName.trim(),
      phone: phone.trim() || null,
      side,
      group_name: groupName.trim() || null,
      adults_count: parseInt(adultsCount) || 1,
      kids_count: parseInt(kidsCount) || 0,
      rsvp_status: rsvpStatus,
      notes: notes.trim() || null,
    })
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (confirm(`למחוק את ${guest.full_name}?`)) {
      onDelete(guest.id)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>עריכת אורח</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">שם מלא *</Label>
            <Input
              id="edit-name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-phone">טלפון</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>צד</Label>
              <Select value={side} onValueChange={(v) => setSide(v as GuestSide)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GUEST_SIDES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-group">קבוצה</Label>
            <Input
              id="edit-group"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="משפחה / חברים / עבודה"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-adults">מבוגרים</Label>
              <Input
                id="edit-adults"
                type="number"
                min="0"
                value={adultsCount}
                onChange={e => setAdultsCount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-kids">ילדים</Label>
              <Input
                id="edit-kids"
                type="number"
                min="0"
                value={kidsCount}
                onChange={e => setKidsCount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>סטטוס</Label>
              <Select value={rsvpStatus} onValueChange={(v) => setRsvpStatus(v as RsvpStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RSVP_STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.emoji} {s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">הערות</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              שמור שינויים
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              מחק
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
