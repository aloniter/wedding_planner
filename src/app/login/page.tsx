'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { createClient, getSupabaseConfig } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Mail, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If already authenticated, redirect to home
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/')
    }
  }, [authLoading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || loading) return

    setLoading(true)
    setError(null)

    if (!getSupabaseConfig()) {
      setError('Supabase is not configured')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError('שגיאה בשליחת הקישור. אנא נסו שוב.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">בדקו את המייל</CardTitle>
            <CardDescription className="text-base">
              שלחנו קישור התחברות אל <strong dir="ltr">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              לחצו על הקישור במייל כדי להתחבר. הקישור תקף ל-60 דקות.
            </p>
            <Button
              variant="ghost"
              onClick={() => { setSent(false); setEmail('') }}
              className="text-sm"
            >
              שליחה מחדש או שינוי כתובת
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">חתונה שלנו</CardTitle>
          <CardDescription className="text-base">
            התחברו עם המייל שלכם כדי לנהל את החתונה
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">כתובת אימייל</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                dir="ltr"
                required
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button type="submit" className="w-full text-lg py-6" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin ml-2" />
                  שולחים קישור...
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5 ml-2" />
                  שליחת קישור התחברות
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
