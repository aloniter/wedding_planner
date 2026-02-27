'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Upload, Download, FileSpreadsheet } from 'lucide-react'
import { parseCsvFile, downloadCsvTemplate } from '@/lib/csv'
import type { GuestInsert } from '@/lib/types'

interface CsvImportDialogProps {
  weddingId: string
  onImport: (guests: GuestInsert[]) => void
}

export function CsvImportDialog({ weddingId, onImport }: CsvImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [parsedGuests, setParsedGuests] = useState<GuestInsert[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setLoading(true)

    try {
      const guests = await parseCsvFile(file, weddingId)
      if (guests.length === 0) {
        setError('לא נמצאו אורחים בקובץ. ודאו שיש עמודת "שם".')
      } else {
        setParsedGuests(guests)
      }
    } catch {
      setError('שגיאה בקריאת הקובץ. ודאו שזהו קובץ CSV תקין.')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = () => {
    onImport(parsedGuests)
    setParsedGuests([])
    setOpen(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setParsedGuests([])
      setError(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 ml-1" />
          ייבוא CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>ייבוא אורחים מ-CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {parsedGuests.length === 0 ? (
            <>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  העלו קובץ CSV עם עמודות: שם, טלפון, צד
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-muted-foreground file:ml-2 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadCsvTemplate}
                className="text-xs"
              >
                <Download className="h-3 w-3 ml-1" />
                הורד קובץ לדוגמה
              </Button>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {loading && <p className="text-sm text-muted-foreground">מעבד את הקובץ...</p>}
            </>
          ) : (
            <>
              <p className="text-sm font-medium">
                נמצאו {parsedGuests.length} אורחים:
              </p>
              <div className="max-h-60 overflow-auto border rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-right p-2 font-medium">שם</th>
                      <th className="text-right p-2 font-medium">טלפון</th>
                      <th className="text-right p-2 font-medium">צד</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedGuests.slice(0, 20).map((g, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{g.full_name}</td>
                        <td className="p-2" dir="ltr">{g.phone || '—'}</td>
                        <td className="p-2">{g.side}</td>
                      </tr>
                    ))}
                    {parsedGuests.length > 20 && (
                      <tr className="border-t">
                        <td colSpan={3} className="p-2 text-center text-muted-foreground">
                          ועוד {parsedGuests.length - 20} אורחים...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleImport} className="flex-1">
                  ייבא {parsedGuests.length} אורחים
                </Button>
                <Button variant="outline" onClick={() => {
                  setParsedGuests([])
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}>
                  חזור
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
