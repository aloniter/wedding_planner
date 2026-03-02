import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const invite = searchParams.get('invite')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      return NextResponse.redirect(new URL('/auth', origin))
    }

    // Create the redirect response FIRST, then set cookies directly on it.
    // This ensures Set-Cookie headers are included in the redirect response
    // that the browser receives — critical for the browser Supabase client
    // to pick up the session and authenticate subsequent requests.
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

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // If this is an invite acceptance, add user as partner to the wedding
      if (invite) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Check if already a member
          const { data: existing } = await supabase
            .from('project_members')
            .select('id')
            .eq('wedding_id', invite)
            .eq('user_id', user.id)
            .single()

          if (!existing) {
            // Check if there's a pending invite for this email
            const { data: pendingInvite } = await supabase
              .from('project_members')
              .select('id')
              .eq('wedding_id', invite)
              .eq('invited_email', user.email ?? '')
              .is('joined_at', null)
              .single()

            if (pendingInvite) {
              // Update existing invite row
              await supabase
                .from('project_members')
                .update({
                  user_id: user.id,
                  joined_at: new Date().toISOString(),
                })
                .eq('id', pendingInvite.id)
            } else {
              // Insert new partner membership
              await supabase
                .from('project_members')
                .insert({
                  wedding_id: invite,
                  user_id: user.id,
                  role: 'partner',
                  joined_at: new Date().toISOString(),
                })
            }
          }
        }
      }

      return supabaseResponse
    }
  }

  // Auth code error - redirect to auth with error
  return NextResponse.redirect(new URL('/auth', origin))
}
