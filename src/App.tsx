import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Splash } from './components/Splash';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { Navigation } from './components/Navigation';
import { HomeFeed } from './components/tabs/HomeFeed';
import { ReelsFeed } from './components/tabs/ReelsFeed';
import { ChatSystem } from './components/tabs/ChatSystem';
import { SearchDiscovery } from './components/tabs/SearchDiscovery';
import { ProfileScreen } from './components/tabs/ProfileScreen';
import { NotificationsScreen } from './components/tabs/NotificationsScreen';
import { SettingsScreen } from './components/tabs/SettingsScreen';
import { CreatePostModal } from './components/CreatePostModal';

const AppContent: React.FC = () => {
  const { activeScreen, activeTab, currentUser } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);

  if (activeScreen === 'splash') {
    return <Splash />;
  }

  if (activeScreen === 'welcome') {
    return <WelcomeScreen />;
  }

  if (activeScreen === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-sans antialiased selection:bg-[#34D399] selection:text-black">
      <Navigation onOpenCreatePost={() => setShowCreatePost(true)} unreadCount={1} />

      <main className="pt-2">
        {activeTab === 'home' && <HomeFeed key={feedRefreshKey} />}
        {activeTab === 'reels' && <ReelsFeed />}
        {activeTab === 'chat' && <ChatSystem />}
        {activeTab === 'search' && <SearchDiscovery />}
        {activeTab === 'profile' && <ProfileScreen />}
        {activeTab === 'notifications' && <NotificationsScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>

      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onPostCreated={() => setFeedRefreshKey((prev) => prev + 1)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
