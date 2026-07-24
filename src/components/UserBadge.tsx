import React from 'react';
import { Check, Music, Sparkles, Gamepad2, Briefcase, Crown, ShieldCheck, Award } from 'lucide-react';

interface UserBadgeProps {
  badgeType?: 'blue' | 'gold' | 'music' | 'creator' | 'gaming' | 'business' | 'premium' | 'vip' | 'official' | 'custom';
  customIconUrl?: string;
  className?: string;
}

export const UserBadge: React.FC<UserBadgeProps> = ({ badgeType, customIconUrl, className = 'w-4 h-4 ml-1 inline-block' }) => {
  if (!badgeType) return null;

  if (badgeType === 'custom' && customIconUrl) {
    return (
      <img
        src={customIconUrl}
        alt="Custom Badge"
        className={`${className} object-contain inline-block`}
        referrerPolicy="no-referrer"
      />
    );
  }

  switch (badgeType) {
    case 'gold':
      return (
        <span className={`inline-flex items-center justify-center bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 rounded-full p-0.5 shadow-sm shadow-amber-500/50 ${className}`} title="Gold Verified Badge">
          <Check className="w-3 h-3 stroke-[3]" />
        </span>
      );
    case 'music':
      return (
        <span className={`inline-flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full p-0.5 shadow-sm shadow-purple-500/50 ${className}`} title="Official Music Artist">
          <Music className="w-3 h-3" />
        </span>
      );
    case 'creator':
      return (
        <span className={`inline-flex items-center justify-center bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 rounded-full p-0.5 shadow-sm shadow-emerald-500/50 ${className}`} title="Verified Creator">
          <Sparkles className="w-3 h-3" />
        </span>
      );
    case 'gaming':
      return (
        <span className={`inline-flex items-center justify-center bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full p-0.5 shadow-sm shadow-rose-500/50 ${className}`} title="Verified Gaming Creator">
          <Gamepad2 className="w-3 h-3" />
        </span>
      );
    case 'business':
      return (
        <span className={`inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full p-0.5 shadow-sm shadow-blue-500/50 ${className}`} title="Official Business">
          <Briefcase className="w-3 h-3" />
        </span>
      );
    case 'premium':
      return (
        <span className={`inline-flex items-center justify-center bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 rounded-full p-0.5 shadow-sm ${className}`} title="Premium Subscriber">
          <Crown className="w-3 h-3" />
        </span>
      );
    case 'vip':
      return (
        <span className={`inline-flex items-center justify-center bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-full p-0.5 shadow-sm ${className}`} title="VIP Badge">
          <Award className="w-3 h-3" />
        </span>
      );
    case 'official':
      return (
        <span className={`inline-flex items-center justify-center bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 rounded-full p-0.5 shadow-sm ${className}`} title="Official INSTIK Badge">
          <ShieldCheck className="w-3 h-3" />
        </span>
      );
    case 'blue':
    default:
      return (
        <span className={`inline-flex items-center justify-center bg-sky-500 text-white rounded-full p-0.5 shadow-sm shadow-sky-500/50 ${className}`} title="Verified Account">
          <Check className="w-3 h-3 stroke-[3]" />
        </span>
      );
  }
};
