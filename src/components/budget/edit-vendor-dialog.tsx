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
import { VENDOR_CATEGORIES } from '@/lib/constants'
import type { Vendor, VendorUpdate, VendorCategory } from '@/lib/types'

interface EditVendorDialogProps {
  vendor: Vendor
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (id: string, updates: VendorUpdate) => void
  onDelete: (id: string) => void
}

export function EditVendorDialog({ vendor, open, onOpenChange, onUpdate, onDelete }: EditVendorDialogProps) {
  const [name, setName] = useState(vendor.name)
  const [category, setCategory] = useState<VendorCategory>(vendor.category)
  const [contactPhone, setContactPhone] = useState(vendor.contact_phone || '')
  const [totalPrice, setTotalPrice] = useState(String(vendor.total_price))
  const [depositPaid, setDepositPaid] = useState(String(vendor.deposit_paid))
  const [notes, setNotes] = useState(vendor.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onUpdate(vendor.id, {
      name: name.trim(),
      category,
      contact_phone: contactPhone.trim() || null,
      total_price: parseInt(totalPrice) || 0,
      deposit_paid: parseInt(depositPaid) || 0,
      notes: notes.trim() || null,
    })
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (confirm(`למחוק את ${vendor.name}?`)) {
      onDelete(vendor.id)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>עריכת ספק</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-vendor-name">שם הספק *</Label>
            <Input
              id="edit-vendor-name"
              value={name}
              onChange={e => setName(e.target.value)}
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
              <Label htmlFor="edit-vendor-phone">טלפון</Label>
              <Input
                id="edit-vendor-phone"
                type="tel"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-vendor-price">מחיר כולל (₪)</Label>
              <Input
                id="edit-vendor-price"
                type="number"
                min="0"
                value={totalPrice}
                onChange={e => setTotalPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vendor-deposit">מקדמה ששולמה (₪)</Label>
              <Input
                id="edit-vendor-deposit"
                type="number"
                min="0"
                value={depositPaid}
                onChange={e => setDepositPaid(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-vendor-notes">הערות</Label>
            <Textarea
              id="edit-vendor-notes"
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
