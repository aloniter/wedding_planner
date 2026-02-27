'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SetupForm } from '@/components/setup/setup-form'
import { useWedding } from '@/hooks/use-wedding'

export default function SetupPage() {
  const router = useRouter()
  const { wedding, loading } = useWedding()

  useEffect(() => {
    if (!loading && wedding) {
      router.push('/')
    }
  }, [wedding, loading, router])

  if (loading) return null
  if (wedding) return null

  return <SetupForm />
}
