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
    <div className="relative min-h-screen flex flex-col items-center justify-between bg-[#050505] text-white p-6 select-none overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute w-80 h-80 bg-[#34D399]/5 rounded-full blur-3xl pointer-events-none top-1/4 -left-10" />
      <div className="absolute w-80 h-80 bg-[#34D399]/5 rounded-full blur-3xl pointer-events-none bottom-1/4 -right-10" />

      {/* Top Bar with Three Dot Menu in Top Right Corner */}
      <div className="w-full max-w-md flex justify-between items-center z-20 pt-2">
        <div className="w-8" />
        <button
          onClick={() => setShowAdminLogin(true)}
          className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-[#0F0F0F] transition-colors"
          title="Admin Menu"
        >
          <MoreVertical className="w-6 h-6" />
        </button>
      </div>

      {/* Top Center Logo & Title */}
      <div className="flex flex-col items-center gap-4 my-auto z-10">
        <LeafLogo size="2xl" />
        <h1 className="text-3xl font-black tracking-widest text-white uppercase">
          INSTIK <span className="text-[#34D399] font-light">CHAT</span>
        </h1>
      </div>

      {/* Middle/Bottom Buttons */}
      <div className="w-full max-w-md flex flex-col gap-4 mb-12 z-10">
        <button
          onClick={() => setShowLogin(true)}
          className="w-full py-4 px-6 rounded-2xl bg-[#34D399] text-black font-bold text-lg shadow-lg hover:bg-[#2EB886] active:scale-[0.98] transition-all"
        >
          Login
        </button>

        <button
          onClick={() => setShowSignUp(true)}
          className="w-full py-4 px-6 rounded-2xl bg-[#0F0F0F] border border-[#1A1A1A] text-[#34D399] font-bold text-lg hover:bg-[#121212] active:scale-[0.98] transition-all"
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
