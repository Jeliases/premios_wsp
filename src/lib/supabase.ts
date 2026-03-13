import { createClient } from '@supabase/supabase-js'

// Estas variables deben coincidir con los nombres en tu archivo .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: Las variables de entorno de Supabase no estan definidas.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)