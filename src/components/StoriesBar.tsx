import React, { useState } from 'react';
import { Plus, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Story } from '../types';
import { useAuth } from '../context/AuthContext';
import { uploadStory } from '../services/api';
import { UserBadge } from './UserBadge';

interface StoriesBarProps {
  stories: Story[];
  onRefresh: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({ stories, onRefresh }) => {
  const { currentUser } = useAuth();
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newStoryUrl, setNewStoryUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newStoryUrl.trim()) return;

    setUploading(true);
    await uploadStory(currentUser.id, newStoryUrl.trim(), 'image');
    setUploading(false);
    setNewStoryUrl('');
    setShowUploadModal(false);
    onRefresh();
  };

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  return (
    <div className="w-full py-3 px-2 border-b border-[#1A1A1A] bg-[#050505]">
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-none px-2">
        {/* Your Story / Add Story Button */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowUploadModal(true)}
            className="relative w-16 h-16 rounded-full p-[2px] border-2 border-[#34D399] group cursor-pointer"
          >
            <div className="w-full h-full rounded-full bg-[#121212] p-0.5 relative overflow-hidden flex items-center justify-center">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt="Your avatar"
                className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-[#34D399] text-black flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
            </div>
          </button>
          <span className="text-[10px] text-gray-400 font-medium">Your Story</span>
        </div>

        {/* User Stories */}
        {stories.map((story, idx) => (
          <div
            key={story.id}
            onClick={() => setActiveStoryIndex(idx)}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full p-[2px] border-2 border-[#34D399] hover:scale-105 transition-transform">
              <img
                src={story.userAvatar}
                alt={story.userName}
                className="w-full h-full rounded-full object-cover p-0.5 bg-[#121212]"
              />
            </div>
            <span className="text-[10px] text-white font-medium max-w-[64px] truncate">
              {story.userName}
            </span>
          </div>
        ))}
      </div>

      {/* Upload Story Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#0F0F0F] border border-[#1A1A1A] rounded-2xl p-5 text-white">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-[#34D399] mb-3">Add to Story</h3>
            <form onSubmit={handleCreateStory} className="flex flex-col gap-3">
              <input
                type="text"
                value={newStoryUrl}
                onChange={(e) => setNewStoryUrl(e.target.value)}
                placeholder="Paste Image URL or select asset..."
                className="w-full px-3 py-2 bg-[#121212] border border-[#1F1F1F] rounded-xl text-xs text-white outline-none focus:border-[#34D399]"
                required
              />
              {newStoryUrl && (
                <img src={newStoryUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
              )}
              <button
                type="submit"
                disabled={uploading}
                className="py-2.5 bg-[#34D399] text-black font-bold rounded-xl text-xs hover:bg-[#2EB886] disabled:opacity-50"
              >
                {uploading ? 'Publishing...' : 'Publish Story'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Full Screen Story Viewer */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 text-white animate-fadeIn">
          <div className="relative w-full max-w-md h-full md:h-[90vh] bg-[#050505] rounded-none md:rounded-3xl overflow-hidden flex flex-col justify-between border border-[#1A1A1A]">
            {/* Top Progress Bar & Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-[#34D399] animate-[storyProgress_5s_linear_forwards]" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={activeStory.userAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  <div className="flex items-center text-xs font-bold">
                    <span>{activeStory.userName}</span>
                    <UserBadge badgeType={activeStory.userBadge} />
                  </div>
                </div>
                <button
                  onClick={() => setActiveStoryIndex(null)}
                  className="p-1 text-gray-300 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Main Media Content */}
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={activeStory.mediaUrl}
                alt="Story content"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Controls Left/Right */}
            <button
              onClick={() => setActiveStoryIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActiveStoryIndex((prev) => (prev !== null && prev < stories.length - 1 ? prev + 1 : prev))}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Bottom View Count */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 text-xs text-white/80 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Eye className="w-3.5 h-3.5" />
              <span>{activeStory.viewCount || 24} views</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
