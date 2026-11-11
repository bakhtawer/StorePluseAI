import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { X, Building2, Briefcase, Check, AlertCircle } from 'lucide-react';

interface OrgModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrgModal: React.FC<OrgModalProps> = ({ isOpen, onClose }) => {
  const { createOrganization } = useAuth();
  const [name, setName] = useState('');
  const [isAgency, setIsAgency] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await createOrganization(name.trim(), isAgency);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setName('');
        setIsAgency(false);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold mb-2.5">
            <Building2 className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Create Workspace</h2>
          <p className="text-xs text-slate-400 mt-1">
            Workspaces provide complete multi-tenant isolation for audit data, team members, and reports.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Workspace Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Northwind Apparel or Momentum Growth Agency"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Workspace Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsAgency(false)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  !isAgency
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-xs mb-1">Single Store</div>
                <div className="text-[11px] text-slate-400">For direct brand owners and DTC founders.</div>
              </button>

              <button
                type="button"
                onClick={() => setIsAgency(true)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  isAgency
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-xs mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  <span>Agency</span>
                </div>
                <div className="text-[11px] text-slate-400">Manage multiple client brands & white-label reports.</div>
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm shadow-blue-600/30 transition-colors flex items-center gap-1.5"
            >
              {loading ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
