export type RsvpStatus = 'ממתין' | 'אישר' | 'ביטל' | 'אולי'
export type GuestSide = 'חתן' | 'כלה' | 'משותף'
export type VendorCategory =
  | 'אולם'
  | 'DJ/להקה'
  | 'צלם/וידאו'
  | 'קייטרינג'
  | 'פרחים'
  | 'הסעות'
  | 'שמלה/חליפה'
  | 'אחר'

export interface Wedding {
  id: string
  slug: string
  bride_name: string
  groom_name: string
  wedding_date: string | null
  venue_name: string | null
  total_budget: number
  estimated_guests: number | null
  created_at: string
  updated_at: string
}

export interface Guest {
  id: string
  wedding_id: string
  full_name: string
  phone: string | null
  side: GuestSide
  group_name: string | null
  adults_count: number
  kids_count: number
  rsvp_status: RsvpStatus
  gift_amount: number | null
  table_id: string | null
  notes: string | null
  rsvp_token: string
  invitation_sent_at: string | null
  rsvp_responded_at: string | null
  created_at: string
  updated_at: string
}

export interface Vendor {
  id: string
  wedding_id: string
  name: string
  category: VendorCategory
  contact_phone: string | null
  total_price: number
  deposit_paid: number
  notes: string | null
  created_at: string
  updated_at: string
}

export type GuestInsert = Omit<Guest, 'id' | 'created_at' | 'updated_at' | 'rsvp_token' | 'invitation_sent_at' | 'rsvp_responded_at'>
export type GuestUpdate = Partial<Omit<Guest, 'id' | 'wedding_id' | 'created_at' | 'updated_at' | 'rsvp_token'>>

export type VendorInsert = Omit<Vendor, 'id' | 'created_at' | 'updated_at'>
export type VendorUpdate = Partial<Omit<Vendor, 'id' | 'wedding_id' | 'created_at' | 'updated_at'>>

export type WeddingUpdate = Partial<Omit<Wedding, 'id' | 'slug' | 'created_at' | 'updated_at'>>

export type InvitationFilter = 'all' | 'sent' | 'not_sent'

export interface GuestStats {
  total: number
  confirmed: number
  declined: number
  pending: number
  maybe: number
  totalAdults: number
  totalKids: number
  totalGiftAmount: number
  giftCount: number
  invitationsSent: number
  responsesReceived: number
}

// Table planning
export interface WeddingTable {
  id: string
  wedding_id: string
  table_number: number
  label: string | null
  seat_capacity: number
  created_at: string
  updated_at: string
}

export type WeddingTableInsert = Omit<WeddingTable, 'id' | 'created_at' | 'updated_at'>
export type WeddingTableUpdate = Partial<Omit<WeddingTable, 'id' | 'wedding_id' | 'created_at' | 'updated_at'>>

// Custom guest categories
export interface GuestCategory {
  id: string
  wedding_id: string
  name: string
  color: string | null
  created_at: string
  updated_at: string
}

export type GuestCategoryInsert = Omit<GuestCategory, 'id' | 'created_at' | 'updated_at'>

// Project members for shared access
export interface ProjectMember {
  id: string
  wedding_id: string
  user_id: string | null
  role: 'owner' | 'partner'
  invited_email: string | null
  joined_at: string | null
  created_at: string
}

// Venue tracker
export type VenueStatus = 'בבדיקה' | 'נקבעה פגישה' | 'אהבנו' | 'לא מתאים' | 'נבחר'

export interface Venue {
  id: string
  wedding_id: string
  name: string
  location: string | null
  phone: string | null
  contact_name: string | null
  website: string | null
  capacity: number | null
  price_per_person: number | null
  minimum_spend: number | null
  available_dates: string | null
  status: VenueStatus
  rating: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type VenueInsert = Omit<Venue, 'id' | 'created_at' | 'updated_at'>
export type VenueUpdate = Partial<Omit<Venue, 'id' | 'wedding_id' | 'created_at' | 'updated_at'>>

export interface VenueAttachment {
  id: string
  venue_id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  created_at: string
}

// Public RSVP types (used by server actions — never expose internal fields)
export type RsvpPublicStatus = 'אישר' | 'ביטל' | 'אולי'

export interface PublicRsvpGuest {
  full_name: string
  rsvp_status: RsvpStatus
  adults_count: number
  kids_count: number
  notes: string | null
  rsvp_responded_at: string | null
}

export interface PublicRsvpWedding {
  bride_name: string
  groom_name: string
  wedding_date: string | null
  venue_name: string | null
}

export interface RsvpPageData {
  guest: PublicRsvpGuest
  wedding: PublicRsvpWedding
}

export interface RsvpSubmission {
  rsvp_status: RsvpPublicStatus
  adults_count: number
  kids_count: number
  notes: string
}

// Sorting
export type GuestSortField = 'full_name' | 'group_name' | 'gift_amount' | 'rsvp_status' | 'created_at'
export type SortDirection = 'asc' | 'desc'

// Imported phone contacts (workspace model, separate from guests)
export interface ImportedContact {
  id: string
  first_name: string
  last_name: string
  full_name: string
  phone: string | null
  email: string | null
  group_tag: string | null
  source: 'vcf' | 'google_csv'
  imported_at: string
}

export type ImportedContactUpdate = Partial<Pick<ImportedContact,
  'first_name' | 'last_name' | 'full_name' | 'phone' | 'email' | 'group_tag'
>>
