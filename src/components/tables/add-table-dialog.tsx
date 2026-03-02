'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import type { WeddingTableInsert } from '@/lib/types'

interface AddTableDialogProps {
  weddingId: string
  nextNumber: number
  onAdd: (data: WeddingTableInsert) => void
}

export function AddTableDialog({ weddingId, nextNumber, onAdd }: AddTableDialogProps) {
  const [open, setOpen] = useState(false)
  const [tableNumber, setTableNumber] = useState(String(nextNumber))
  const [label, setLabel] = useState('')
  const [seatCapacity, setSeatCapacity] = useState('10')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      wedding_id: weddingId,
      table_number: parseInt(tableNumber) || nextNumber,
      label: label.trim() || null,
      seat_capacity: parseInt(seatCapacity) || 10,
    })
    setTableNumber(String(nextNumber + 1))
    setLabel('')
    setSeatCapacity('10')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 ml-1" />
          הוסף שולחן
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>הוספת שולחן</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="table-num">מספר שולחן</Label>
              <Input
                id="table-num"
                type="number"
                min="1"
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seat-cap">מקומות</Label>
              <Input
                id="seat-cap"
                type="number"
                min="1"
                value={seatCapacity}
                onChange={e => setSeatCapacity(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="table-label">שם (אופציונלי)</Label>
            <Input
              id="table-label"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="למשל: שולחן משפחה"
            />
          </div>
          <Button type="submit" className="w-full">הוסף שולחן</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
