import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const invite = searchParams.get('invite')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createServerSupabaseClient()
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

      return NextResponse.redirect(new URL(next, origin))
    }
  }

  // Auth code error - redirect to auth with error
  return NextResponse.redirect(new URL('/auth', origin))
}
