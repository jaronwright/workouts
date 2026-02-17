import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). ' +
    'For local dev these come from .env.development. For production they come from Vercel.'
  )
}

if (import.meta.env.DEV) {
  const isLocal = supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1')
  console.log(
    `[Supabase] Connected to ${isLocal ? 'LOCAL' : 'PRODUCTION'} database: ${supabaseUrl}`
  )
  if (!isLocal) {
    console.warn(
      '[Supabase] WARNING: Dev server is connected to PRODUCTION database! ' +
      'Check that .env.local does not contain VITE_SUPABASE_URL — it should only be in .env.development.'
    )
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
