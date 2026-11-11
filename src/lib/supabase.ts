import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if valid credentials are provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
);

// Fallback mock credentials for client instantiation if not yet configured
const clientUrl = isSupabaseConfigured ? supabaseUrl : 'https://demo-storepulse.supabase.co';
const clientKey = isSupabaseConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fake_key_for_unconfigured_dev_mode';

export const supabase: SupabaseClient = createClient(clientUrl, clientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface SupabaseConfigStatus {
  configured: boolean;
  url: string;
  hasAnonKey: boolean;
  connectionStatus: 'connected' | 'not_configured' | 'connection_error';
  errorMessage?: string;
}

export async function checkSupabaseConnection(): Promise<SupabaseConfigStatus> {
  if (!isSupabaseConfigured) {
    return {
      configured: false,
      url: supabaseUrl || 'Not set',
      hasAnonKey: Boolean(supabaseAnonKey),
      connectionStatus: 'not_configured',
      errorMessage: 'Supabase URL and Anon Key not configured in .env',
    };
  }

  try {
    const { error } = await supabase.from('plans').select('id').limit(1);
    if (error) {
      return {
        configured: true,
        url: supabaseUrl,
        hasAnonKey: true,
        connectionStatus: 'connection_error',
        errorMessage: error.message,
      };
    }
    return {
      configured: true,
      url: supabaseUrl,
      hasAnonKey: true,
      connectionStatus: 'connected',
    };
  } catch (err: any) {
    return {
      configured: true,
      url: supabaseUrl,
      hasAnonKey: true,
      connectionStatus: 'connection_error',
      errorMessage: err.message || 'Failed to ping Supabase database',
    };
  }
}
