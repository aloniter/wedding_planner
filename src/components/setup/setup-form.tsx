'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useWedding } from '@/hooks/use-wedding'

export function SetupForm() {
  const router = useRouter()
  const { createWedding } = useWedding()
  const [groomName, setGroomName] = useState('')
  const [brideName, setBrideName] = useState('')
  const [weddingDate, setWeddingDate] = useState('')
  const [venueName, setVenueName] = useState('')
  const [totalBudget, setTotalBudget] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groomName.trim() || !brideName.trim() || submitting) return

    setSubmitting(true)
    setError(null)
    const result = await createWedding({
      bride_name: brideName.trim(),
      groom_name: groomName.trim(),
      wedding_date: weddingDate || null,
      venue_name: venueName.trim() || null,
      total_budget: parseInt(totalBudget) || 0,
      estimated_guests: null,
    })

    if (result) {
      router.push('/')
    } else {
      setError('שגיאה ביצירת החתונה. אנא נסו שוב.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">חתונה שלנו 💍</CardTitle>
          <CardDescription className="text-base">
            בואו נתחיל לתכנן את החתונה המושלמת
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="groom">שם החתן</Label>
                <Input
                  id="groom"
                  value={groomName}
                  onChange={e => setGroomName(e.target.value)}
                  placeholder="דניאל"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bride">שם הכלה</Label>
                <Input
                  id="bride"
                  value={brideName}
                  onChange={e => setBrideName(e.target.value)}
                  placeholder="נועה"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">תאריך החתונה</Label>
              <Input
                id="date"
                type="date"
                value={weddingDate}
                onChange={e => setWeddingDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">שם האולם</Label>
              <Input
                id="venue"
                value={venueName}
                onChange={e => setVenueName(e.target.value)}
                placeholder="אולם גן העיר"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">תקציב כולל (₪)</Label>
              <Input
                id="budget"
                type="number"
                value={totalBudget}
                onChange={e => setTotalBudget(e.target.value)}
                placeholder="150000"
                min="0"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button type="submit" className="w-full text-lg py-6" size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin ml-2" />
                  יוצרים את החתונה...
                </>
              ) : (
                'יאללה, מתחילים! 🎊'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
