'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, FileText, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVenueAttachments } from '@/hooks/use-venue-attachments'
import { getAttachmentUrl } from '@/lib/supabase/storage'
import type { VenueAttachment } from '@/lib/types'

interface Props {
  venueId: string
  weddingId: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(fileType: string): boolean {
  return fileType.startsWith('image/')
}

function AttachmentItem({ attachment, onRemove }: { attachment: VenueAttachment; onRemove: (id: string) => void }) {
  const [removing, setRemoving] = useState(false)
  const url = getAttachmentUrl(attachment.file_path)

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setRemoving(true)
    await onRemove(attachment.id)
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors overflow-hidden"
    >
      {isImage(attachment.file_type) ? (
        <div className="aspect-square w-full">
          <img
            src={url}
            alt={attachment.file_name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square w-full flex flex-col items-center justify-center gap-1 p-2">
          <FileText className="h-8 w-8 text-red-500" />
          <span className="text-[10px] text-muted-foreground text-center leading-tight line-clamp-2 break-all">
            {attachment.file_name}
          </span>
        </div>
      )}
      <button
        onClick={handleRemove}
        disabled={removing}
        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
      >
        {removing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
      </button>
    </a>
  )
}

export function VenueAttachments({ venueId, weddingId }: Props) {
  const { attachments, uploading, upload, remove } = useVenueAttachments(venueId, weddingId)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError(null)
    for (const file of Array.from(files)) {
      try {
        await upload(file)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'שגיאה בהעלאת הקובץ')
      }
    }
  }, [upload])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) handleFiles(files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
          dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            מעלה קובץ...
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              גררו לכאן או לחצו להעלאת תמונות / PDF
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Attachment grid */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {attachments.map(a => (
            <AttachmentItem key={a.id} attachment={a} onRemove={remove} />
          ))}
        </div>
      )}
    </div>
  )
}

export function VenueAttachmentsCompact({ venueId, weddingId }: Props) {
  const { attachments } = useVenueAttachments(venueId, weddingId)

  if (attachments.length === 0) return null

  const images = attachments.filter(a => isImage(a.file_type))
  const pdfs = attachments.filter(a => !isImage(a.file_type))

  return (
    <div className="space-y-1.5">
      {images.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {images.slice(0, 4).map(a => (
            <a
              key={a.id}
              href={getAttachmentUrl(a.file_path)}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-10 h-10 rounded border overflow-hidden hover:ring-2 ring-primary transition-all"
            >
              <img
                src={getAttachmentUrl(a.file_path)}
                alt={a.file_name}
                className="w-full h-full object-cover"
              />
            </a>
          ))}
          {images.length > 4 && (
            <span className="flex items-center text-xs text-muted-foreground">+{images.length - 4}</span>
          )}
        </div>
      )}
      {pdfs.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {pdfs.map(a => (
            <a
              key={a.id}
              href={getAttachmentUrl(a.file_path)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <FileText className="h-3 w-3 text-red-500 flex-shrink-0" />
              <span className="truncate max-w-[100px]">{a.file_name}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
