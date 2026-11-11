import React from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { Database, LogIn, User, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenDatabaseSetup: () => void;
  onNavigate: (view: 'landing' | 'dashboard' | 'pricing' | 'how-it-works') => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenDatabaseSetup,
  onNavigate,
  currentView,
}) => {
  const { user, profile, isConfigured } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element) */}
        <button
          onClick={() => onNavigate('landing')}
          className="text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-blue-500/20">
            SP
          </div>
          <span>StorePulse AI</span>
        </button>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('landing')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentView === 'landing' ? 'text-white' : 'text-slate-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('how-it-works')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentView === 'how-it-works' ? 'text-white' : 'text-slate-400'
            }`}
          >
            Capabilities
          </button>
          <button
            onClick={() => onNavigate('pricing')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentView === 'pricing' ? 'text-white' : 'text-slate-400'
            }`}
          >
            Pricing & Plans
          </button>
          {user && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
                currentView === 'dashboard' ? 'text-blue-400 font-semibold' : 'text-slate-400'
              }`}
            >
              Dashboard
            </button>
          )}
        </nav>

        {/* Zone 3: Primary action & configuration button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenDatabaseSetup}
            title={isConfigured ? 'Supabase Connected' : 'Configure Supabase Connection'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white hover:border-slate-600 transition-colors whitespace-nowrap shrink-0"
          >
            <Database className={`w-3.5 h-3.5 ${isConfigured ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">{isConfigured ? 'Supabase Live' : 'Supabase Setup'}</span>
          </button>

          {user ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-blue-600/30"
            >
              <User className="w-3.5 h-3.5" />
              <span>{profile?.full_name || 'My Dashboard'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-blue-600/30 flex items-center gap-1.5"
              >
                <span>Get Started</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
