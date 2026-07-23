'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, Replace } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { uploadWeddingImage, deleteWeddingImage } from '@/lib/supabase/storage'
import type { Wedding, WeddingUpdate } from '@/lib/types'

interface Props {
  wedding: Wedding
  onUpdate: (updates: WeddingUpdate) => void
}

export function SaveTheDateUpload({ wedding, onUpdate }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const imageUrl = wedding.save_the_date_image_url

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setUploading(true)
    try {
      const url = await uploadWeddingImage(wedding.id, file)
      onUpdate({ save_the_date_image_url: url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהעלאת התמונה')
    } finally {
      setUploading(false)
    }
  }, [wedding.id, onUpdate])

  const handleRemove = useCallback(async () => {
    if (!imageUrl) return
    setError(null)
    setUploading(true)
    try {
      await deleteWeddingImage(imageUrl)
      onUpdate({ save_the_date_image_url: null })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה במחיקת התמונה')
    } finally {
      setUploading(false)
    }
  }, [imageUrl, onUpdate])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs">Save the Date תמונת</Label>

      {imageUrl ? (
        <div className="relative rounded-lg border overflow-hidden bg-muted/30">
          <img
            src={imageUrl}
            alt="Save the Date"
            className="w-full max-h-48 object-contain"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
          <div className="flex gap-1 p-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1 flex-1"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Replace className="h-3 w-3" />
              החלף
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1 flex-1 text-red-600 hover:text-red-700"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="h-3 w-3" />
              הסר
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
            dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
          }`}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              מעלה תמונה...
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                גררו לכאן או לחצו להעלאת תמונת Save the Date
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
