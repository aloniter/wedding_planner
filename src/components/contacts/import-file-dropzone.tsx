'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { parseVcfText } from '@/lib/vcf'
import { parseContactsCsv } from '@/lib/contacts-csv'
import type { ImportedContact } from '@/lib/types'

interface ImportFileDropzoneProps {
  onImport: (contacts: ImportedContact[]) => void
  compact?: boolean
}

export function ImportFileDropzone({ onImport, compact }: ImportFileDropzoneProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  if (compact) {
    return (
      <>
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
          גררו לכאן קובץ VCF (מהטלפון) או CSV (מ-Google Contacts)
        </p>
        <Button onClick={() => fileInputRef.current?.click()} disabled={loading}>
          <Upload className="h-4 w-4 ml-2" />
          {loading ? 'מייבא...' : 'בחרו קובץ'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".vcf,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="text-xs text-muted-foreground mt-4">
          תומך בקבצי VCF (iPhone, Android) ו-CSV (Google Contacts)
        </p>
      </div>
      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
    </div>
  )
}
