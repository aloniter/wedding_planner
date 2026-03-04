import { createClient } from './client'
import type { VenueAttachment } from '@/lib/types'

const BUCKET = 'venue-attachments'
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']

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
