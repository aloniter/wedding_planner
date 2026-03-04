'use client'

import { useState, useEffect } from 'react'
import { Pencil, Star } from 'lucide-react'
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
import { VenueAttachments } from './venue-attachments'
import type { Venue, VenueUpdate, VenueStatus } from '@/lib/types'

const STATUSES: { value: VenueStatus; label: string }[] = [
  { value: 'בבדיקה', label: 'בבדיקה' },
  { value: 'נקבעה פגישה', label: 'נקבעה פגישה' },
  { value: 'אהבנו', label: 'אהבנו' },
  { value: 'לא מתאים', label: 'לא מתאים' },
  { value: 'נבחר', label: 'נבחר ✓' },
]

interface Props {
  venue: Venue
  weddingId: string
  onUpdate: (id: string, updates: VenueUpdate) => void
}

export function EditVenueDialog({ venue, weddingId, onUpdate }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(venue.name)
  const [status, setStatus] = useState<VenueStatus>(venue.status)
  const [location, setLocation] = useState(venue.location ?? '')
  const [phone, setPhone] = useState(venue.phone ?? '')
  const [contactName, setContactName] = useState(venue.contact_name ?? '')
  const [website, setWebsite] = useState(venue.website ?? '')
  const [capacity, setCapacity] = useState(venue.capacity?.toString() ?? '')
  const [pricePerPerson, setPricePerPerson] = useState(venue.price_per_person?.toString() ?? '')
  const [minimumSpend, setMinimumSpend] = useState(venue.minimum_spend?.toString() ?? '')
  const [availableDates, setAvailableDates] = useState(venue.available_dates ?? '')
  const [rating, setRating] = useState(venue.rating ?? 0)
  const [notes, setNotes] = useState(venue.notes ?? '')

  useEffect(() => {
    if (open) {
      setName(venue.name); setStatus(venue.status)
      setLocation(venue.location ?? ''); setPhone(venue.phone ?? '')
      setContactName(venue.contact_name ?? ''); setWebsite(venue.website ?? '')
      setCapacity(venue.capacity?.toString() ?? '')
      setPricePerPerson(venue.price_per_person?.toString() ?? '')
      setMinimumSpend(venue.minimum_spend?.toString() ?? '')
      setAvailableDates(venue.available_dates ?? '')
      setRating(venue.rating ?? 0); setNotes(venue.notes ?? '')
    }
  }, [open, venue])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onUpdate(venue.id, {
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
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>עריכת אולם</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label>שם האולם *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} required />
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
              <Input value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>איש קשר</Label>
              <Input value={contactName} onChange={e => setContactName(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>אתר אינטרנט</Label>
              <Input value={website} onChange={e => setWebsite(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>קיבולת אורחים</Label>
              <Input type="number" min="0" value={capacity} onChange={e => setCapacity(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>מחיר לאורח (₪)</Label>
              <Input type="number" min="0" value={pricePerPerson} onChange={e => setPricePerPerson(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>מינימום הזמנה (₪)</Label>
              <Input type="number" min="0" value={minimumSpend} onChange={e => setMinimumSpend(e.target.value)} />
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
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>קבצים מצורפים</Label>
              <VenueAttachments venueId={venue.id} weddingId={weddingId} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
            <Button type="submit">שמור שינויים</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
