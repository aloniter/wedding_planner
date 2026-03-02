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
import { Card, CardContent } from '@/components/ui/card'
import { Copy, Trash2 } from 'lucide-react'
import type { Guest, GuestUpdate } from '@/lib/types'

interface DuplicateDetectorProps {
  findDuplicates: () => Guest[][]
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: GuestUpdate) => void
}

export function DuplicateDetector({ findDuplicates, onDelete, onUpdate }: DuplicateDetectorProps) {
  const [open, setOpen] = useState(false)
  const [duplicates, setDuplicates] = useState<Guest[][]>([])

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setDuplicates(findDuplicates())
    }
  }

  const handleMerge = (group: Guest[]) => {
    if (group.length < 2) return
    // Keep the first guest, sum gifts, delete the rest
    const [keeper, ...rest] = group
    const totalGift = group.reduce((sum, g) => sum + (g.gift_amount ?? 0), 0)
    if (totalGift > 0) {
      onUpdate(keeper.id, { gift_amount: totalGift })
    }
    for (const guest of rest) {
      onDelete(guest.id)
    }
    setDuplicates(prev => prev.filter(g => g !== group))
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Copy className="h-4 w-4 ml-1" />
          כפילויות
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>זיהוי כפילויות</DialogTitle>
        </DialogHeader>

        {duplicates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>לא נמצאו כפילויות</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              נמצאו {duplicates.length} קבוצות חשודות
            </p>
            {duplicates.map((group, i) => (
              <Card key={i}>
                <CardContent className="p-3 space-y-2">
                  {group.map(guest => (
                    <div key={guest.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{guest.full_name}</span>
                        {guest.phone && <span className="text-muted-foreground mr-2" dir="ltr">{guest.phone}</span>}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleMerge(group)}
                    >
                      מזג (שמור ראשון)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
