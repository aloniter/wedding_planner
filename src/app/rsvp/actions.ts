'use server'

import { createServiceClient } from '@/lib/supabase/service'
import type { RsvpPageData, RsvpSubmission, RsvpPublicStatus } from '@/lib/types'

const VALID_RSVP_STATUSES: RsvpPublicStatus[] = ['אישר', 'ביטל', 'אולי']

// UUID v4 format validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Fetches guest + wedding data by RSVP token.
 * Returns null for invalid or non-existent tokens.
 * Uses service role client (bypasses RLS) — safe because we only return public fields.
 */
export async function getGuestByToken(token: string): Promise<RsvpPageData | null> {
  if (!token || !UUID_REGEX.test(token)) {
    return null
  }

  const supabase = createServiceClient()

  const { data: guest, error: guestError } = await supabase
    .from('guests')
    .select('full_name, rsvp_status, adults_count, kids_count, notes, rsvp_responded_at, wedding_id')
    .eq('rsvp_token', token)
    .single()

  if (guestError || !guest) {
    return null
  }

  const { data: wedding, error: weddingError } = await supabase
    .from('weddings')
    .select('bride_name, groom_name, wedding_date, venue_name')
    .eq('id', guest.wedding_id)
    .single()

  if (weddingError || !wedding) {
    return null
  }

  return {
    guest: {
      full_name: guest.full_name,
      rsvp_status: guest.rsvp_status as RsvpPageData['guest']['rsvp_status'],
      adults_count: guest.adults_count,
      kids_count: guest.kids_count,
      notes: guest.notes,
      rsvp_responded_at: guest.rsvp_responded_at,
    },
    wedding: {
      bride_name: wedding.bride_name,
      groom_name: wedding.groom_name,
      wedding_date: wedding.wedding_date,
      venue_name: wedding.venue_name,
    },
  }
}

/**
 * Submits an RSVP response for a guest identified by token.
 * Validates input, updates the guest record, sets rsvp_responded_at.
 * Returns { success: true } or { success: false, error: string }.
 */
export async function submitRsvp(
  token: string,
  data: RsvpSubmission,
): Promise<{ success: true } | { success: false; error: string }> {
  // Validate token format
  if (!token || !UUID_REGEX.test(token)) {
    return { success: false, error: 'קישור לא תקף' }
  }

  // Validate rsvp_status
  if (!VALID_RSVP_STATUSES.includes(data.rsvp_status)) {
    return { success: false, error: 'סטטוס לא תקף' }
  }

  // Validate counts
  const adultsCount = Math.max(0, Math.floor(data.adults_count))
  const kidsCount = Math.max(0, Math.floor(data.kids_count))

  // If attending or maybe, must have at least 1 adult
  if (data.rsvp_status !== 'ביטל' && adultsCount < 1) {
    return { success: false, error: 'חייב לפחות מבוגר אחד' }
  }

  // Sanitize notes (trim, limit length)
  const notes = (data.notes || '').trim().slice(0, 500)

  const supabase = createServiceClient()

  const { error } = await supabase
    .from('guests')
    .update({
      rsvp_status: data.rsvp_status,
      adults_count: data.rsvp_status === 'ביטל' ? 0 : adultsCount,
      kids_count: data.rsvp_status === 'ביטל' ? 0 : kidsCount,
      notes: notes || null,
      rsvp_responded_at: new Date().toISOString(),
    })
    .eq('rsvp_token', token)

  if (error) {
    return { success: false, error: 'שגיאה בשמירה, נסו שוב' }
  }

  return { success: true }
}
