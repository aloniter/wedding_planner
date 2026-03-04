import type { ReactNode } from 'react'
import { WeddingSlugProvider } from '@/providers/wedding-slug-provider'
import { PublicNavbar } from '@/components/layout/public-navbar'

export default async function WeddingLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <WeddingSlugProvider slug={slug}>
      <PublicNavbar slug={slug} />
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {children}
      </main>
    </WeddingSlugProvider>
  )
}
