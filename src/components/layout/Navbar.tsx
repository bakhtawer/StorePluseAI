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
          className="text-lg font-bold tracking-tight text-white hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2.5 text-left cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-indigo-500/25">
            SP
          </div>
          <span>StorePulse AI</span>
        </button>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('landing')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              currentView === 'landing' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('how-it-works')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              currentView === 'how-it-works' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Capabilities
          </button>
          <button
            onClick={() => onNavigate('pricing')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              currentView === 'pricing' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Pricing & Plans
          </button>
          {user && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
                currentView === 'dashboard' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
              }`}
            >
              Dashboard
            </button>
          )}
        </nav>

        {/* Zone 3: Primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {Boolean(user && profile?.system_role === 'admin') && (
            <button
              onClick={onOpenDatabaseSetup}
              title="Super Admin Database Configuration"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:text-white hover:bg-indigo-500/20 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Admin Config</span>
            </button>
          )}

          {user ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-indigo-600/25 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>{profile?.full_name || 'My Dashboard'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-all whitespace-nowrap shrink-0 shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
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
