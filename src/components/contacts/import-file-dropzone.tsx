'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, FileSpreadsheet, Contact } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { parseVcfText } from '@/lib/vcf'
import { parseContactsCsv } from '@/lib/contacts-csv'
import { getContactsFromPicker, isContactPickerSupported } from '@/lib/contacts-api'
import type { ImportedContact } from '@/lib/types'

interface ImportFileDropzoneProps {
  onImport: (contacts: ImportedContact[]) => void
  compact?: boolean
}

export function ImportFileDropzone({ onImport, compact }: ImportFileDropzoneProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [hasContactPicker, setHasContactPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check if Contact Picker API is available (Android Chrome only)
    setHasContactPicker(isContactPickerSupported())
  }, [])

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)
      setLoading(true)

      try {
        const ext = file.name.toLowerCase().split('.').pop()

        let contacts: ImportedContact[]

        if (ext === 'vcf') {
          const text = await file.text()
          contacts = parseVcfText(text)
        } else if (ext === 'csv') {
          contacts = await parseContactsCsv(file)
        } else {
          setError('יש להעלות קובץ VCF או CSV בלבד')
          setLoading(false)
          return
        }

        if (contacts.length === 0) {
          setError('לא נמצאו אנשי קשר בקובץ')
        } else {
          onImport(contacts)
        }
      } catch {
        setError('שגיאה בקריאת הקובץ. ודאו שהקובץ תקין.')
      } finally {
        setLoading(false)
      }
    },
    [onImport]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleContactPicker = useCallback(async () => {
    setError(null)
    setLoading(true)

    try {
      const contacts = await getContactsFromPicker()
      if (contacts.length === 0) {
        setError('לא נמצאו אנשי קשר')
      } else {
        onImport(contacts)
      }
    } catch (err) {
      setError('שגיאה בגישה לאנשי קשר. ודאו שהטלפון מאפשר גישה.')
    } finally {
      setLoading(false)
    }
  }, [onImport])

  if (compact) {
    return (
      <>
        {hasContactPicker && (
          <Button
            size="sm"
            onClick={handleContactPicker}
            disabled={loading}
          >
            <Contact className="h-4 w-4 ml-1" />
            {loading ? 'מייבא...' : 'גישה לאנשי קשר'}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          <Upload className="h-4 w-4 ml-1" />
          {loading ? 'מייבא...' : 'ייבא קובץ'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".vcf,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors w-full max-w-md ${
          dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'
        }`}
      >
        <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">ייבוא אנשי קשר</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {hasContactPicker
            ? 'בחרו: גישה ישירה לאנשי קשר או העלו קובץ'
            : 'גררו לכאן קובץ VCF (מהטלפון) או CSV (מ-Google Contacts)'}
        </p>
        <div className="flex gap-2 flex-col sm:flex-row justify-center">
          {hasContactPicker && (
            <Button onClick={handleContactPicker} disabled={loading}>
              <Contact className="h-4 w-4 ml-2" />
              {loading ? 'מייבא...' : 'גישה לאנשי קשר'}
            </Button>
          )}
          <Button
            variant={hasContactPicker ? 'outline' : 'default'}
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <Upload className="h-4 w-4 ml-2" />
            {loading ? 'מייבא...' : 'בחרו קובץ'}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".vcf,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="text-xs text-muted-foreground mt-4">
          {hasContactPicker
            ? 'Android: לחצו על "גישה לאנשי קשר". iPhone: הוסיפו לשורת הבית ושתפו מהקונטקטים.'
            : 'תומך בקבצי VCF (iPhone, Android) ו-CSV (Google Contacts)'}
        </p>
      </div>
      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
    </div>
  )
}
