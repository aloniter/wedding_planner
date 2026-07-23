import { createClient } from './client'
import type { VenueAttachment } from '@/lib/types'

const BUCKET = 'venue-attachments'
const WEDDING_IMAGES_BUCKET = 'wedding-images'
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
const IMAGE_ONLY_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

export async function uploadVenueAttachment(
  venueId: string,
  weddingId: string,
  file: File,
): Promise<VenueAttachment> {
  if (file.size > MAX_SIZE) {
    throw new Error('הקובץ גדול מדי. הגודל המקסימלי הוא 10MB')
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('סוג קובץ לא נתמך. ניתן להעלות תמונות או PDF בלבד')
  }

  const supabase = createClient()
  const uuid = crypto.randomUUID()
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const filePath = `${weddingId}/${venueId}/${uuid}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file)

  if (uploadError) throw new Error(`שגיאה בהעלאת הקובץ: ${uploadError.message}`)

  const { data, error: dbError } = await supabase
    .from('venue_attachments')
    .insert({
      venue_id: venueId,
      file_name: file.name,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
    })
    .select()
    .single()

  if (dbError) {
    await supabase.storage.from(BUCKET).remove([filePath])
    throw new Error(`שגיאה בשמירת הקובץ: ${dbError.message}`)
  }

  return data as VenueAttachment
}

export async function deleteVenueAttachment(attachment: VenueAttachment): Promise<void> {
  const supabase = createClient()

  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove([attachment.file_path])

  if (storageError) throw new Error(`שגיאה במחיקת הקובץ: ${storageError.message}`)

  const { error: dbError } = await supabase
    .from('venue_attachments')
    .delete()
    .eq('id', attachment.id)

  if (dbError) throw new Error(`שגיאה במחיקת הרשומה: ${dbError.message}`)
}

export function getAttachmentUrl(filePath: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}

// --- Wedding Images (Save the Date, etc.) ---

export async function uploadWeddingImage(weddingId: string, file: File): Promise<string> {
  if (file.size > MAX_SIZE) {
    throw new Error('הקובץ גדול מדי. הגודל המקסימלי הוא 10MB')
  }
  if (!IMAGE_ONLY_TYPES.includes(file.type)) {
    throw new Error('סוג קובץ לא נתמך. ניתן להעלות תמונות בלבד (JPEG, PNG, WebP, HEIC)')
  }

  const supabase = createClient()
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filePath = `${weddingId}/save-the-date.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(WEDDING_IMAGES_BUCKET)
    .upload(filePath, file, { upsert: true })

  if (uploadError) throw new Error(`שגיאה בהעלאת התמונה: ${uploadError.message}`)

  const { data } = supabase.storage.from(WEDDING_IMAGES_BUCKET).getPublicUrl(filePath)
  // Append cache-buster so replaced images aren't stale
  return `${data.publicUrl}?t=${Date.now()}`
}

export async function deleteWeddingImage(imageUrl: string): Promise<void> {
  const supabase = createClient()
  // Extract file path from the public URL
  const bucketSegment = `/storage/v1/object/public/${WEDDING_IMAGES_BUCKET}/`
  const idx = imageUrl.indexOf(bucketSegment)
  if (idx === -1) throw new Error('כתובת תמונה לא תקינה')
  let filePath = imageUrl.substring(idx + bucketSegment.length)
  // Strip query params (cache buster)
  const qIdx = filePath.indexOf('?')
  if (qIdx !== -1) filePath = filePath.substring(0, qIdx)

  const { error } = await supabase.storage
    .from(WEDDING_IMAGES_BUCKET)
    .remove([filePath])

  if (error) throw new Error(`שגיאה במחיקת התמונה: ${error.message}`)
}
