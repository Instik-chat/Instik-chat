import React from 'react';
import { LeafLogo } from './LeafLogo';
import { Home, Film, MessageSquare, Search, User, Bell, Settings, PlusSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavigationProps {
  onOpenCreatePost: () => void;
  unreadCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({ onOpenCreatePost, unreadCount = 0 }) => {
  const { activeTab, setActiveTab, currentUser } = useAuth();

  return (
    <>
      {/* Top Mobile/Desktop Bar */}
      <header className="sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-[#1A1A1A] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <LeafLogo size="sm" showText={true} />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCreatePost}
            className="px-3.5 py-1.5 rounded-full bg-[#34D399] text-black font-bold hover:bg-[#2EB886] transition-all flex items-center gap-1.5 text-xs tracking-wider uppercase"
          >
            <PlusSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Create</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#121212] transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#34D399] rounded-full ring-2 ring-[#050505]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#121212] transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Bottom Floating Navigation Bar (Mobile First) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#050505]/95 backdrop-blur-lg border-t border-[#1A1A1A] px-3 py-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${
              activeTab === 'home' ? 'text-[#34D399] font-bold scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('reels')}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${
              activeTab === 'reels' ? 'text-[#34D399] font-bold scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Film className="w-5 h-5" />
            <span className="text-[10px]">Reels</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${
              activeTab === 'search' ? 'text-[#34D399] font-bold scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px]">Explore</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`relative flex flex-col items-center gap-1 p-2 transition-all ${
              activeTab === 'chat' ? 'text-[#34D399] font-bold scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px]">Chats</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${
              activeTab === 'profile' ? 'text-[#34D399] font-bold scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt=""
                className={`w-5 h-5 rounded-full object-cover border ${
                  activeTab === 'profile' ? 'border-[#34D399]' : 'border-transparent'
                }`}
              />
            ) : (
              <User className="w-5 h-5" />
            )}
            <span className="text-[10px]">Profile</span>
          </button>
        </div>
      </nav>
    </>
  );
};
