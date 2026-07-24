import React, { useState } from 'react';
import { X, Lock, ShieldAlert, AlertCircle } from 'lucide-react';
import { adminLogin } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface AdminLoginModalProps {
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose }) => {
  const { setIsAdminLoggedIn, setActiveScreen } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Password required.');
      return;
    }

    setLoading(true);
    const res = await adminLogin(password);
    setLoading(false);

    if (res.success) {
      setIsAdminLoggedIn(true);
      setActiveScreen('admin');
      onClose();
    } else {
      setError(res.error || 'Incorrect Password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-sm bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-wider text-emerald-400 uppercase">ADMIN.COM</h2>
          <p className="text-xs text-slate-400">Restricted Administrator Authentication</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Password Only Form as requested */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (admin.635)"
                className="w-full pl-10 pr-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white placeholder-slate-600 outline-none"
                required
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Login to Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};
