import React, { useState } from 'react';
import { X, User, Mail, Phone, Lock, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { signUpUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface SignUpModalProps {
  onClose: () => void;
  onOpenLogin: () => void;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({ onClose, onOpenLogin }) => {
  const { setCurrentUser, setActiveScreen } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1 Validation
  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!username.trim() || username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    setStep(2);
  };

  // Step 2 Validation
  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (contactType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('Please enter a valid email address.');
        return;
      }
    } else {
      if (!phone.trim() || phone.trim().length < 7) {
        setError('Please enter a valid phone number.');
        return;
      }
    }
    setStep(3);
  };

  // Step 3 Submission
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await signUpUser({
      fullName: fullName.trim(),
      username: username.trim(),
      email: contactType === 'email' ? email.trim() : undefined,
      phone: contactType === 'phone' ? phone.trim() : undefined,
      password: password,
    });
    setLoading(false);

    if (res.success && res.user) {
      setCurrentUser(res.user);
      setActiveScreen('app');
      onClose();
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0F0F0F] border border-[#1A1A1A] rounded-3xl p-6 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#121212] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step > 1 && (
          <button
            onClick={() => setStep((step - 1) as any)}
            className="absolute top-5 left-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#121212] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Step Indicator */}
        <div className="flex justify-center items-center gap-2 mb-4 mt-2">
          <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? 'w-8 bg-[#34D399]' : 'w-2 bg-[#1A1A1A]'}`} />
          <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? 'w-8 bg-[#34D399]' : 'w-2 bg-[#1A1A1A]'}`} />
          <div className={`h-1.5 rounded-full transition-all ${step >= 3 ? 'w-8 bg-[#34D399]' : 'w-2 bg-[#1A1A1A]'}`} />
        </div>

        <h2 className="text-xl font-black text-center text-[#34D399] tracking-wider uppercase mb-1">Create Account</h2>
        <p className="text-xs text-center text-gray-400 mb-6">
          {step === 1 && 'Step 1 of 3: Personal Info'}
          {step === 2 && 'Step 2 of 3: Contact Info'}
          {step === 3 && 'Step 3 of 3: Password'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleNextStep1} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[#34D399]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-[#1F1F1F] focus:border-[#34D399] rounded-xl text-sm text-white placeholder-gray-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[#34D399]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alex_leaf"
                  className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-[#1F1F1F] focus:border-[#34D399] rounded-xl text-sm text-white placeholder-gray-500 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 bg-[#34D399] text-black font-bold rounded-xl shadow-lg hover:bg-[#2EB886] transition-all"
            >
              Next
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleNextStep2} className="flex flex-col gap-4">
            <div className="flex bg-[#121212] p-1 rounded-xl border border-[#1F1F1F]">
              <button
                type="button"
                onClick={() => setContactType('email')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${contactType === 'email' ? 'bg-[#34D399] text-black' : 'text-gray-400'}`}
              >
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
              <button
                type="button"
                onClick={() => setContactType('phone')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${contactType === 'phone' ? 'bg-[#34D399] text-black' : 'text-gray-400'}`}
              >
                <Phone className="w-3.5 h-3.5" /> Phone
              </button>
            </div>

            {contactType === 'email' ? (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#34D399]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-[#1F1F1F] focus:border-[#34D399] rounded-xl text-sm text-white placeholder-gray-500 outline-none"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-[#34D399]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-[#1F1F1F] focus:border-[#34D399] rounded-xl text-sm text-white placeholder-gray-500 outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-3.5 bg-[#34D399] text-black font-bold rounded-xl shadow-lg hover:bg-[#2EB886] transition-all"
            >
              Next
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#34D399]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-[#1F1F1F] focus:border-[#34D399] rounded-xl text-sm text-white placeholder-gray-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#34D399]" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-[#1F1F1F] focus:border-[#34D399] rounded-xl text-sm text-white placeholder-gray-500 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-[#34D399] text-black font-bold rounded-xl shadow-lg hover:bg-[#2EB886] transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-gray-400">
          Already have an account?{' '}
          <button onClick={onOpenLogin} className="text-[#34D399] font-semibold hover:underline">
            Login
          </button>
        </div>
      </div>
    </div>
  );
};
