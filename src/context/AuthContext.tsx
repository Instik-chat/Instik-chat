import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
  activeScreen: 'splash' | 'welcome' | 'app' | 'admin';
  setActiveScreen: (screen: 'splash' | 'welcome' | 'app' | 'admin') => void;
  activeTab: 'home' | 'reels' | 'chat' | 'profile' | 'search' | 'notifications' | 'settings';
  setActiveTab: (tab: 'home' | 'reels' | 'chat' | 'profile' | 'search' | 'notifications' | 'settings') => void;
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [activeScreen, setActiveScreen] = useState<'splash' | 'welcome' | 'app' | 'admin'>('splash');
  const [activeTab, setActiveTab] = useState<'home' | 'reels' | 'chat' | 'profile' | 'search' | 'notifications' | 'settings'>('home');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Splash screen auto-timer: exactly 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveScreen((prev) => (prev === 'splash' ? 'welcome' : prev));
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const refreshUser = async () => {
    if (currentUser?.id) {
      try {
        const res = await fetch(`/api/users/${currentUser.id}`);
        if (res.ok) {
          const fresh = await res.json();
          setCurrentUser(fresh);
        }
      } catch (err) {
        console.error('Failed to refresh user:', err);
      }
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdminLoggedIn(false);
    setActiveScreen('welcome');
    setActiveTab('home');
    setSelectedUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        activeScreen,
        setActiveScreen,
        activeTab,
        setActiveTab,
        selectedUserId,
        setSelectedUserId,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
