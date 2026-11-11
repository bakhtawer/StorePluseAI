import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import {
  LayoutDashboard,
  Search,
  Store,
  CheckSquare,
  Activity,
  CreditCard,
  Users,
  Settings,
  Database,
  LogOut,
  Building2,
  ChevronDown,
  Plus,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenOrgModal: () => void;
  onOpenDatabaseSetup: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenOrgModal,
  onOpenDatabaseSetup,
}) => {
  const { user, profile, currentOrg, memberships, switchOrganization, signOut } = useAuth();
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'audits', label: 'Audits & Diagnostics', icon: Search, badge: 'Phase 3' },
    { id: 'stores', label: 'Connected Stores', icon: Store, badge: 'Phase 6' },
    { id: 'actions', label: 'Action Items', icon: CheckSquare },
    { id: 'monitoring', label: 'Monitoring', icon: Activity, badge: 'Phase 7' },
    { id: 'billing', label: 'Plans & Billing', icon: CreditCard },
    { id: 'team', label: 'Team Workspaces', icon: Users },
    { id: 'tests', label: 'Foundation Test Suite', icon: Shield },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/90 flex flex-col h-screen shrink-0 select-none">
      {/* Brand & Organization Selector */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white font-black text-xs">
            SP
          </div>
          <span className="text-sm font-bold text-white tracking-tight">StorePulse AI</span>
        </div>

        {/* Org Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-left border border-slate-700/60 transition-colors"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">
                  {currentOrg?.name || 'My Organization'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentOrg?.is_agency ? 'Agency Workspace' : 'Store Workspace'}
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          </button>

          {/* Org Switcher Menu */}
          {showOrgDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Workspace
              </div>
              {memberships.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    switchOrganization(m.organization_id);
                    setShowOrgDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-700 transition-colors ${
                    currentOrg?.id === m.organization_id ? 'text-blue-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  <span className="truncate">{m.organization?.name || m.organization_id}</span>
                  <span className="text-[10px] text-slate-400 capitalize">{m.role}</span>
                </button>
              ))}
              <div className="border-t border-slate-700 my-1"></div>
              <button
                onClick={() => {
                  setShowOrgDropdown(false);
                  onOpenOrgModal();
                }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 text-blue-400 hover:bg-slate-700 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Workspace</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono text-slate-500">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Configuration & Profile */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <button
          onClick={onOpenDatabaseSetup}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Supabase Config</span>
          </div>
          <span className="text-[10px] text-emerald-400">PostgreSQL</span>
        </button>

        {/* Profile Card */}
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200 shrink-0">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <div className="text-xs font-medium text-slate-200 truncate">
                {profile?.full_name || user?.email}
              </div>
              <div className="text-[10px] text-slate-400 truncate capitalize">
                {profile?.system_role?.replace('_', ' ') || 'Free user'}
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
