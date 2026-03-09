'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { saveSlug, clearSlug } from '@/lib/wedding-storage'
import { createClient, getSupabaseConfig } from '@/lib/supabase/client'

export default function HomePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function resolve() {
      if (!getSupabaseConfig()) {
        router.replace('/login')
        return
      }

      const supabase = createClient()

      // Must be authenticated
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        clearSlug()
        router.replace('/login')
        return
      }

      // Query user's weddings via project_members
      const { data: memberships } = await supabase
        .from('project_members')
        .select('wedding_id, weddings(slug)')
        .eq('user_id', session.user.id)
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

      // No weddings — go to setup
      clearSlug()
      router.replace('/setup')
    }

    resolve().finally(() => setChecking(false))
  }, [router])

  if (!checking) return null

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}
