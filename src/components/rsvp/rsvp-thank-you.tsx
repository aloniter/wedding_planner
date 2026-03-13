'use client'

import { Card, CardContent } from '@/components/ui/card'
import { RSVP_STRINGS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { RsvpPublicStatus, PublicRsvpWedding } from '@/lib/types'

interface RsvpThankYouProps {
  status: RsvpPublicStatus
  wedding: PublicRsvpWedding
}

const THANK_YOU_CONFIG: Record<RsvpPublicStatus, { message: string; icon: string }> = {
  'אישר': {
    message: RSVP_STRINGS.thankYouConfirmed,
    icon: '🎉',
  },
  'ביטל': {
    message: RSVP_STRINGS.thankYouDeclined,
    icon: '💙',
  },
  'אולי': {
    message: RSVP_STRINGS.thankYouMaybe,
    icon: '🤞',
  },
}

export function RsvpThankYou({ status, wedding }: RsvpThankYouProps) {
  const config = THANK_YOU_CONFIG[status]

  return (
    <Card className="text-center animate-in fade-in zoom-in-95 duration-300">
      <CardContent className="space-y-4 pt-2">
        <div className="text-5xl">{config.icon}</div>
        <h1 className="text-xl font-bold text-foreground">
          {config.message}
        </h1>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>{wedding.bride_name} & {wedding.groom_name}</p>
          {wedding.wedding_date && <p>{formatDate(wedding.wedding_date)}</p>}
          {wedding.venue_name && <p>{wedding.venue_name}</p>}
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          {RSVP_STRINGS.updateNote}
        </p>
      </CardContent>
    </Card>
  )
}
