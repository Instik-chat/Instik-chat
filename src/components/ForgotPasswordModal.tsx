import React, { useState } from 'react';
import { X, Mail, Phone, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { requestForgotOtp, verifyForgotOtp } from '../services/api';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [contactValue, setContactValue] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [userId, setUserId] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!contactValue.trim()) {
      setError(`Please enter your registered ${method === 'email' ? 'Email Address' : 'Phone Number'}.`);
      return;
    }

    setLoading(true);
    const res = await requestForgotOtp(method, contactValue.trim());
    setLoading(false);

    if (res.success && res.userId) {
      setUserId(res.userId);
      setSuccessMsg(res.message || 'Verification code sent!');
      if (res.message && res.message.includes('Demo Code:')) {
        const parts = res.message.split('Demo Code:');
        if (parts[1]) setDemoCode(parts[1].trim().replace(')', ''));
      }
      setStep(2);
    } else {
      setError(res.error || 'User not found.');
    }
  };

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code || !newPassword) {
      setError('Please fill in the verification code and new password.');
      return;
    }

    setLoading(true);
    const res = await verifyForgotOtp(userId, code, newPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Password successfully updated! You can now login.');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(res.error || 'Verification failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/20 rounded-3xl p-6 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-center text-emerald-400 mb-1">Reset Password</h2>
        <p className="text-xs text-center text-slate-400 mb-6">
          {step === 1 ? 'Select verification method' : 'Enter code and new password'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => { setMethod('email'); setContactValue(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${method === 'email' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
              >
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
              <button
                type="button"
                onClick={() => { setMethod('phone'); setContactValue(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${method === 'phone' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
              >
                <Phone className="w-3.5 h-3.5" /> Phone
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {method === 'email' ? 'Registered Email Address' : 'Registered Phone Number'}
              </label>
              <input
                type={method === 'email' ? 'email' : 'tel'}
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={method === 'email' ? 'elena@instik.chat' : '+12345678901'}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white placeholder-slate-600 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold rounded-xl shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyReset} className="flex flex-col gap-4">
            {demoCode && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs text-center font-mono">
                Verification Code: <span className="font-bold text-white tracking-widest">{demoCode}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">6-Digit Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white text-center font-mono tracking-widest outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-500" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold rounded-xl shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Set New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
