'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { GUEST_SIDES, RSVP_STATUSES } from '@/lib/constants'
import type { RsvpStatus, GuestSide, GuestCategory, GuestSortField, SortDirection, InvitationFilter } from '@/lib/types'

interface GuestFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  filterSide: GuestSide | 'all'
  onFilterSideChange: (value: GuestSide | 'all') => void
  filterStatus: RsvpStatus | 'all'
  onFilterStatusChange: (value: RsvpStatus | 'all') => void
  filterCategory: string | 'all'
  onFilterCategoryChange: (value: string | 'all') => void
  filterInvitation: InvitationFilter
  onFilterInvitationChange: (value: InvitationFilter) => void
  categories: GuestCategory[]
  sortField: GuestSortField | null
  onSortFieldChange: (value: GuestSortField | null) => void
  sortDirection: SortDirection
  onSortDirectionChange: (value: SortDirection) => void
}

const SORT_OPTIONS: { value: GuestSortField; label: string }[] = [
  { value: 'full_name', label: 'שם' },
  { value: 'group_name', label: 'קטגוריה' },
  { value: 'gift_amount', label: 'מתנה' },
  { value: 'rsvp_status', label: 'סטטוס' },
  { value: 'created_at', label: 'תאריך הוספה' },
]

export function GuestFilters({
  search,
  onSearchChange,
  filterSide,
  onFilterSideChange,
  filterStatus,
  onFilterStatusChange,
  filterCategory,
  onFilterCategoryChange,
  filterInvitation,
  onFilterInvitationChange,
  categories,
  sortField,
  onSortFieldChange,
  sortDirection,
  onSortDirectionChange,
}: GuestFiltersProps) {
  return (
    <div className="space-y-3">
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
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={filterInvitation} onValueChange={(v) => onFilterInvitationChange(v as InvitationFilter)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="הזמנה" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל ההזמנות</SelectItem>
            <SelectItem value="sent">נשלחה הזמנה</SelectItem>
            <SelectItem value="not_sent">לא נשלחה</SelectItem>
          </SelectContent>
        </Select>
        {categories.length > 0 && (
          <Select value={filterCategory} onValueChange={(v) => onFilterCategoryChange(v)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="קטגוריה" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הקטגוריות</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="flex gap-2 items-center">
          <Select
            value={sortField || 'none'}
            onValueChange={(v) => onSortFieldChange(v === 'none' ? null : v as GuestSortField)}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="מיון" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">ללא מיון</SelectItem>
              {SORT_OPTIONS.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {sortField && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="shrink-0"
            >
              {sortDirection === 'asc' ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
