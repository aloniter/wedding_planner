'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return { url, key }
}

export function createClient() {
  if (client) return client
  const config = getSupabaseConfig()
  if (!config) {
    throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  client = createBrowserClient<Database>(config.url, config.key)
  return client
}
