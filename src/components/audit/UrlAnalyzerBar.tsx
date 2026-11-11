import React, { useState } from 'react';
import { AuditReportData } from '../../../server/analyzer.ts';
import { Search, Loader2, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface UrlAnalyzerBarProps {
  onReportGenerated: (report: AuditReportData) => void;
  className?: string;
  autoFocus?: boolean;
}

export const UrlAnalyzerBar: React.FC<UrlAnalyzerBarProps> = ({
  onReportGenerated,
  className = '',
  autoFocus = false,
}) => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const steps = [
    'Validating target URL and SSRF safety...',
    'Connecting to storefront & measuring server response time...',
    'Detecting e-commerce platform & CMS architecture...',
    'Extracting technical SEO metadata, viewport & headings...',
    'Auditing product schema, trust policies & images...',
    'Calculating deterministic 7-category health scores...',
    'Compiling executive summary and export package...',
  ];

  const handleAnalyze = async (targetUrl?: string) => {
    const input = (targetUrl || url).trim();
    if (!input) {
      setErrorMsg('Please enter a website or store URL (e.g. allbirds.com or yourstore.com)');
      return;
    }

    setErrorMsg(null);
    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Progress stepper animation
    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      const response = await fetch('/api/v1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: input }),
      });

      const data = await response.json();
      clearInterval(stepInterval);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze store URL');
      }

      setAnalysisStep(steps.length - 1);
      setTimeout(() => {
        setIsAnalyzing(false);
        onReportGenerated(data.report);
      }, 400);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setErrorMsg(err.message || 'Unable to scan target URL. Please verify the website is publicly online.');
    }
  };

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAnalyze();
        }}
        className="relative flex items-center p-2 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all"
      >
        <div className="pl-3 pr-2 text-slate-500 shrink-0">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          autoFocus={autoFocus}
          disabled={isAnalyzing}
          placeholder="Enter e-commerce store URL (e.g. gymshark.com, allbirds.com, mystore.com)"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (errorMsg) setErrorMsg(null);
          }}
          className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isAnalyzing || !url.trim()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm shadow-blue-600/30 transition-colors shrink-0 flex items-center gap-1.5"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Run Audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Popular Demo Store Chips */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
        <span>Try sample stores:</span>
        {[
          { label: 'Gymshark (Shopify)', url: 'https://www.gymshark.com' },
          { label: 'Allbirds (Shopify)', url: 'https://www.allbirds.com' },
          { label: 'WordPress / WooCommerce', url: 'https://woocommerce.com' },
        ].map((demo, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isAnalyzing}
            onClick={() => {
              setUrl(demo.url);
              handleAnalyze(demo.url);
            }}
            className="px-2.5 py-1 rounded-md bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            {demo.label}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mt-4 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Audit Scan Failed</div>
            <div className="text-[11px] text-rose-300/80 mt-0.5">{errorMsg}</div>
          </div>
        </div>
      )}

      {/* Live Progress Analyzer Modal / Card */}
      {isAnalyzing && (
        <div className="mt-5 p-5 rounded-xl bg-slate-900 border border-blue-500/30 shadow-2xl animate-in fade-in space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              <span>Analyzing Store Intelligence</span>
            </div>
            <span className="text-[10px] font-mono text-blue-400">
              Step {analysisStep + 1} of {steps.length}
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((analysisStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="text-xs text-slate-300 font-mono flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{steps[analysisStep]}</span>
          </div>
        </div>
      )}
    </div>
  );
};
