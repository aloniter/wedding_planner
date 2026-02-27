'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import { GUEST_SIDES, RSVP_STATUSES } from '@/lib/constants'
import type { RsvpStatus, GuestSide } from '@/lib/types'

interface GuestFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  filterSide: GuestSide | 'all'
  onFilterSideChange: (value: GuestSide | 'all') => void
  filterStatus: RsvpStatus | 'all'
  onFilterStatusChange: (value: RsvpStatus | 'all') => void
}

export function GuestFilters({
  search,
  onSearchChange,
  filterSide,
  onFilterSideChange,
  filterStatus,
  onFilterStatusChange,
}: GuestFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="חיפוש לפי שם או טלפון..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="pr-9"
        />
      </div>
      <Select value={filterSide} onValueChange={(v) => onFilterSideChange(v as GuestSide | 'all')}>
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="צד" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הצדדים</SelectItem>
          {GUEST_SIDES.map(s => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filterStatus} onValueChange={(v) => onFilterStatusChange(v as RsvpStatus | 'all')}>
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="סטטוס" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הסטטוסים</SelectItem>
          {RSVP_STATUSES.map(s => (
            <SelectItem key={s.value} value={s.value}>{s.emoji} {s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
