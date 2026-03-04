'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { getSavedSlug, saveSlug } from '@/lib/wedding-storage'
import { createClient, getSupabaseConfig } from '@/lib/supabase/client'

export default function HomePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function resolve() {
      // 1. Check localStorage
      const saved = getSavedSlug()
      if (saved) {
        router.replace(`/wedding/${saved}`)
        return
      }

      // 2. Query Supabase for most recent wedding
      if (getSupabaseConfig()) {
        const supabase = createClient()
        const { data } = await supabase
          .from('weddings')
          .select('slug')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (data?.slug) {
          saveSlug(data.slug)
          router.replace(`/wedding/${data.slug}`)
          return
        }
      }

      // 3. Nothing found → setup
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
