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
import { VENDOR_CATEGORIES } from '@/lib/constants'
import type { VendorInsert, VendorCategory } from '@/lib/types'

interface AddVendorDialogProps {
  weddingId: string
  onAdd: (vendor: VendorInsert) => void
}

export function AddVendorDialog({ weddingId, onAdd }: AddVendorDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<VendorCategory>('אחר')
  const [contactPhone, setContactPhone] = useState('')
  const [totalPrice, setTotalPrice] = useState('')
  const [depositPaid, setDepositPaid] = useState('')
  const [notes, setNotes] = useState('')

  const resetForm = () => {
    setName('')
    setCategory('אחר')
    setContactPhone('')
    setTotalPrice('')
    setDepositPaid('')
    setNotes('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onAdd({
      wedding_id: weddingId,
      name: name.trim(),
      category,
      contact_phone: contactPhone.trim() || null,
      total_price: parseInt(totalPrice) || 0,
      deposit_paid: parseInt(depositPaid) || 0,
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
          הוסף ספק
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>הוספת ספק חדש</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vendor-name">שם הספק *</Label>
            <Input
              id="vendor-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="שם הספק"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>קטגוריה</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as VendorCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VENDOR_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.emoji} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-phone">טלפון</Label>
              <Input
                id="vendor-phone"
                type="tel"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="050-1234567"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="vendor-price">מחיר כולל (₪)</Label>
              <Input
                id="vendor-price"
                type="number"
                min="0"
                value={totalPrice}
                onChange={e => setTotalPrice(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-deposit">מקדמה ששולמה (₪)</Label>
              <Input
                id="vendor-deposit"
                type="number"
                min="0"
                value={depositPaid}
                onChange={e => setDepositPaid(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor-notes">הערות</Label>
            <Textarea
              id="vendor-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="הערות נוספות..."
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full">
            הוסף ספק
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
