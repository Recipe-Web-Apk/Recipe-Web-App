import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co' // <-- Replace with your Supabase project URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY' // <-- Replace with your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 