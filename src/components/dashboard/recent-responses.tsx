'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RSVP_STATUSES } from '@/lib/constants'
import type { Guest, RsvpStatus } from '@/lib/types'

interface RecentResponsesProps {
  guests: Guest[]
}

const STATUS_COLORS: Record<RsvpStatus, string> = {
  'אישר': 'bg-green-100 text-green-800',
  'ביטל': 'bg-red-100 text-red-800',
  'אולי': 'bg-blue-100 text-blue-800',
  'ממתין': 'bg-yellow-100 text-yellow-800',
}

function formatRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) return 'עכשיו'
  if (diffMinutes < 60) return `לפני ${diffMinutes} דקות`
  if (diffHours < 24) return `לפני ${diffHours} שעות`
  if (diffDays < 7) return `לפני ${diffDays} ימים`
  return new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short' }).format(date)
}

export function RecentResponses({ guests }: RecentResponsesProps) {
  const recentResponses = useMemo(() => {
    return guests
      .filter((g) => g.rsvp_responded_at)
      .sort((a, b) => new Date(b.rsvp_responded_at!).getTime() - new Date(a.rsvp_responded_at!).getTime())
      .slice(0, 8)
  }, [guests])

  if (recentResponses.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">תגובות אחרונות</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentResponses.map((guest) => {
          const statusInfo = RSVP_STATUSES.find((s) => s.value === guest.rsvp_status)
          return (
            <div key={guest.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant="outline" className={`border-0 shrink-0 ${STATUS_COLORS[guest.rsvp_status]}`}>
                  {statusInfo?.emoji} {statusInfo?.label}
                </Badge>
                <span className="text-sm font-medium truncate">{guest.full_name}</span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                {formatRelativeTime(guest.rsvp_responded_at!)}
              </span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
