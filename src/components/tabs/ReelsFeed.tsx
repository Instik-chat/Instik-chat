import React, { useState, useEffect } from 'react';
import { Reel } from '../../types';
import { fetchReels, uploadReel } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { UserBadge } from '../UserBadge';
import { Heart, MessageCircle, Share2, Music, Plus, X, Lock, Globe, Users } from 'lucide-react';

export const ReelsFeed: React.FC = () => {
  const { currentUser } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [musicTitle, setMusicTitle] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>('public');
  const [uploading, setUploading] = useState(false);

  const loadReels = async () => {
    const data = await fetchReels();
    setReels(data);
  };

  useEffect(() => {
    loadReels();
  }, []);

  const currentReel = reels[activeIndex];

  const handleUploadReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !videoUrl.trim()) return;

    const tags = hashtags.split(' ').filter((t) => t.length > 0);
    setUploading(true);
    await uploadReel({
      userId: currentUser.id,
      videoUrl: videoUrl.trim(),
      caption: caption.trim(),
      hashtags: tags,
      musicTitle: musicTitle.trim() || undefined,
      privacy,
    });
    setUploading(false);
    setShowUploadModal(false);
    setVideoUrl('');
    setCaption('');
    setHashtags('');
    setMusicTitle('');
    loadReels();
  };

  const handleLikeReel = (reelId: string) => {
    if (!currentUser) return;
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const hasLiked = r.likes.includes(currentUser.id);
          return {
            ...r,
            likes: hasLiked ? r.likes.filter((id) => id !== currentUser.id) : [...r.likes, currentUser.id],
          };
        }
        return r;
      })
    );
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-[calc(100vh-120px)] bg-[#050505] overflow-hidden text-white rounded-3xl border border-[#1A1A1A] shadow-2xl my-2">
      {/* Top Overlay Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-center bg-[#050505]/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#1F1F1F]">
        <span className="font-black text-xs tracking-widest text-[#34D399] uppercase">Instik Reels</span>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-3.5 py-1.5 bg-[#34D399] text-black font-bold rounded-full text-xs flex items-center gap-1 hover:bg-[#2EB886] transition-all"
        >
          <Plus className="w-4 h-4" /> Upload Reel
        </button>
      </div>

      {currentReel ? (
        <div className="relative w-full h-full flex items-center justify-center bg-[#0A0A0A]">
          <video
            src={currentReel.videoUrl}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />

          {/* Right Action Icons */}
          <div className="absolute right-4 bottom-20 z-30 flex flex-col items-center gap-5">
            <button
              onClick={() => handleLikeReel(currentReel.id)}
              className="flex flex-col items-center gap-1 text-white hover:text-rose-400 transition-colors group"
            >
              <div className="p-3 bg-black/50 rounded-full backdrop-blur-md border border-white/10">
                <Heart className={`w-6 h-6 ${currentUser && currentReel.likes.includes(currentUser.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
              </div>
              <span className="text-xs font-bold">{currentReel.likes.length}</span>
            </button>

            <button className="flex flex-col items-center gap-1 text-white hover:text-[#34D399] transition-colors group">
              <div className="p-3 bg-black/50 rounded-full backdrop-blur-md border border-white/10">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold">{currentReel.comments.length}</span>
            </button>

            <button className="flex flex-col items-center gap-1 text-white hover:text-[#34D399] transition-colors group">
              <div className="p-3 bg-black/50 rounded-full backdrop-blur-md border border-white/10">
                <Share2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold">{currentReel.sharesCount}</span>
            </button>
          </div>

          {/* Bottom Left Info Overlay */}
          <div className="absolute left-4 bottom-6 right-20 z-30 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <img src={currentReel.userAvatar} alt="" className="w-9 h-9 rounded-full object-cover border border-[#34D399]" />
              <div className="flex items-center text-sm font-bold">
                <span>{currentReel.userName}</span>
                <UserBadge badgeType={currentReel.userBadge} />
              </div>
            </div>

            <p className="text-xs text-gray-200 line-clamp-2">{currentReel.caption}</p>

            {currentReel.musicTitle && (
              <div className="flex items-center gap-2 text-xs text-[#34D399] font-semibold bg-[#0F1F18] px-3 py-1.5 rounded-full w-fit backdrop-blur-sm border border-[#34D399]/30">
                <Music className="w-3.5 h-3.5 animate-spin" />
                <span className="truncate max-w-[180px]">{currentReel.musicTitle}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs">
          No reels found. Upload the first Reel!
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#0F0F0F] border border-[#1A1A1A] rounded-3xl p-5 text-white">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-[#34D399] mb-3">Upload Reel / Short Video</h3>
            <form onSubmit={handleUploadReel} className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Direct Video URL (.mp4 / stream)</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://assets.mixkit.co/..."
                  className="w-full px-3 py-2 bg-[#121212] border border-[#1F1F1F] rounded-xl text-xs text-white outline-none focus:border-[#34D399]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Caption</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Describe your Reel..."
                  className="w-full px-3 py-2 bg-[#121212] border border-[#1F1F1F] rounded-xl text-xs text-white outline-none focus:border-[#34D399]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Music Track Title</label>
                <input
                  type="text"
                  value={musicTitle}
                  onChange={(e) => setMusicTitle(e.target.value)}
                  placeholder="Original Audio - Artist"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#1F1F1F] rounded-xl text-xs text-white outline-none focus:border-[#34D399]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Privacy Setting</label>
                <div className="flex bg-[#121212] p-1 rounded-xl border border-[#1F1F1F]">
                  <button
                    type="button"
                    onClick={() => setPrivacy('public')}
                    className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 ${privacy === 'public' ? 'bg-[#34D399] text-black' : 'text-gray-400'}`}
                  >
                    <Globe className="w-3 h-3" /> Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrivacy('followers')}
                    className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 ${privacy === 'followers' ? 'bg-[#34D399] text-black' : 'text-gray-400'}`}
                  >
                    <Users className="w-3 h-3" /> Followers
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrivacy('private')}
                    className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 ${privacy === 'private' ? 'bg-[#34D399] text-black' : 'text-gray-400'}`}
                  >
                    <Lock className="w-3 h-3" /> Private
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="py-2.5 bg-[#34D399] text-black font-bold rounded-xl text-xs hover:bg-[#2EB886] disabled:opacity-50 mt-1"
              >
                {uploading ? 'Uploading Video...' : 'Publish Reel'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
