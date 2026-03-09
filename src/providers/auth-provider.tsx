'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { createClient, getSupabaseConfig } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

async function claimPendingInvites(user: User) {
  if (!user.email) return
  const supabase = createClient()

  // Find pending invites matching this user's email
  const { data: pendingInvites } = await supabase
    .from('project_members')
    .select('id')
    .eq('invited_email', user.email)
    .is('user_id', null)

  if (!pendingInvites?.length) return

  // Claim each invite by setting user_id and joined_at
  for (const invite of pendingInvites) {
    await supabase
      .from('project_members')
      .update({ user_id: user.id, joined_at: new Date().toISOString() })
      .eq('id', invite.id)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getSupabaseConfig()) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        claimPendingInvites(session.user)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          claimPendingInvites(session.user)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    if (!getSupabaseConfig()) return
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
