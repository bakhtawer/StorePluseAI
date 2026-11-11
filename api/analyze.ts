import type { IncomingMessage, ServerResponse } from 'http';
import { analyzeStoreUrl } from '../server/analyzer.js';
import { isServerSupabaseConfigured, supabaseAdmin } from '../server/supabase.js';

// Vercel Serverless Function Handler for /api/v1/analyze
export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // use as is
      }
    }

    const url = body?.url;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ error: 'A valid website or store URL is required' });
    }

    const report = await analyzeStoreUrl(url.trim());

    // Optional Supabase persistence if configured in Vercel environment variables
    if (isServerSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: orgs } = await supabaseAdmin.from('organizations').select('id').limit(1);
        const defaultOrgId = orgs && orgs.length > 0 ? orgs[0].id : null;

        if (defaultOrgId) {
          const { data: auditRow } = await supabaseAdmin
            .from('audits')
            .insert({
              organization_id: defaultOrgId,
              target_url: report.target_url,
              normalized_domain: report.normalized_domain,
              status: 'completed',
              pages_crawled: 1,
              pages_limit: 10,
              overall_health_score: report.overall_score,
              scoring_version: '1.0.0',
              crawl_metadata: {
                platform: report.detected_platform,
                metrics: report.metrics,
              },
              completed_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (auditRow) {
            await supabaseAdmin.from('audit_scores').insert({
              audit_id: auditRow.id,
              technical_seo_score: report.category_scores.technical_seo,
              performance_score: report.category_scores.performance,
              ux_conversion_score: report.category_scores.ux_conversion,
              product_optimization_score: report.category_scores.product_optimization,
              trust_signals_score: report.category_scores.trust_signals,
              content_quality_score: report.category_scores.content_quality,
              technical_health_score: report.category_scores.technical_health,
              score_breakdown: report.category_scores,
            });
          }
        }
      } catch (dbErr: any) {
        console.warn('Vercel API: could not save to Supabase:', dbErr.message);
      }
    }

    return res.status(200).json({ success: true, report });
  } catch (err: any) {
    console.error('Vercel API analyze error:', err);
    return res.status(400).json({
      error: err.message || 'Failed to analyze store URL on Vercel. Please verify the URL is publicly reachable.',
    });
  }
}
