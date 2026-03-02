'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tags, Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import type { GuestCategory } from '@/lib/types'

interface CategoryManagerProps {
  categories: GuestCategory[]
  onAdd: (name: string) => void
  onRename: (id: string, newName: string) => void
  onDelete: (id: string) => void
}

export function CategoryManager({ categories, onAdd, onRename, onDelete }: CategoryManagerProps) {
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleAdd = () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    if (categories.some(c => c.name === trimmed)) return
    onAdd(trimmed)
    setNewName('')
  }

  const startEdit = (cat: GuestCategory) => {
    setEditingId(cat.id)
    setEditingName(cat.name)
  }

  const saveEdit = () => {
    if (!editingId) return
    const trimmed = editingName.trim()
    if (!trimmed) return
    onRename(editingId, trimmed)
    setEditingId(null)
    setEditingName('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Tags className="h-4 w-4 ml-2" />
          ניהול קטגוריות
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>ניהול קטגוריות</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Add new category */}
          <div className="flex gap-2">
            <Input
              placeholder="שם קטגוריה חדשה"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd} size="sm" disabled={!newName.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Category list */}
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted"
              >
                {editingId === cat.id ? (
                  <>
                    <Input
                      className="h-8 text-sm flex-1"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit()
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      autoFocus
                    />
                    <Button variant="ghost" size="sm" onClick={saveEdit} className="h-8 w-8 p-0">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={cancelEdit} className="h-8 w-8 p-0">
                      <X className="h-3.5 w-3.5 text-red-600" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm">{cat.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(cat)} className="h-8 w-8 p-0">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(cat.id)} className="h-8 w-8 p-0">
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </>
                )}
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                אין קטגוריות עדיין
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
