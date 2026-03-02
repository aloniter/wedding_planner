'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Mail, Loader2, CheckCircle2 } from 'lucide-react'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError(null)

    const supabase = createClient()

    // Get invite param if present
    const params = new URLSearchParams(window.location.search)
    const invite = params.get('invite')
    const redirectTo = invite
      ? `${window.location.origin}/auth/callback?invite=${invite}`
      : `${window.location.origin}/auth/callback`

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: redirectTo,
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">חתונה שלנו 💍</CardTitle>
          <CardDescription className="text-base">
            התחברו כדי לנהל את החתונה ביחד
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <p className="text-lg font-medium">קישור נשלח!</p>
                <p className="text-muted-foreground mt-1">
                  בדקו את תיבת המייל שלכם ב-
                  <span className="font-medium text-foreground">{email}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  לחצו על הקישור במייל כדי להתחבר
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => { setSent(false); setEmail('') }}
                className="mt-4"
              >
                שלחו שוב
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">כתובת אימייל</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pr-10"
                    dir="ltr"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full text-lg py-6" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin ml-2" />
                    שולח...
                  </>
                ) : (
                  'שלחו לי קישור התחברות'
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                נשלח לכם קישור חד-פעמי למייל, בלי צורך בסיסמה
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
