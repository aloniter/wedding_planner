'use client'

import { useState } from 'react'
import { Star, MapPin, Phone, Users, Trash2, Globe, CalendarDays, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EditVenueDialog } from './edit-venue-dialog'
import type { Venue, VenueUpdate, VenueStatus } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

const STATUS_CONFIG: Record<VenueStatus, { label: string; className: string }> = {
  'בבדיקה':       { label: 'בבדיקה',       className: 'bg-slate-100 text-slate-700 border-slate-200' },
  'נקבעה פגישה': { label: 'נקבעה פגישה', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  'אהבנו':        { label: 'אהבנו',        className: 'bg-green-100 text-green-700 border-green-200' },
  'לא מתאים':    { label: 'לא מתאים',    className: 'bg-red-100 text-red-700 border-red-200' },
  'נבחר':         { label: 'נבחר ✓',       className: 'bg-purple-100 text-purple-700 border-purple-200 font-semibold' },
}

interface Props {
  venue: Venue
  onUpdate: (id: string, updates: VenueUpdate) => void
  onDelete: (id: string) => void
}

export function VenueCard({ venue, onUpdate, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const statusCfg = STATUS_CONFIG[venue.status]
  const isChosen = venue.status === 'נבחר'

  return (
    <Card className={`relative transition-shadow hover:shadow-md ${isChosen ? 'ring-2 ring-purple-300' : ''}`}>
      <CardContent className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base leading-tight truncate">{venue.name}</h3>
            {venue.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                {venue.location}
              </p>
            )}
          </div>
          <Badge className={`text-xs shrink-0 border ${statusCfg.className}`} variant="outline">
            {statusCfg.label}
          </Badge>
        </div>

        {/* Star rating */}
        {venue.rating && (
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
              <Star
                key={n}
                className={`h-4 w-4 ${n <= venue.rating! ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
              />
            ))}
          </div>
        )}

        {/* Pricing */}
        {(venue.price_per_person || venue.minimum_spend) && (
          <div className="flex flex-wrap gap-2 text-sm">
            {venue.price_per_person && (
              <span className="font-medium text-foreground">
                {formatCurrency(venue.price_per_person)}<span className="text-muted-foreground font-normal"> / אורח</span>
              </span>
            )}
            {venue.minimum_spend && (
              <span className="text-muted-foreground">
                מינימום: <span className="font-medium text-foreground">{formatCurrency(venue.minimum_spend)}</span>
              </span>
            )}
          </div>
        )}

        {/* Capacity */}
        {venue.capacity && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            עד {venue.capacity} אורחים
          </p>
        )}

        {/* Available dates */}
        {venue.available_dates && (
          <div className="rounded-md bg-green-50 border border-green-100 px-3 py-2">
            <p className="text-xs font-medium text-green-700 flex items-center gap-1 mb-1">
              <CalendarDays className="h-3.5 w-3.5" />
              תאריכים פנויים
            </p>
            <p className="text-sm text-green-800 leading-snug">{venue.available_dates}</p>
          </div>
        )}

        {/* Contact info */}
        {(venue.phone || venue.contact_name || venue.website) && (
          <div className="space-y-1 text-sm text-muted-foreground">
            {venue.contact_name && (
              <p className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 flex-shrink-0" />
                {venue.contact_name}
              </p>
            )}
            {venue.phone && (
              <a href={`tel:${venue.phone}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                {venue.phone}
              </a>
            )}
            {venue.website && (
              <a
                href={venue.website.startsWith('http') ? venue.website : `https://${venue.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors truncate"
              >
                <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                {venue.website}
              </a>
            )}
          </div>
        )}

        {/* Notes */}
        {venue.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2 border-t pt-2">{venue.notes}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-1 border-t pt-2">
          {confirmDelete ? (
            <>
              <span className="text-xs text-destructive mr-auto">בטוח למחוק?</span>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setConfirmDelete(false)}>לא</Button>
              <Button variant="destructive" size="sm" className="text-xs h-7" onClick={() => onDelete(venue.id)}>מחק</Button>
            </>
          ) : (
            <>
              <EditVenueDialog venue={venue} onUpdate={onUpdate} />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
