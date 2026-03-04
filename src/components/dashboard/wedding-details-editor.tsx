'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate, daysUntilWedding } from '@/lib/utils'
import type { Wedding, WeddingUpdate } from '@/lib/types'

interface WeddingDetailsEditorProps {
  wedding: Wedding
  onUpdate: (updates: WeddingUpdate) => void
}

export function WeddingDetailsEditor({ wedding, onUpdate }: WeddingDetailsEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const debouncedUpdate = useCallback((updates: WeddingUpdate) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onUpdate(updates)
    }, 500)
  }, [onUpdate])

  const daysLeft = daysUntilWedding(wedding.wedding_date)

  if (!isEditing) {
    return (
      <div
        className="text-center space-y-1 cursor-pointer rounded-lg p-4 hover:bg-muted/50 transition-colors"
        onClick={() => setIsEditing(true)}
      >
        <h1 className="text-2xl font-bold">
          חתונת {wedding.groom_name} ו{wedding.bride_name}
        </h1>
        <p className="text-muted-foreground">
          {formatDate(wedding.wedding_date)}
          {wedding.venue_name && <span className="mr-2">· {wedding.venue_name}</span>}
          {daysLeft !== null && daysLeft > 0 && (
            <span className="mr-2">· עוד {daysLeft} ימים</span>
          )}
        </p>
        {wedding.estimated_guests != null && (
          <p className="text-sm text-muted-foreground">
            הערכת אורחים: {wedding.estimated_guests}
          </p>
        )}
        <p className="text-xs text-muted-foreground/60 mt-1">לחץ לעריכה</p>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">פרטי האירוע</h3>
          <button
            onClick={() => setIsEditing(false)}
            className="text-sm text-primary hover:underline"
          >
            סיום עריכה
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">שם החתן</Label>
            <Input
              defaultValue={wedding.groom_name}
              onChange={e => debouncedUpdate({ groom_name: e.target.value })}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">שם הכלה</Label>
            <Input
              defaultValue={wedding.bride_name}
              onChange={e => debouncedUpdate({ bride_name: e.target.value })}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">תאריך חתונה</Label>
            <Input
              type="date"
              defaultValue={wedding.wedding_date || ''}
              onChange={e => debouncedUpdate({ wedding_date: e.target.value || null })}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">מיקום</Label>
            <Input
              defaultValue={wedding.venue_name || ''}
              onChange={e => debouncedUpdate({ venue_name: e.target.value || null })}
              placeholder="שם האולם"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">הערכת אורחים</Label>
            <Input
              type="number"
              min="0"
              defaultValue={wedding.estimated_guests ?? ''}
              onChange={e => {
                const val = e.target.value ? Number(e.target.value) : null
                debouncedUpdate({ estimated_guests: val })
              }}
              placeholder="מספר אורחים משוער"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">תקציב כולל</Label>
            <Input
              type="number"
              min="0"
              defaultValue={wedding.total_budget || ''}
              onChange={e => debouncedUpdate({ total_budget: Number(e.target.value) || 0 })}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
