import React from 'react';

interface LeafLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showText?: boolean;
  className?: string;
}

export const LeafLogo: React.FC<LeafLogoProps> = ({ size = 'md', showText = false, className = '' }) => {
  const sizeMap = {
    sm: { icon: 'w-6 h-6', text: 'text-base' },
    md: { icon: 'w-8 h-8', text: 'text-xl' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl' },
    '2xl': { icon: 'w-24 h-24', text: 'text-4xl' },
    '3xl': { icon: 'w-32 h-32', text: 'text-5xl' },
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative flex items-center justify-center ${dim.icon} rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-800 p-1.5 shadow-lg shadow-emerald-900/30 border border-emerald-400/30`}>
        {/* Modern Leaf Symbol Vector */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-emerald-100 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Leaf Body */}
          <path
            d="M85 15C85 15 50 20 30 42C12 62 10 82 25 88C40 94 62 82 78 60C92 42 85 15 85 15Z"
            fill="url(#leafGradient)"
          />
          {/* Central Vein Connection */}
          <path
            d="M20 85Q45 60 85 15"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Side Veins */}
          <path
            d="M38 64Q52 58 60 62"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M50 49Q64 42 72 45"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M62 34Q74 27 80 30"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Growth Sparkle Accent */}
          <circle cx="82" cy="18" r="3" fill="#A7F3D0" />

          <defs>
            <linearGradient id="leafGradient" x1="15" y1="85" x2="85" y2="15" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10B981" />
              <stop offset="0.5" stopColor="#059669" />
              <stop offset="1" stopColor="#34D399" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col justify-center">
          <span className={`font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 ${dim.text}`}>
            INSTIK<span className="text-emerald-500 ml-1.5 font-light">CHAT</span>
          </span>
        </div>
      )}
    </div>
  );
};
