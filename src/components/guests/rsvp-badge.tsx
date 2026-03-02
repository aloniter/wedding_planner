'use client'

import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RSVP_STATUSES } from '@/lib/constants'
import type { RsvpStatus } from '@/lib/types'

interface RsvpBadgeProps {
  status: RsvpStatus
  onStatusChange: (status: RsvpStatus) => void
}

const statusStyles: Record<RsvpStatus, string> = {
  'אישר': 'bg-green-100 text-green-800 hover:bg-green-200',
  'ביטל': 'bg-red-100 text-red-800 hover:bg-red-200',
  'ממתין': 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  'אולי': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
}

export function RsvpBadge({ status, onStatusChange }: RsvpBadgeProps) {
  const current = RSVP_STATUSES.find(s => s.value === status)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge
          variant="outline"
          className={`cursor-pointer border-0 ${statusStyles[status]}`}
        >
          {current?.emoji} {current?.label}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {RSVP_STATUSES.map((s) => (
          <DropdownMenuItem
            key={s.value}
            onClick={() => onStatusChange(s.value)}
            className={status === s.value ? 'font-bold' : ''}
          >
            {s.emoji} {s.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
