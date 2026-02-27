export type RsvpStatus = 'ממתין' | 'אישר' | 'ביטל'
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
  bride_name: string
  groom_name: string
  wedding_date: string | null
  venue_name: string | null
  total_budget: number
  created_at: string
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
  notes: string | null
  created_at: string
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
}

export type GuestInsert = Omit<Guest, 'id' | 'created_at'>
export type GuestUpdate = Partial<Omit<Guest, 'id' | 'wedding_id' | 'created_at'>>

export type VendorInsert = Omit<Vendor, 'id' | 'created_at'>
export type VendorUpdate = Partial<Omit<Vendor, 'id' | 'wedding_id' | 'created_at'>>

export type WeddingUpdate = Partial<Omit<Wedding, 'id' | 'created_at'>>

export interface GuestStats {
  total: number
  confirmed: number
  declined: number
  pending: number
  totalAdults: number
  totalKids: number
}
