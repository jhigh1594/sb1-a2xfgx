import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Test the connection
async function testSupabaseConnection() {
  try {
    await supabase.from('journal_entries').select('*').limit(1)
    console.log('Supabase connection successful')
  } catch (error) {
    console.error('Supabase connection failed:', error)
    console.error('Supabase URL:', supabaseUrl)
    console.error('Supabase Key:', supabaseKey ? 'Set' : 'Not set')
    console.error('Error details:', JSON.stringify(error, null, 2))
  }
}

testSupabaseConnection()