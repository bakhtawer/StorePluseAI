import { isServerSupabaseConfigured, supabaseAdmin } from '../server/supabase.js';

export default async function handler(req: any, res: any) {
  let dbStatus = 'not_configured';
  let dbError = null;

  if (isServerSupabaseConfigured && supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin.from('plans').select('id').limit(1);
      dbStatus = error ? 'error' : 'connected';
      if (error) dbError = error.message;
    } catch (err: any) {
      dbStatus = 'error';
      dbError = err.message;
    }
  }

  res.status(200).json({
    status: 'ok',
    service: 'StorePulse AI SaaS Backend (Vercel Serverless)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    supabase: {
      configured: isServerSupabaseConfigured,
      status: dbStatus,
      error: dbError,
    },
  });
}
