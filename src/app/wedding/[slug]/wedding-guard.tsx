'use client'

import { useWeddingSlugContext } from '@/providers/wedding-slug-provider'
import { clearSlug } from '@/lib/wedding-storage'
import { Loader2 } from 'lucide-react'

export function WeddingGuard({ children }: { children: React.ReactNode }) {
  const { error, loading: weddingLoading } = useWeddingSlugContext()

  if (weddingLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    clearSlug()
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
        <p className="text-lg text-muted-foreground">{error}</p>
        <a href="/" className="text-blue-600 underline">חזרה לדף הבית</a>
      </div>
    )
  }

  return <>{children}</>
}
