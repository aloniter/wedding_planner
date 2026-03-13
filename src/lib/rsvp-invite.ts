import { RSVP_WHATSAPP_TEMPLATE } from '@/lib/constants'
import type { Guest, Wedding } from '@/lib/types'

/**
 * Generate the public RSVP URL for a guest.
 */
export function generateRsvpUrl(token: string): string {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${baseUrl}/rsvp/${token}`
}

/**
 * Generate a WhatsApp invitation message for a guest.
 */
export function generateWhatsAppMessage(guest: Guest, wedding: Wedding): string {
  const rsvpUrl = generateRsvpUrl(guest.rsvp_token)
  return RSVP_WHATSAPP_TEMPLATE(guest.full_name, wedding.bride_name, wedding.groom_name, rsvpUrl)
}

/**
 * Format a phone number for WhatsApp deep link (Israeli format).
 * Converts 05X-XXXXXXX to 9725XXXXXXXXX.
 */
function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/[\s\-\(\)\.+]/g, '')
  // Already international format
  if (digits.startsWith('972')) return digits
  // Israeli local format: 05X...
  if (digits.startsWith('0')) return `972${digits.slice(1)}`
  return digits
}

/**
 * Generate a WhatsApp deep link that opens a chat with the guest
 * and pre-fills the invitation message.
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone)
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
}

/**
 * Copy text to clipboard. Returns true on success.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
