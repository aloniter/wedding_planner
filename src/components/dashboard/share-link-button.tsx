'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ShareLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const url = `${window.location.origin}/wedding/${slug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="gap-2 shrink-0"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-600" />
          הועתק!
        </>
      ) : (
        <>
          <Link2 className="h-4 w-4" />
          שתף קישור
        </>
      )}
    </Button>
  )
}
