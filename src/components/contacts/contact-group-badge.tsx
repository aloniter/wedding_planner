'use client'

import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CONTACT_GROUP_PRESETS } from '@/lib/constants'

interface ContactGroupBadgeProps {
  groupTag: string | null
  onGroupChange: (group: string | null) => void
  extraGroups?: string[]
}

const groupColors: Record<string, string> = {
  'משפחה': 'bg-rose-100 text-rose-800 hover:bg-rose-200',
  'חברים': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'עבודה': 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  'שכנים': 'bg-green-100 text-green-800 hover:bg-green-200',
  'אחר': 'bg-gray-100 text-gray-800 hover:bg-gray-200',
}

export function ContactGroupBadge({
  groupTag,
  onGroupChange,
  extraGroups = [],
}: ContactGroupBadgeProps) {
  const allGroups = [
    ...CONTACT_GROUP_PRESETS,
    ...extraGroups.filter((g) => !(CONTACT_GROUP_PRESETS as readonly string[]).includes(g)),
  ]

  const colorClass =
    groupTag && groupColors[groupTag]
      ? groupColors[groupTag]
      : groupTag
        ? 'bg-violet-100 text-violet-800 hover:bg-violet-200'
        : 'bg-muted text-muted-foreground hover:bg-muted/80'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge variant="outline" className={`cursor-pointer border-0 ${colorClass}`}>
          {groupTag || 'ללא קבוצה'}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => onGroupChange(null)}>
          ללא קבוצה
        </DropdownMenuItem>
        {allGroups.map((g) => (
          <DropdownMenuItem
            key={g}
            onClick={() => onGroupChange(g)}
            className={groupTag === g ? 'font-bold' : ''}
          >
            {g}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
