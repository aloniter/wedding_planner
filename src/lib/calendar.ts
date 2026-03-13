import type { PublicRsvpWedding } from '@/lib/types'

interface CalendarEvent {
  title: string
  date: string // ISO date string (YYYY-MM-DD)
  location?: string
  description: string
}

function buildEvent(wedding: PublicRsvpWedding): CalendarEvent | null {
  if (!wedding.wedding_date) return null

  const title = `החתונה של ${wedding.bride_name} ו${wedding.groom_name}`
  const description = `${title} 💍`

  return {
    title,
    date: wedding.wedding_date,
    location: wedding.venue_name || undefined,
    description,
  }
}

/**
 * Format a date string as YYYYMMDD for Google Calendar / ICS.
 */
function formatDateCompact(dateStr: string): string {
  return dateStr.replace(/-/g, '')
}

/**
 * Generate a Google Calendar URL for an all-day event.
 * Opens in a new tab — works on mobile and desktop.
 */
export function generateGoogleCalendarUrl(wedding: PublicRsvpWedding): string | null {
  const event = buildEvent(wedding)
  if (!event) return null

  // All-day event: dates param uses YYYYMMDD/YYYYMMDD (end date is exclusive, so +1 day)
  const startDate = formatDateCompact(event.date)
  const endDateObj = new Date(event.date)
  endDateObj.setDate(endDateObj.getDate() + 1)
  const endDate = formatDateCompact(endDateObj.toISOString().split('T')[0])

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate}/${endDate}`,
    details: event.description,
  })

  if (event.location) {
    params.set('location', event.location)
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generate ICS file content for an all-day event.
 * Can be downloaded and opened by Apple Calendar, Outlook, etc.
 */
export function generateIcsContent(wedding: PublicRsvpWedding): string | null {
  const event = buildEvent(wedding)
  if (!event) return null

  const startDate = formatDateCompact(event.date)
  const endDateObj = new Date(event.date)
  endDateObj.setDate(endDateObj.getDate() + 1)
  const endDate = formatDateCompact(endDateObj.toISOString().split('T')[0])

  const uid = `wedding-${startDate}@hatuna-shelanu`
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hatuna Shelanu//RSVP//HE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
  ]

  if (event.location) {
    lines.push(`LOCATION:${escapeIcsText(event.location)}`)
  }

  lines.push('END:VEVENT', 'END:VCALENDAR')

  return lines.join('\r\n')
}

/**
 * Trigger an ICS file download in the browser.
 */
export function downloadIcsFile(wedding: PublicRsvpWedding): void {
  const content = generateIcsContent(wedding)
  if (!content) return

  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `wedding-${wedding.bride_name}-${wedding.groom_name}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}
