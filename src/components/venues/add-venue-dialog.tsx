'use client'

import { useState } from 'react'
import { Plus, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { VenueInsert, VenueStatus } from '@/lib/types'

const STATUSES: { value: VenueStatus; label: string }[] = [
  { value: 'בבדיקה', label: 'בבדיקה' },
  { value: 'נקבעה פגישה', label: 'נקבעה פגישה' },
  { value: 'אהבנו', label: 'אהבנו' },
  { value: 'לא מתאים', label: 'לא מתאים' },
  { value: 'נבחר', label: 'נבחר ✓' },
]

interface Props {
  weddingId: string
  onAdd: (data: VenueInsert) => void
}

export function AddVenueDialog({ weddingId, onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [status, setStatus] = useState<VenueStatus>('בבדיקה')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [contactName, setContactName] = useState('')
  const [website, setWebsite] = useState('')
  const [capacity, setCapacity] = useState('')
  const [pricePerPerson, setPricePerPerson] = useState('')
  const [minimumSpend, setMinimumSpend] = useState('')
  const [availableDates, setAvailableDates] = useState('')
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState('')

  function reset() {
    setName(''); setStatus('בבדיקה'); setLocation(''); setPhone('')
    setContactName(''); setWebsite(''); setCapacity(''); setPricePerPerson('')
    setMinimumSpend(''); setAvailableDates(''); setRating(0); setNotes('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onAdd({
      wedding_id: weddingId,
      name: name.trim(),
      status,
      location: location.trim() || null,
      phone: phone.trim() || null,
      contact_name: contactName.trim() || null,
      website: website.trim() || null,
      capacity: capacity ? parseInt(capacity) : null,
      price_per_person: pricePerPerson ? parseInt(pricePerPerson) : null,
      minimum_spend: minimumSpend ? parseInt(minimumSpend) : null,
      available_dates: availableDates.trim() || null,
      rating: rating || null,
      notes: notes.trim() || null,
    })
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 ml-1" />הוסף אולם</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>הוספת אולם חדש</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label>שם האולם *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="גן האירועים..." required />
            </div>
            <div className="space-y-1">
              <Label>סטטוס</Label>
              <Select value={status} onValueChange={v => setStatus(v as VenueStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>מיקום</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="תל אביב, הרצליה..." />
            </div>
            <div className="space-y-1">
              <Label>טלפון</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="03-1234567" />
            </div>
            <div className="space-y-1">
              <Label>איש קשר</Label>
              <Input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="משה כהן" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>אתר אינטרנט</Label>
              <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="www.venue.co.il" />
            </div>
            <div className="space-y-1">
              <Label>קיבולת אורחים</Label>
              <Input type="number" min="0" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="300" />
            </div>
            <div className="space-y-1">
              <Label>מחיר לאורח (₪)</Label>
              <Input type="number" min="0" value={pricePerPerson} onChange={e => setPricePerPerson(e.target.value)} placeholder="350" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>מינימום הזמנה (₪)</Label>
              <Input type="number" min="0" value={minimumSpend} onChange={e => setMinimumSpend(e.target.value)} placeholder="50000" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>תאריכים פנויים</Label>
              <Textarea
                value={availableDates}
                onChange={e => setAvailableDates(e.target.value)}
                placeholder="שישי 20.6.25, שבת 5.7.25..."
                rows={2}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>דירוג</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(rating === n ? 0 : n)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>הערות</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="הרשמות שלנו מהביקור..." rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
            <Button type="submit">הוסף אולם</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
