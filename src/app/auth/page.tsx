'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 ml-2" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

async function handleInvite(
  supabase: ReturnType<typeof createClient>,
  invite: string,
): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'missing_user'

  const { data: existing } = await supabase
    .from('project_members')
    .select('id')
    .eq('wedding_id', invite)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) return null

  const { data: pendingInvite } = await supabase
    .from('project_members')
    .select('id')
    .eq('wedding_id', invite)
    .is('user_id', null)
    .ilike('invited_email', user.email ?? '')
    .maybeSingle()

  if (pendingInvite) {
    const { error } = await supabase
      .from('project_members')
      .update({
        user_id: user.id,
        invited_email: (user.email ?? '').toLowerCase(),
        joined_at: new Date().toISOString(),
      })
      .eq('id', pendingInvite.id)
    return error ? error.message : null
  } else {
    const { error } = await supabase
      .from('project_members')
      .insert({
        wedding_id: invite,
        user_id: user.id,
        role: 'partner',
        invited_email: (user.email ?? '').toLowerCase() || null,
        joined_at: new Date().toISOString(),
      })
    return error ? error.message : null
  }
}

function AuthPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invite = searchParams.get('invite')
  const prefilledEmail = searchParams.get('email') ?? ''
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState(prefilledEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)
  const [autoJoinLoading, setAutoJoinLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    if (!invite) return
    const inviteId = invite

    let cancelled = false

    async function autoJoinIfSignedIn() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return

      setAutoJoinLoading(true)
      setInfo('מחברים אתכם להזמנה...')
      setError(null)

      const inviteError = await handleInvite(supabase, inviteId)
      if (cancelled) return

      if (inviteError) {
        setError('ההזמנה לא הושלמה. נסו שוב מהקישור שנשלח אליכם')
        setAutoJoinLoading(false)
        return
      }

      router.push('/')
      router.refresh()
    }

    autoJoinIfSignedIn()
    return () => {
      cancelled = true
    }
  }, [invite, router])

  const getRedirectTo = () =>
    invite
      ? `${window.location.origin}/auth/callback?invite=${invite}`
      : `${window.location.origin}/auth/callback`

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError(null)
    setInfo(null)
    const supabase = createClient()
    const redirectTo = getRedirectTo()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })

    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  const handleMagicLogin = async () => {
    if (!email.trim()) return

    setMagicLoading(true)
    setError(null)
    setInfo(null)

    const supabase = createClient()
    const redirectTo = getRedirectTo()

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectTo,
      },
    })

    if (error) {
      setError(error.message)
      setMagicLoading(false)
      return
    }

    setInfo('שלחנו קישור כניסה למייל. לחיצה אחת ואתם בפנים')
    setMagicLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return

    setLoading(true)
    setError(null)
    setInfo(null)

    const supabase = createClient()
    const redirectTo = getRedirectTo()

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectTo,
        },
      })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      if (!data.session) {
        setInfo('כדי לסיים הרשמה צריך לאשר את המייל שנשלח אליכם')
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    }

    if (invite) {
      const inviteError = await handleInvite(supabase, invite)
      if (inviteError) {
        setError('התחברתם בהצלחה אבל ההזמנה לא הושלמה. נסו שוב מהקישור בהזמנה')
        setLoading(false)
        return
      }
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">חתונה שלנו 💍</CardTitle>
          <CardDescription className="text-base">
            התחברו כדי לנהל את החתונה ביחד
          </CardDescription>
          {invite && (
            <p className="text-sm text-muted-foreground pt-2">
              הוזמנתם לניהול החתונה. אפשר להתחבר בקלות עם קישור למייל
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full text-base py-6"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading || magicLoading || autoJoinLoading}
          >
            {googleLoading ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : <GoogleIcon />}
            התחברו עם Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">או</span>
            </div>
          </div>

          <div className="flex rounded-lg border overflow-hidden">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); setInfo(null) }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'signin' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              כניסה
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setInfo(null) }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'signup' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              הרשמה
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
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

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handleMagicLogin}
              disabled={loading || googleLoading || magicLoading || autoJoinLoading || !email.trim()}
            >
              {magicLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  שולח קישור...
                </>
              ) : (
                'שלחו לי קישור כניסה במייל'
              )}
            </Button>

            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'לפחות 6 תווים' : '••••••••'}
                  className="pr-10 pl-10"
                  dir="ltr"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {info && <p className="text-sm text-green-600">{info}</p>}

            <Button type="submit" className="w-full text-lg py-6" size="lg" disabled={loading || googleLoading || magicLoading || autoJoinLoading}>
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin ml-2" />רגע...</>
              ) : mode === 'signin' ? 'כניסה' : 'הרשמה'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <AuthPageInner />
    </Suspense>
  )
}
