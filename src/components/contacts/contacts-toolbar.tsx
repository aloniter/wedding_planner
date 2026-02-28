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
import { CONTACT_GROUP_PRESETS } from '@/lib/constants'

interface ContactsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  filterGroup: string | 'all'
  onFilterGroupChange: (value: string | 'all') => void
  groupTags: string[]
}

export function ContactsToolbar({
  search,
  onSearchChange,
  filterGroup,
  onFilterGroupChange,
  groupTags,
}: ContactsToolbarProps) {
  // Combine presets with any custom groups from the data
  const allGroups = [
    ...CONTACT_GROUP_PRESETS,
    ...groupTags.filter((g) => !(CONTACT_GROUP_PRESETS as readonly string[]).includes(g)),
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="חיפוש לפי שם, טלפון או אימייל..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-9"
        />
      </div>
      <Select
        value={filterGroup}
        onValueChange={(v) => onFilterGroupChange(v as string | 'all')}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="קבוצה" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הקבוצות</SelectItem>
          {allGroups.map((g) => (
            <SelectItem key={g} value={g}>
              {g}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
