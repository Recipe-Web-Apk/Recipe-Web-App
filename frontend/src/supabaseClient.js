import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ohdyekzugsruwefkuedw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oZHlla3p1Z3NydXdlZmt1ZWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMTkyODIsImV4cCI6MjA2NzY5NTI4Mn0.ucJITeO1NEC9rjVyYJ9ErTlmS06i08JQ1osEF_Xjpxg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 