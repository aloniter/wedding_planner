'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Loader2, CheckCircle2 } from 'lucide-react'
import { hasPendingMigration, getLocalDataCounts, migrateLocalDataToSupabase } from '@/lib/migrate-local-data'

interface MigrationBannerProps {
  weddingId: string
}

export function MigrationBanner({ weddingId }: MigrationBannerProps) {
  const [show, setShow] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [done, setDone] = useState(false)
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (hasPendingMigration(weddingId)) {
      setShow(true)
      setCounts(getLocalDataCounts(weddingId))
    }
  }, [weddingId])

  if (!show) return null

  const handleMigrate = async () => {
    setMigrating(true)
    const result = await migrateLocalDataToSupabase(weddingId)
    setMigrating(false)

    if (result.migrated) {
      setCounts(result.counts)
      setDone(true)
      setTimeout(() => setShow(false), 3000)
    } else {
      setShow(false)
    }
  }

  const totalItems = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="py-3 flex items-center justify-between gap-4">
        {done ? (
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">
              הנתונים הועלו בהצלחה! ({totalItems} פריטים)
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              <span className="text-sm">
                מצאנו {totalItems} פריטים מקומיים
                {counts.guests > 0 && ` (${counts.guests} אורחים)`}
                . האם להעלות אותם?
              </span>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                onClick={handleMigrate}
                disabled={migrating}
              >
                {migrating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'העלה נתונים'
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShow(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
