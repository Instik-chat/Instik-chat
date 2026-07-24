import React from 'react';
import { LeafLogo } from './LeafLogo';

export const Splash: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white select-none overflow-hidden">
      {/* Background Subtle Green Glow */}
      <div className="absolute w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      {/* Centered App Logo and Title Only */}
      <div className="flex flex-col items-center gap-6 z-10">
        <LeafLogo size="3xl" />
        <h1 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 uppercase">
          INSTIK <span className="text-emerald-500 font-light">CHAT</span>
        </h1>
      </div>
    </div>
  );
};
