import React, { useState } from 'react';
import { LeafLogo } from './LeafLogo';
import { MoreVertical } from 'lucide-react';
import { LoginModal } from './LoginModal';
import { SignUpModal } from './SignUpModal';
import { AdminLoginModal } from './AdminLoginModal';

export const WelcomeScreen: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between bg-slate-950 text-white p-6 select-none overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none top-1/4 -left-10" />
      <div className="absolute w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none bottom-1/4 -right-10" />

      {/* Top Bar with Three Dot Menu in Top Right Corner */}
      <div className="w-full max-w-md flex justify-between items-center z-20 pt-2">
        <div className="w-8" />
        <button
          onClick={() => setShowAdminLogin(true)}
          className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title="Admin Menu"
        >
          <MoreVertical className="w-6 h-6" />
        </button>
      </div>

      {/* Top Center Logo & Title */}
      <div className="flex flex-col items-center gap-4 my-auto z-10">
        <LeafLogo size="2xl" />
        <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-100 uppercase">
          INSTIK <span className="text-emerald-500 font-light">CHAT</span>
        </h1>
      </div>

      {/* Middle/Bottom Buttons */}
      <div className="w-full max-w-md flex flex-col gap-4 mb-12 z-10">
        <button
          onClick={() => setShowLogin(true)}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-lg shadow-lg shadow-emerald-950/50 hover:brightness-110 active:scale-[0.98] transition-all"
        >
          Login
        </button>

        <button
          onClick={() => setShowSignUp(true)}
          className="w-full py-4 px-6 rounded-2xl bg-slate-900/90 border border-emerald-500/30 text-emerald-400 font-bold text-lg hover:bg-slate-800 active:scale-[0.98] transition-all"
        >
          Sign Up
        </button>
      </div>

      {/* Modals */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onOpenSignUp={() => { setShowLogin(false); setShowSignUp(true); }} />}
      {showSignUp && <SignUpModal onClose={() => setShowSignUp(false)} onOpenLogin={() => { setShowSignUp(false); setShowLogin(true); }} />}
      {showAdminLogin && <AdminLoginModal onClose={() => setShowAdminLogin(false)} />}
    </div>
  );
};
