'use client'

import { useWeddingSlugContext } from '@/providers/wedding-slug-provider'

export function WeddingGuard({ children }: { children: React.ReactNode }) {
  const { error, loading } = useWeddingSlugContext()

  if (!loading && error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
        <p className="text-lg text-muted-foreground">{error}</p>
        <a href="/setup" className="text-blue-600 underline">חזרה לדף הבית</a>
      </div>
    )
  }

  return <>{children}</>
}
