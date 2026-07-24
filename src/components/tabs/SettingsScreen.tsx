import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { submitVerificationRequest, submitUserComplaint, deleteUserAccount } from '../../services/api';
import {
  ShieldCheck,
  BadgeCheck,
  HelpCircle,
  Trash2,
  LogOut,
  ChevronRight,
  X,
  AlertTriangle,
  Lock
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const [activeModal, setActiveModal] = useState<'verify' | 'complaint' | 'delete' | null>(null);

  // Verification Form
  const [category, setCategory] = useState('Public Figure');
  const [docProof, setDocProof] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');

  // Complaint Form
  const [complaintText, setComplaintText] = useState('');
  const [complaintMsg, setComplaintMsg] = useState('');

  // Delete Account Form
  const [deletePass, setDeletePass] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');

  const handleApplyVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !docProof.trim()) return;

    await submitVerificationRequest(currentUser.id, category, docProof.trim());
    setVerifyMsg('Verification application submitted! Administrators will review shortly.');
    setTimeout(() => {
      setActiveModal(null);
      setVerifyMsg('');
    }, 2000);
  };

  const handleSendComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !complaintText.trim()) return;

    await submitUserComplaint(currentUser.id, complaintText.trim(), 'General');
    setComplaintMsg('Complaint received. Support team will respond via email.');
    setTimeout(() => {
      setActiveModal(null);
      setComplaintMsg('');
    }, 2000);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !deletePass.trim()) return;

    const res = await deleteUserAccount(currentUser.id, deletePass.trim());
    if (res.success) {
      logout();
    } else {
      setDeleteMsg(res.error || 'Failed to delete account.');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-24 text-white p-2">
      <h2 className="text-xl font-black text-emerald-400 mb-4 px-2">Settings & Privacy</h2>

      <div className="flex flex-col gap-2">
        {/* Verification Request */}
        <button
          onClick={() => setActiveModal('verify')}
          className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-left hover:bg-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Apply for Account Verification</div>
              <div className="text-xs text-slate-400">Get Blue, Gold, Music, or Creator Badge</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* Submit Complaint */}
        <button
          onClick={() => setActiveModal('complaint')}
          className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-left hover:bg-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Help & Complaint Desk</div>
              <div className="text-xs text-slate-400">Submit feedback or report an issue</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* Delete Account */}
        <button
          onClick={() => setActiveModal('delete')}
          className="p-4 bg-slate-900 border border-rose-500/20 rounded-2xl flex items-center justify-between text-left hover:bg-rose-500/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-rose-400">Delete Account</div>
              <div className="text-xs text-slate-400">Permanently erase profile & content</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-rose-400 font-bold text-sm hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Logout of Account
        </button>
      </div>

      {/* Verification Request Modal */}
      {activeModal === 'verify' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-slate-900 border border-emerald-500/20 rounded-3xl p-5 text-white">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-emerald-400 mb-3">Request Verification Badge</h3>
            {verifyMsg ? (
              <div className="text-xs text-emerald-400 p-3 bg-emerald-500/10 rounded-xl">{verifyMsg}</div>
            ) : (
              <form onSubmit={handleApplyVerification} className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Public Figure">Public Figure / Influencer</option>
                    <option value="Music Artist">Official Music Artist</option>
                    <option value="Creator">Digital Creator</option>
                    <option value="Gaming">Gaming / Streamer</option>
                    <option value="Business">Registered Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Government ID / Official Document URL</label>
                  <input
                    type="text"
                    value={docProof}
                    onChange={(e) => setDocProof(e.target.value)}
                    placeholder="https://example.com/id.pdf or image link"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:brightness-110 mt-1"
                >
                  Submit Application
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Complaint Modal */}
      {activeModal === 'complaint' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-slate-900 border border-emerald-500/20 rounded-3xl p-5 text-white">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-sky-400 mb-3">Submit Support Inquiry</h3>
            {complaintMsg ? (
              <div className="text-xs text-emerald-400 p-3 bg-emerald-500/10 rounded-xl">{complaintMsg}</div>
            ) : (
              <form onSubmit={handleSendComplaint} className="flex flex-col gap-3 text-xs">
                <textarea
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="Describe your issue or feedback..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none resize-none"
                  required
                />
                <button
                  type="submit"
                  className="py-2.5 bg-sky-500 text-slate-950 font-bold rounded-xl hover:brightness-110"
                >
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {activeModal === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-slate-900 border border-rose-500/30 rounded-3xl p-5 text-white">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-rose-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-5 h-5" /> Confirm Account Deletion
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              This action is permanent. All your posts, messages, and followers will be erased.
            </p>

            {deleteMsg && <div className="text-xs text-rose-400 mb-3 p-2 bg-rose-500/10 rounded-lg">{deleteMsg}</div>}

            <form onSubmit={handleDeleteAccount} className="flex flex-col gap-3 text-xs">
              <input
                type="password"
                value={deletePass}
                onChange={(e) => setDeletePass(e.target.value)}
                placeholder="Enter password to confirm"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                required
              />
              <button
                type="submit"
                className="py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700"
              >
                Permanently Delete Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
