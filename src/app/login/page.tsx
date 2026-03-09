'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { createClient, getSupabaseConfig } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/')
    }
  }, [authLoading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim() || loading) return

    setLoading(true)
    setError(null)

    if (!getSupabaseConfig()) {
      setError('Supabase is not configured')
      setLoading(false)
      return
    }

    const supabase = createClient()

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('כתובת המייל כבר רשומה. נסו להתחבר.')
        } else {
          setError(signUpError.message)
        }
        setLoading(false)
        return
      }

      // Supabase may require email confirmation depending on settings.
      // If auto-confirm is on, user is logged in immediately.
      // Check if we got a session:
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Auto-confirmed — redirect will happen via useEffect
        return
      }

      setSignupSuccess(true)
      setLoading(false)
      return
    }

    // Login
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    })

    if (signInError) {
      if (signInError.message.includes('Invalid login')) {
        setError('אימייל או סיסמה שגויים')
      } else {
        setError(signInError.message)
      }
      setLoading(false)
      return
    }

    // Success — AuthProvider will detect the session and useEffect redirects
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">בדקו את המייל</CardTitle>
            <CardDescription className="text-base">
              שלחנו קישור אימות אל <strong dir="ltr">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              לחצו על הקישור במייל כדי לאשר את החשבון, ואז חזרו להתחבר.
            </p>
            <Button
              variant="outline"
              onClick={() => { setSignupSuccess(false); setMode('login'); setPassword('') }}
            >
              חזרה להתחברות
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
            {mode === 'login'
              ? 'התחברו כדי לנהל את החתונה'
              : 'צרו חשבון חדש כדי להתחיל'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
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

            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'לפחות 6 תווים' : '••••••'}
                dir="ltr"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button type="submit" className="w-full text-lg py-6" size="lg" disabled={loading}>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                mode === 'login' ? 'התחברות' : 'הרשמה'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <p>
                אין לכם חשבון?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null) }}
                  className="text-primary underline font-medium"
                >
                  הרשמה
                </button>
              </p>
            ) : (
              <p>
                כבר יש לכם חשבון?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null) }}
                  className="text-primary underline font-medium"
                >
                  התחברות
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
