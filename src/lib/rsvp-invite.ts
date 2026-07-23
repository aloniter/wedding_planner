import { RSVP_WHATSAPP_TEMPLATE } from '@/lib/constants'
import type { Guest, Wedding } from '@/lib/types'

export interface WhatsAppInvitePayload {
  caption: string
  rsvpUrl: string
  imageUrl: string | null
}

export type ShareImageStatus = 'shared' | 'cancelled' | 'unsupported' | 'failed'

export interface ShareImageResult {
  status: ShareImageStatus
  captionCopied: boolean
}

export type NativeFileShareSupportReason = 'supported' | 'insecure-context' | 'not-mobile' | 'missing-api'

export interface NativeFileShareSupport {
  supported: boolean
  reason: NativeFileShareSupportReason
}

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
 * Build the invite payload used by the WhatsApp send flow.
 */
export function getWhatsAppInvitePayload(guest: Guest, wedding: Wedding): WhatsAppInvitePayload {
  const rsvpUrl = generateRsvpUrl(guest.rsvp_token)
  return {
    caption: RSVP_WHATSAPP_TEMPLATE(guest.full_name, wedding.bride_name, wedding.groom_name, rsvpUrl),
    rsvpUrl,
    imageUrl: wedding.save_the_date_image_url,
  }
}

/**
 * Generate a WhatsApp invitation message for a guest.
 */
export function generateWhatsAppMessage(guest: Guest, wedding: Wedding): string {
  return getWhatsAppInvitePayload(guest, wedding).caption
}

/**
 * Check if device is mobile (touch-based).
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Check if the browser supports sharing files via Web Share API.
 * Only reliable on mobile — desktop macOS share sheet doesn't include WhatsApp.
 */
export function supportsNativeFileShare(): boolean {
  return getNativeFileShareSupport().supported
}

/**
 * Explain why native file sharing is or is not available.
 */
export function getNativeFileShareSupport(): NativeFileShareSupport {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { supported: false, reason: 'missing-api' }
  }

  if (!window.isSecureContext) {
    return { supported: false, reason: 'insecure-context' }
  }

  if (!isMobileDevice()) {
    return { supported: false, reason: 'not-mobile' }
  }

  if (typeof navigator.canShare !== 'function' || typeof navigator.share !== 'function') {
    return { supported: false, reason: 'missing-api' }
  }

  return { supported: true, reason: 'supported' }
}

/**
 * Share a prefetched image file + caption via the Web Share API.
 */
export async function shareImageViaWhatsApp(file: File, caption: string): Promise<ShareImageResult> {
  if (!supportsNativeFileShare()) {
    return { status: 'unsupported', captionCopied: false }
  }

  if (!navigator.canShare({ files: [file] })) {
    return { status: 'unsupported', captionCopied: false }
  }

  // Start the clipboard write without awaiting it so share() keeps the original user activation.
  const copyPromise = copyToClipboard(caption)

  try {
    await navigator.share({ files: [file], text: caption })
    const captionCopied = await copyPromise
    return { status: 'shared', captionCopied }
  } catch (err) {
    const captionCopied = await copyPromise.catch(() => false)
    if (isShareCancelled(err)) {
      return { status: 'cancelled', captionCopied }
    }
    return { status: 'failed', captionCopied }
  }
}

/**
 * Format a phone number for WhatsApp deep link (Israeli format).
 * Converts 05X-XXXXXXX to 9725XXXXXXXXX.
 */
function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/[\s\-\(\)\.+]/g, '')
  if (digits.startsWith('972')) return digits
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
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      return false
    }
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * Fetch the save-the-date image in advance so share() can run immediately on tap.
 */
export async function fetchImageAsFile(imageUrl: string): Promise<File> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(imageUrl, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    const blob = await response.blob()
    const ext = getImageExtension(imageUrl, blob.type)
    return new File([blob], `save-the-date.${ext}`, { type: blob.type || 'image/jpeg' })
  } finally {
    clearTimeout(timeout)
  }
}

function getImageExtension(imageUrl: string, mimeType: string): string {
  const urlExt = imageUrl.split('.').pop()?.split('?')[0]?.toLowerCase()
  if (urlExt) return urlExt

  switch (mimeType) {
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    case 'image/heic':
      return 'heic'
    case 'image/heif':
      return 'heif'
    default:
      return 'jpg'
  }
}

function isShareCancelled(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  if (err.name === 'AbortError') return true
  return err.message.toLowerCase().includes('cancel')
}
