import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Server-only Supabase client using the service role key.
 * Bypasses RLS — use only in server actions where public (unauthenticated) access is needed.
 * Never import this file from client components.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL')
    return null
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
