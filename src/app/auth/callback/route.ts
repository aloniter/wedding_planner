import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function attachUserToInvite(
  supabase: ReturnType<typeof createServerClient>,
  invite: string,
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: existing } = await supabase
    .from('project_members')
    .select('id')
    .eq('wedding_id', invite)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) return true

  const normalizedEmail = user.email?.toLowerCase() ?? ''
  if (normalizedEmail) {
    const { data: pendingInvite } = await supabase
      .from('project_members')
      .select('id')
      .eq('wedding_id', invite)
      .is('user_id', null)
      .ilike('invited_email', normalizedEmail)
      .maybeSingle()

    if (pendingInvite) {
      const { error: claimError } = await supabase
        .from('project_members')
        .update({
          user_id: user.id,
          invited_email: normalizedEmail,
          joined_at: new Date().toISOString(),
        })
        .eq('id', pendingInvite.id)

      if (!claimError) return true
    }
  }

  const { error: insertError } = await supabase
    .from('project_members')
    .insert({
      wedding_id: invite,
      user_id: user.id,
      role: 'partner',
      invited_email: normalizedEmail || null,
      joined_at: new Date().toISOString(),
    })

  return !insertError || insertError.message.includes('duplicate')
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const otpType = searchParams.get('type') as EmailOtpType | null
  const invite = searchParams.get('invite')
  const next = searchParams.get('next') ?? '/'
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return NextResponse.redirect(new URL('/auth', origin))
  }

  const supabaseResponse = NextResponse.redirect(new URL(next, origin))
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  let authError: unknown = null

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    authError = error
  } else if (tokenHash && otpType) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    })
    authError = error
  } else {
    authError = 'missing_auth_params'
  }

  if (authError) {
    return NextResponse.redirect(new URL('/auth', origin))
  }

  if (invite && UUID_RE.test(invite)) {
    await attachUserToInvite(supabase, invite)
  }

  return supabaseResponse
}
