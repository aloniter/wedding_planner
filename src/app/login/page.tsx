'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { createClient, getSupabaseConfig } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Mail, KeyRound, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [error, setError] = useState<string | null>(null)
  const otpRef = useRef<HTMLInputElement>(null)

  // If already authenticated, redirect to home
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/')
    }
  }, [authLoading, user, router])

  const handleSendOtp = async (e: React.FormEvent) => {
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
      setError('שגיאה בשליחת הקוד. אנא נסו שוב.')
      setLoading(false)
      return
    }

    setStep('otp')
    setLoading(false)
    // Focus OTP input after render
    setTimeout(() => otpRef.current?.focus(), 100)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim() || loading) return

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: 'email',
    })

    if (verifyError) {
      setError('קוד שגוי או שפג תוקפו. נסו שוב.')
      setLoading(false)
      return
    }

    // Session is now established — AuthProvider will detect it
    // and the useEffect above will redirect to /
  }

  const handleResend = async () => {
    setOtp('')
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    if (authError) {
      setError('שגיאה בשליחת הקוד. אנא נסו שוב.')
    } else {
      setError(null)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Step 2: Enter OTP code
  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">הזינו את הקוד</CardTitle>
            <CardDescription className="text-base">
              שלחנו קוד בן 6 ספרות אל <strong dir="ltr">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">קוד אימות</Label>
                <Input
                  ref={otpRef}
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  dir="ltr"
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  required
                  maxLength={6}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button type="submit" className="w-full text-lg py-6" size="lg" disabled={loading || otp.length < 6}>
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin ml-2" />
                    מאמתים...
                  </>
                ) : (
                  'התחברות'
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-muted-foreground"
                >
                  שליחה מחדש
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setStep('email'); setOtp(''); setError(null) }}
                  className="text-muted-foreground gap-1"
                >
                  <ArrowRight className="h-3 w-3" />
                  שינוי כתובת
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 1: Enter email
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
          <form onSubmit={handleSendOtp} className="space-y-4">
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
                  שולחים קוד...
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5 ml-2" />
                  שליחת קוד התחברות
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
