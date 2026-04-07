import { createClient } from '@supabase/supabase-js'

// These should be set in a .env file later. 
// Using mock placeholders so the UI doesn't crash before Supabase is fully provisioned.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
