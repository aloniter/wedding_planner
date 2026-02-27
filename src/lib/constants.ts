import type { RsvpStatus, GuestSide, VendorCategory } from './types'

export const RSVP_STATUSES: { value: RsvpStatus; label: string; emoji: string }[] = [
  { value: 'ממתין', label: 'ממתין', emoji: '⏳' },
  { value: 'אישר', label: 'אישר', emoji: '✅' },
  { value: 'ביטל', label: 'ביטל', emoji: '❌' },
]

export const GUEST_SIDES: { value: GuestSide; label: string }[] = [
  { value: 'חתן', label: 'צד חתן' },
  { value: 'כלה', label: 'צד כלה' },
  { value: 'משותף', label: 'משותף' },
]

export const VENDOR_CATEGORIES: { value: VendorCategory; label: string; emoji: string }[] = [
  { value: 'אולם', label: 'אולם', emoji: '🏛️' },
  { value: 'DJ/להקה', label: 'DJ/להקה', emoji: '🎵' },
  { value: 'צלם/וידאו', label: 'צלם/וידאו', emoji: '📷' },
  { value: 'קייטרינג', label: 'קייטרינג', emoji: '🍽️' },
  { value: 'פרחים', label: 'פרחים', emoji: '💐' },
  { value: 'הסעות', label: 'הסעות', emoji: '🚌' },
  { value: 'שמלה/חליפה', label: 'שמלה/חליפה', emoji: '👗' },
  { value: 'אחר', label: 'אחר', emoji: '📦' },
]
