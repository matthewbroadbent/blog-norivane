import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Use placeholder values if environment variables are not set
const defaultUrl = 'https://placeholder.supabase.co'
const defaultKey = 'placeholder-anon-key'

export const supabase = createClient(
  supabaseUrl || defaultUrl,
  supabaseAnonKey || defaultKey
)

// Check if we're using placeholder values
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_url_here' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here'
)
