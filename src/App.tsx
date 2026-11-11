import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { OrgModal } from './components/organization/OrgModal.tsx';
import { SupabaseSetupModal } from './components/database/SupabaseSetupModal.tsx';
import { FoundationDashboard } from './components/dashboard/FoundationDashboard.tsx';
import { BillingView } from './components/dashboard/BillingView.tsx';
import { TeamWorkspacesView } from './components/dashboard/TeamWorkspacesView.tsx';
import { LandingPage } from './components/public/LandingPage.tsx';
import { HowItWorksPage } from './components/public/HowItWorksPage.tsx';
import { AuditReportView } from './components/audit/AuditReportView.tsx';
import { AuditReportData } from '../server/analyzer.ts';
import {
  AuditsPlaceholderView,
  StoresPlaceholderView,
  ActionItemsPlaceholderView,
  MonitoringPlaceholderView,
} from './components/dashboard/PhaseViews.tsx';
import { Building2, Database, ShieldCheck, ChevronRight } from 'lucide-react';

function MainApp() {
  const { user, profile, currentOrg, isConfigured } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'pricing' | 'how-it-works' | 'report'>('landing');
  const [dashboardTab, setDashboardTab] = useState<string>('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<AuditReportData | null>(null);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleReportGenerated = (report: AuditReportData) => {
    setActiveReport(report);
    setCurrentView('report');
  };

  // If user is not logged in or explicitly browsing public pages:
  const isBrowsingPublic = currentView !== 'dashboard' || !user;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Public / Global Top Navigation */}
      <Navbar
        onOpenAuth={openAuth}
        onOpenDatabaseSetup={() => setDbModalOpen(true)}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view === 'pricing') setDashboardTab('billing');
        }}
        currentView={currentView}
      />

      {/* Main Viewport Router */}
      {isBrowsingPublic ? (
        <main className="flex-1">
          {currentView === 'landing' && (
            <LandingPage
              onOpenAuth={openAuth}
              onNavigate={(v) => {
                if (v === 'dashboard' && user) setCurrentView('dashboard');
                else setCurrentView(v);
              }}
              onReportGenerated={handleReportGenerated}
            />
          )}

          {currentView === 'report' && activeReport && (
            <AuditReportView
              report={activeReport}
              onNewAudit={() => {
                setActiveReport(null);
                setCurrentView('landing');
              }}
              onOpenAuth={openAuth}
              onNavigateToPlans={() => setCurrentView('pricing')}
              isAuthenticated={Boolean(user)}
            />
          )}

          {currentView === 'how-it-works' && <HowItWorksPage onOpenAuth={openAuth} />}

          {currentView === 'pricing' && (
            <div className="py-12 px-4">
              <BillingView />
            </div>
          )}
        </main>
      ) : (
        /* Authenticated Dashboard Workspace */
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <Sidebar
            currentTab={dashboardTab}
            onSelectTab={(tab) => {
              setDashboardTab(tab);
              setCurrentView('dashboard');
            }}
            onOpenOrgModal={() => setOrgModalOpen(true)}
            onOpenDatabaseSetup={() => setDbModalOpen(true)}
          />

          {/* Right Main Content Panel */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Top Workspace Breadcrumb Strip */}
            <div className="h-12 border-b border-slate-800 bg-slate-900/60 px-6 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-slate-200 font-semibold">{currentOrg?.name || 'Workspace'}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="capitalize text-slate-400 font-medium">{dashboardTab}</span>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <button
                  onClick={() => setDbModalOpen(true)}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Database className={`w-3.5 h-3.5 ${isConfigured ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <span>{isConfigured ? 'PostgreSQL Active' : 'Dev Gateway Mode'}</span>
                </button>
                <span>·</span>
                <span className="text-slate-400">
                  Role: <strong className="text-white capitalize">{profile?.system_role?.replace('_', ' ') || 'Free user'}</strong>
                </span>
              </div>
            </div>

            {/* View Content */}
            <main className="flex-1 p-6 md:p-8">
              {dashboardTab === 'dashboard' && (
                <FoundationDashboard
                  onOpenDatabaseSetup={() => setDbModalOpen(true)}
                  onOpenOrgModal={() => setOrgModalOpen(true)}
                  onSelectTab={(tab) => setDashboardTab(tab)}
                />
              )}
              {dashboardTab === 'audits' && (
                <AuditsPlaceholderView
                  onNavigateToBilling={() => setDashboardTab('billing')}
                  onOpenAuth={openAuth}
                  isAuthenticated={Boolean(user)}
                />
              )}
              {dashboardTab === 'stores' && <StoresPlaceholderView />}
              {dashboardTab === 'actions' && <ActionItemsPlaceholderView />}
              {dashboardTab === 'monitoring' && <MonitoringPlaceholderView />}
              {dashboardTab === 'billing' && <BillingView />}
              {dashboardTab === 'team' && (
                <TeamWorkspacesView onOpenOrgModal={() => setOrgModalOpen(true)} />
              )}
              {dashboardTab === 'tests' && (
                <FoundationDashboard
                  onOpenDatabaseSetup={() => setDbModalOpen(true)}
                  onOpenOrgModal={() => setOrgModalOpen(true)}
                  onSelectTab={(tab) => setDashboardTab(tab)}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Footer for Public Visitors */}
      {isBrowsingPublic && (
        <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500 print:hidden">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>&copy; {new Date().getFullYear()} StorePulse AI. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <button onClick={() => setCurrentView('landing')} className="hover:text-slate-300">
                Platform
              </button>
              <button onClick={() => setCurrentView('how-it-works')} className="hover:text-slate-300">
                Architecture
              </button>
              <button onClick={() => setCurrentView('pricing')} className="hover:text-slate-300">
                Plans
              </button>
              <button onClick={() => setDbModalOpen(true)} className="hover:text-slate-300">
                Database Guide
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />

      <OrgModal
        isOpen={orgModalOpen}
        onClose={() => setOrgModalOpen(false)}
      />

      <SupabaseSetupModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
