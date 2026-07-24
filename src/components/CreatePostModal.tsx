import React, { useState } from 'react';
import { X, Image as ImageIcon, Video, Hash, Plus, AlertCircle } from 'lucide-react';
import { createPost } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onPostCreated }) => {
  const { currentUser } = useAuth();
  const [caption, setCaption] = useState('');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [hashtagsInput, setHashtagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddMedia = () => {
    if (mediaUrlInput.trim()) {
      setMediaUrls([...mediaUrls, mediaUrlInput.trim()]);
      setMediaUrlInput('');
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!caption.trim() && mediaUrls.length === 0) {
      setError('Please add a caption or media to post.');
      return;
    }

    const tags = hashtagsInput
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.startsWith('#') || t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    setLoading(true);
    await createPost(currentUser.id, caption.trim(), mediaUrls, 'image', tags);
    setLoading(false);

    onPostCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0F0F0F] border border-[#1A1A1A] rounded-3xl p-6 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#121212] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xs font-black uppercase tracking-widest text-[#34D399] mb-4">Create New Post</h2>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              rows={3}
              className="w-full p-3 bg-[#121212] border border-[#1F1F1F] focus:border-[#34D399] rounded-xl text-sm text-white placeholder-gray-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Add Media URL (Photos/Videos)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={mediaUrlInput}
                onChange={(e) => setMediaUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-2 bg-[#121212] border border-[#1F1F1F] focus:border-[#34D399] rounded-xl text-xs text-white placeholder-gray-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddMedia}
                className="px-3 py-2 bg-[#121212] hover:bg-[#1A1A1A] border border-[#1F1F1F] text-[#34D399] font-bold text-xs rounded-xl flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          {/* Media Previews */}
          {mediaUrls.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-2">
              {mediaUrls.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-[#1F1F1F]">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(idx)}
                    className="absolute top-1 right-1 bg-black/80 p-1 rounded-full text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Hashtags (space separated)</label>
            <div className="relative">
              <Hash className="absolute left-3 top-2.5 w-4 h-4 text-[#34D399]" />
              <input
                type="text"
                value={hashtagsInput}
                onChange={(e) => setHashtagsInput(e.target.value)}
                placeholder="tech leaf nature chat"
                className="w-full pl-9 pr-3 py-2 bg-[#121212] border border-[#1F1F1F] focus:border-[#34D399] rounded-xl text-xs text-white placeholder-gray-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#34D399] text-black font-bold rounded-xl shadow-lg hover:bg-[#2EB886] transition-all disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Share Post'}
          </button>
        </form>
      </div>
    </div>
  );
};
