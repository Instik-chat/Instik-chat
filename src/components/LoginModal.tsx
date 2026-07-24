import React, { useState } from 'react';
import { X, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginModalProps {
  onClose: () => void;
  onOpenSignUp: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onOpenSignUp }) => {
  const { setCurrentUser, setActiveScreen } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your Username, Email, or Phone, and Password.');
      return;
    }

    setLoading(true);
    const res = await loginUser(identifier.trim(), password.trim());
    setLoading(false);

    if (res.success && res.user) {
      setCurrentUser(res.user);
      setActiveScreen('app');
      onClose();
    } else {
      setError(res.error || 'Login failed. Please check your details.');
    }
  };

  if (showForgotPassword) {
    return <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/20 rounded-3xl p-6 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-center text-emerald-400 mb-1">Welcome Back</h2>
        <p className="text-xs text-center text-slate-400 mb-6">Login to your INSTIK CHAT account</p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Username / Email / Phone
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-500" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Username, Email or Phone"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-xs text-emerald-400 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-950/50 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <button onClick={onOpenSignUp} className="text-emerald-400 font-semibold hover:underline">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};
