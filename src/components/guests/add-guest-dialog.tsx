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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { GUEST_SIDES } from '@/lib/constants'
import type { GuestInsert, GuestSide, GuestCategory } from '@/lib/types'

interface AddGuestDialogProps {
  weddingId: string
  categories: GuestCategory[]
  onAdd: (guest: GuestInsert) => void
}

export function AddGuestDialog({ weddingId, categories, onAdd }: AddGuestDialogProps) {
  const [open, setOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [side, setSide] = useState<GuestSide>('משותף')
  const [groupName, setGroupName] = useState('')
  const [adultsCount, setAdultsCount] = useState('1')
  const [kidsCount, setKidsCount] = useState('0')
  const [giftAmount, setGiftAmount] = useState('')
  const [notes, setNotes] = useState('')

  const resetForm = () => {
    setFullName('')
    setPhone('')
    setSide('משותף')
    setGroupName('')
    setAdultsCount('1')
    setKidsCount('0')
    setGiftAmount('')
    setNotes('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) return

    const parsedGift = giftAmount ? Number(giftAmount) : null

    onAdd({
      wedding_id: weddingId,
      full_name: fullName.trim(),
      phone: phone.trim() || null,
      side,
      group_name: groupName || null,
      adults_count: parseInt(adultsCount) || 1,
      kids_count: parseInt(kidsCount) || 0,
      rsvp_status: 'ממתין',
      gift_amount: parsedGift && parsedGift > 0 ? parsedGift : null,
      table_id: null,
      notes: notes.trim() || null,
    })

    resetForm()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 ml-1" />
          הוסף אורח
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>הוספת אורח חדש</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">שם מלא *</Label>
            <Input
              id="name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="שם האורח"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="050-1234567"
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
            <Label>קטגוריה</Label>
            <Select value={groupName || '__none__'} onValueChange={(v) => setGroupName(v === '__none__' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">ללא</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="adults">מבוגרים</Label>
              <Input
                id="adults"
                type="number"
                min="0"
                value={adultsCount}
                onChange={e => setAdultsCount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kids">ילדים</Label>
              <Input
                id="kids"
                type="number"
                min="0"
                value={kidsCount}
                onChange={e => setKidsCount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gift">מתנה (₪)</Label>
              <Input
                id="gift"
                type="number"
                min="0"
                value={giftAmount}
                onChange={e => setGiftAmount(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="הערות נוספות..."
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full">
            הוסף אורח
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
