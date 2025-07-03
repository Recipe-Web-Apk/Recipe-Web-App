import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://asbuckytummmrnikguoi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzYnVja3l0dW1tbXJuaWtndW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMDY0MTcsImV4cCI6MjA2Njg4MjQxN30.I56VHXTl5ze5e6fdMsEc-kba_yWr7tTZKdhp4xYfYzs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 