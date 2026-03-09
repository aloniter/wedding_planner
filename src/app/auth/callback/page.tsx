'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, getSupabaseConfig } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    if (!getSupabaseConfig()) {
      router.replace('/login')
      return
    }

    const supabase = createClient()

    // Handle code exchange (PKCE flow)
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')

    async function handleAuth() {
      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
      }

      // For implicit flow (hash fragment), the Supabase client
      // auto-detects #access_token in the URL on initialization.
      // Wait a moment for onAuthStateChange to fire.

      // Check if we have a session now
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/')
        return
      }

      // If no session yet, listen for auth state change (hash detection can be async)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session) {
            subscription.unsubscribe()
            router.replace('/')
          }
        }
      )

      // Timeout: if nothing happens after 5s, send to login
      setTimeout(() => {
        subscription.unsubscribe()
        router.replace('/login')
      }, 5000)
    }

    handleAuth()
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-muted-foreground">מתחברים...</p>
    </div>
  )
}
