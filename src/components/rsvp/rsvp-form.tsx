'use client'

import { useState } from 'react'
import { submitRsvp } from '@/app/rsvp/actions'
import { RsvpThankYou } from '@/components/rsvp/rsvp-thank-you'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RSVP_STRINGS, RSVP_PUBLIC_STATUSES } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { RsvpPageData, RsvpPublicStatus } from '@/lib/types'

interface RsvpFormProps {
  data: RsvpPageData
  token: string
}

const STATUS_STYLES: Record<RsvpPublicStatus, { selected: string; ring: string }> = {
  'אישר': {
    selected: 'bg-green-100 border-green-500 text-green-800',
    ring: 'ring-green-300',
  },
  'אולי': {
    selected: 'bg-blue-100 border-blue-500 text-blue-800',
    ring: 'ring-blue-300',
  },
  'ביטל': {
    selected: 'bg-red-100 border-red-500 text-red-800',
    ring: 'ring-red-300',
  },
}

export function RsvpForm({ data, token }: RsvpFormProps) {
  const { guest, wedding } = data

  const [status, setStatus] = useState<RsvpPublicStatus | null>(
    guest.rsvp_status !== 'ממתין' ? (guest.rsvp_status as RsvpPublicStatus) : null
  )
  const [adultsCount, setAdultsCount] = useState(Math.max(1, guest.adults_count))
  const [kidsCount, setKidsCount] = useState(guest.kids_count)
  const [notes, setNotes] = useState(guest.notes || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const hasResponded = !!guest.rsvp_responded_at
  const showCounts = status === 'אישר' || status === 'אולי'

  async function handleSubmit() {
    if (!status) return
    setSubmitting(true)
    setError(null)

    const result = await submitRsvp(token, {
      rsvp_status: status,
      adults_count: showCounts ? adultsCount : 0,
      kids_count: showCounts ? kidsCount : 0,
      notes,
    })

    setSubmitting(false)

    if (result.success) {
      setSubmitted(true)
    } else {
      setError(result.error)
    }
  }

  if (submitted && status) {
    return <RsvpThankYou status={status} wedding={wedding} />
  }

  return (
    <div className="space-y-4">
      {/* Wedding header card */}
      <Card className="text-center">
        <CardHeader>
          <div className="text-3xl mb-1">💍</div>
          <CardTitle className="text-xl">
            {RSVP_STRINGS.invitedTo(wedding.bride_name, wedding.groom_name)}
          </CardTitle>
          <CardDescription className="space-y-1">
            {wedding.wedding_date && (
              <div>{RSVP_STRINGS.dateLabel}: {formatDate(wedding.wedding_date)}</div>
            )}
            {wedding.venue_name && (
              <div>{RSVP_STRINGS.venueLabel}: {wedding.venue_name}</div>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* RSVP form card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {RSVP_STRINGS.greeting(guest.full_name)}
          </CardTitle>
          {hasResponded && (
            <CardDescription>{RSVP_STRINGS.alreadyResponded}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Attendance selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{RSVP_STRINGS.attendanceQuestion}</Label>
            <div className="grid grid-cols-3 gap-2">
              {RSVP_PUBLIC_STATUSES.map((option) => {
                const isSelected = status === option.value
                const styles = STATUS_STYLES[option.value]
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(option.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all min-h-[72px]',
                      'focus-visible:outline-none focus-visible:ring-2',
                      styles.ring,
                      isSelected
                        ? styles.selected
                        : 'border-border bg-card hover:bg-accent/50',
                    )}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Guest counts — only for attending/maybe */}
          {showCounts && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <CounterField
                label={RSVP_STRINGS.adultsLabel}
                value={adultsCount}
                onChange={setAdultsCount}
                min={1}
                max={20}
              />
              <CounterField
                label={RSVP_STRINGS.kidsLabel}
                value={kidsCount}
                onChange={setKidsCount}
                min={0}
                max={20}
              />
            </div>
          )}

          {/* Notes */}
          {status && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <Label htmlFor="rsvp-notes">{RSVP_STRINGS.notesLabel}</Label>
              <Textarea
                id="rsvp-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={RSVP_STRINGS.notesPlaceholder}
                maxLength={500}
                rows={3}
                className="resize-none"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          {/* Submit */}
          {status && (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-12 text-base"
              size="lg"
            >
              {submitting ? RSVP_STRINGS.updatingButton : RSVP_STRINGS.submitButton}
            </Button>
          )}

          <p className="text-xs text-muted-foreground text-center">
            {RSVP_STRINGS.updateNote}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function CounterField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
}) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 rounded-full text-lg"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          -
        </Button>
        <span className="w-8 text-center text-lg font-semibold tabular-nums">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 rounded-full text-lg"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          +
        </Button>
      </div>
    </div>
  )
}
