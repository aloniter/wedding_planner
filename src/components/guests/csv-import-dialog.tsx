'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react'
import { parseGuestImportFile, type GuestImportParseResult } from '@/lib/csv'
import { downloadGuestTemplate } from '@/lib/guest-template'
import type { GuestInsert } from '@/lib/types'

interface CsvImportDialogProps {
  weddingId: string
  groomName?: string | null
  brideName?: string | null
  onImport: (guests: GuestInsert[]) => void | Promise<unknown>
}

export function CsvImportDialog({
  weddingId,
  groomName,
  brideName,
  onImport,
}: CsvImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [parseResult, setParseResult] = useState<GuestImportParseResult | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = () => {
    setParseResult(null)
    setMessage(null)
    setLoading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setMessage(null)
    setParseResult(null)

    try {
      const result = await parseGuestImportFile(file, weddingId, {
        groomName,
        brideName,
      })

      setParseResult(result)

      if (result.guests.length === 0 && result.errors.length === 0) {
        setMessage('לא נמצאו אורחים בקובץ. מלאו את התבנית הרשמית והעלו שוב.')
      } else if (result.errors.length > 0) {
        setMessage(`נמצאו ${result.errors.length} שורות עם שגיאות. תקנו את הקובץ והעלו שוב.`)
      }
    } catch {
      setMessage('שגיאה בקריאת הקובץ. העלו קובץ Excel תקין לפי התבנית הרשמית.')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = () => {
    if (!parseResult || parseResult.errors.length > 0 || parseResult.guests.length === 0) return

    void onImport(parseResult.guests)
    resetState()
    setOpen(false)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      resetState()
    }
  }

  const handlePickAnotherFile = () => {
    setParseResult(null)
    setMessage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const showErrors = Boolean(parseResult && parseResult.errors.length > 0)
  const showPreview = Boolean(parseResult && parseResult.errors.length === 0 && parseResult.guests.length > 0)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 ml-1" />
          ייבוא אורחים
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>ייבוא אורחים מקובץ Excel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!showErrors && !showPreview && (
            <>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  העלו קובץ Excel לפי תבנית האורחים הרשמית. לצורכי תאימות נתמכים גם XLS ו-CSV.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-muted-foreground file:ml-2 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void downloadGuestTemplate()}
                className="text-xs"
              >
                <Download className="h-3 w-3 ml-1" />
                הורד את תבנית האורחים הרשמית
              </Button>
              {message && <p className="text-sm text-red-600">{message}</p>}
              {loading && <p className="text-sm text-muted-foreground">מעבד את הקובץ...</p>}
            </>
          )}

          {showErrors && parseResult && (
            <>
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">הקובץ לא יובא עד שכל השגיאות יתוקנו.</p>
                  {message && <p>{message}</p>}
                </div>
              </div>
              <div className="max-h-64 overflow-auto border rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-right p-2 font-medium">שורה</th>
                      <th className="text-right p-2 font-medium">בעיה</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseResult.errors.map((error) => (
                      <tr key={error.rowNumber} className="border-t align-top">
                        <td className="p-2 font-medium">{error.rowNumber}</td>
                        <td className="p-2">{error.messages.join(' · ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parseResult.guests.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  זוהו גם {parseResult.guests.length} שורות תקינות, אבל הייבוא חסום עד לתיקון כל השגיאות.
                </p>
              )}
              <Button variant="outline" onClick={handlePickAnotherFile}>
                בחר קובץ אחר
              </Button>
            </>
          )}

          {showPreview && parseResult && (
            <>
              <p className="text-sm font-medium">
                נמצאו {parseResult.guests.length} אורחים מוכנים לייבוא:
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
                    {parseResult.guests.slice(0, 20).map((guest, index) => (
                      <tr key={`${guest.full_name}-${index}`} className="border-t">
                        <td className="p-2">{guest.full_name}</td>
                        <td className="p-2" dir="ltr">{guest.phone || '—'}</td>
                        <td className="p-2">{guest.side}</td>
                      </tr>
                    ))}
                    {parseResult.guests.length > 20 && (
                      <tr className="border-t">
                        <td colSpan={3} className="p-2 text-center text-muted-foreground">
                          ועוד {parseResult.guests.length - 20} אורחים...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleImport} className="flex-1">
                  ייבא {parseResult.guests.length} אורחים
                </Button>
                <Button variant="outline" onClick={handlePickAnotherFile}>
                  בחר קובץ אחר
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
