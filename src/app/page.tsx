'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { getSavedSlug, saveSlug, clearSlug } from '@/lib/wedding-storage'
import { createClient, getSupabaseConfig } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'

export default function HomePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return

    async function resolveWedding() {
      if (!getSupabaseConfig()) return

      // Already have a wedding open on this device — go straight there
      const savedSlug = getSavedSlug()
      if (savedSlug) {
        router.replace(`/wedding/${savedSlug}`)
        return
      }

      const supabase = createClient()

      if (user) {
        // Query user's weddings via project_members
        const { data: memberships } = await supabase
          .from('project_members')
          .select('wedding_id, weddings(slug)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (memberships && memberships.length > 0) {
          const wedding = memberships[0].weddings as unknown as { slug: string }
          if (wedding?.slug) {
            saveSlug(wedding.slug)
            router.replace(`/wedding/${wedding.slug}`)
            return
          }
        }
      } else {
        // No login — fall back to the most recently created wedding (public access)
        const { data: weddings } = await supabase
          .from('weddings')
          .select('slug')
          .order('created_at', { ascending: false })
          .limit(1)

        if (weddings && weddings.length > 0 && weddings[0].slug) {
          saveSlug(weddings[0].slug)
          router.replace(`/wedding/${weddings[0].slug}`)
          return
        }
      }

      // No weddings — go to setup
      clearSlug()
      router.replace('/setup')
    }

    resolveWedding()
  }, [authLoading, user, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}
