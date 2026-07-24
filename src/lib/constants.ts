import type { RsvpStatus, RsvpPublicStatus, GuestSide, VendorCategory } from './types'

export const RSVP_STATUSES: { value: RsvpStatus; label: string; emoji: string }[] = [
  { value: 'ממתין', label: 'ממתין', emoji: '⏳' },
  { value: 'אישר', label: 'אישר', emoji: '✅' },
  { value: 'אולי', label: 'אולי', emoji: '🤔' },
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

export const CONTACT_GROUP_PRESETS = [
  'משפחה',
  'חברים',
  'עבודה',
  'שכנים',
  'אחר',
] as const

export type ContactGroupPreset = typeof CONTACT_GROUP_PRESETS[number]

export const DEFAULT_GUEST_CATEGORIES = [
  'משפחה',
  'חברים',
  'עבודה',
  'שכנים',
  'צבא',
  'אחר',
] as const

// Public-facing RSVP statuses (excludes 'ממתין' — guests can't set pending)
export const RSVP_PUBLIC_STATUSES: { value: RsvpPublicStatus; label: string; emoji: string }[] = [
  { value: 'אישר', label: 'מגיעים!', emoji: '🎉' },
  { value: 'אולי', label: 'אולי', emoji: '🤔' },
  { value: 'ביטל', label: 'לא מגיעים', emoji: '😔' },
]

// RSVP page Hebrew strings
export const RSVP_STRINGS = {
  greeting: (name: string) => `שלום ${name}!`,
  invitedTo: (bride: string, groom: string) => `אתם מוזמנים לחתונה של ${bride} ו${groom}!`,
  dateLabel: 'תאריך',
  venueLabel: 'מקום',
  attendanceQuestion: 'האם תגיעו?',
  adultsLabel: 'מבוגרים',
  kidsLabel: 'ילדים',
  notesLabel: 'הערות',
  notesPlaceholder: 'רוצים להוסיף משהו?',
  submitButton: 'שליחה',
  updatingButton: 'שומר...',
  updateNote: 'ניתן לעדכן את התשובה בכל עת',
  alreadyResponded: 'כבר הגבתם — ניתן לעדכן',
  thankYouConfirmed: 'תודה! נתראה בחתונה! 🎉',
  thankYouDeclined: 'תודה על העדכון, נתגעגע! 💙',
  thankYouMaybe: 'תודה! נשמח לשמוע ממכם כשתדעו 🤞',
  invalidLink: 'הקישור לא תקף',
  invalidLinkDescription: 'נראה שהקישור שגוי או שפג תוקפו. פנו לזוג לקבלת קישור חדש.',
  errorGeneric: 'משהו השתבש, ננסה שוב',
  addToCalendar: 'הוסיפו ליומן',
  googleCalendar: 'Google Calendar',
  downloadIcs: 'Apple Calendar',
} as const

// Default WhatsApp invitation message template.
// Supports {{guest_name}}, {{bride_name}}, {{groom_name}}, {{rsvp_link}} tokens — see renderInviteMessage().
export const DEFAULT_INVITE_TEMPLATE_BODY =
  'שלום {{guest_name}}! 💍\nאתם מוזמנים לחתונה של {{bride_name}} ו{{groom_name}}!\nלאישור הגעה:\n{{rsvp_link}}'

