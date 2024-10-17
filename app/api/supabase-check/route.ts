import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase.from('journal_entries').select('*').limit(1);
    if (error) throw error;
    return NextResponse.json({ status: 'ok', message: 'Supabase connection successful' });
  } catch (error: any) {
    console.error('Supabase connection error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json({ 
      status: 'error', 
      message: error.message || 'Unknown error',
      details: error
    }, { status: 500 });
  }
}