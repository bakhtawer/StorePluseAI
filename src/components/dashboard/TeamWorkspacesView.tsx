import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { Building2, Users, Plus, Mail, Shield, UserCheck, AlertCircle } from 'lucide-react';

export const TeamWorkspacesView: React.FC<{ onOpenOrgModal: () => void }> = ({ onOpenOrgModal }) => {
  const { currentOrg, memberships, user, profile, switchOrganization } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin' | 'viewer'>('member');
  const [invitedList, setInvitedList] = useState<Array<{ email: string; role: string; date: string }>>([]);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInvitedList([
      ...invitedList,
      {
        email: inviteEmail.trim(),
        role: inviteRole,
        date: new Date().toLocaleDateString(),
      },
    ]);
    setInviteEmail('');
    setInviteSuccess(true);
    setTimeout(() => setInviteSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1.5 uppercase tracking-wider">
            <span>Multi-Tenant RBAC</span>
            <span>·</span>
            <span>Team & Workspace Access</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Organization & Team Workspaces</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage organization members, assign roles, and toggle between separate client and brand workspaces.
          </p>
        </div>

        <button
          onClick={onOpenOrgModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm shadow-blue-600/30 flex items-center gap-2 self-start transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Workspace</span>
        </button>
      </div>

      {/* Workspaces Switcher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Available Workspaces ({memberships.length})</span>
            </h3>
          </div>

          <div className="space-y-2">
            {memberships.map((m) => {
              const isActive = currentOrg?.id === m.organization_id;
              return (
                <div
                  key={m.id}
                  className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-blue-600/10 border-blue-500/30 text-white'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
                      {m.organization?.name?.charAt(0) || 'W'}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold truncate text-white">
                        {m.organization?.name || m.organization_id}
                      </div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        Role: {m.role} {m.organization?.is_agency && '· Agency Account'}
                      </div>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="text-[11px] font-semibold text-blue-400">Active</span>
                  ) : (
                    <button
                      onClick={() => switchOrganization(m.organization_id)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors"
                    >
                      Switch
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Invite Member Box */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>Invite Team Member</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Add team members to <strong className="text-white">{currentOrg?.name}</strong> with role-based permissions.
          </p>

          {inviteSuccess && (
            <div className="mb-4 p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
              Invitation generated successfully!
            </div>
          )}

          <form onSubmit={handleSendInvite} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="colleague@agency.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Assigned Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="member">Member (Can run audits and manage findings)</option>
                <option value="admin">Admin (Can manage stores, billing, and team)</option>
                <option value="viewer">Viewer (Read-only access to reports)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm shadow-blue-600/30 transition-colors"
            >
              Send Workspace Invite
            </button>
          </form>
        </div>
      </div>

      {/* Active Members Table */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-3">Workspace Members & Invitations</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-2">User / Email</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr>
                <td className="py-3 text-white font-medium flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div>{profile?.full_name || 'Founder'}</div>
                    <div className="text-[11px] text-slate-400">{user?.email}</div>
                  </div>
                </td>
                <td className="py-3 text-slate-300 capitalize">
                  {memberships.find((m) => m.organization_id === currentOrg?.id)?.role || 'owner'}
                </td>
                <td className="py-3 text-emerald-400 font-medium">Active</td>
                <td className="py-3 text-right text-slate-500">Workspace Owner</td>
              </tr>

              {invitedList.map((inv, idx) => (
                <tr key={idx}>
                  <td className="py-3 text-slate-300">{inv.email}</td>
                  <td className="py-3 text-slate-400 capitalize">{inv.role}</td>
                  <td className="py-3 text-amber-400">Invited ({inv.date})</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setInvitedList(invitedList.filter((_, i) => i !== idx))}
                      className="text-rose-400 hover:text-rose-300 text-xs"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
