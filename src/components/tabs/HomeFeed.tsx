import React, { useState, useEffect } from 'react';
import { StoriesBar } from '../StoriesBar';
import { Post, Story } from '../../types';
import { fetchPosts, fetchStories, toggleLikePost, toggleSavePost, addComment, reportContent } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { UserBadge } from '../UserBadge';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Send, AlertTriangle } from 'lucide-react';

export const HomeFeed: React.FC = () => {
  const { currentUser, setSelectedUserId, setActiveTab } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [reportModalPostId, setReportModalPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Spam or misleading');

  const loadFeedData = async () => {
    const [p, s] = await Promise.all([fetchPosts(), fetchStories()]);
    setPosts(p);
    setStories(s);
  };

  useEffect(() => {
    loadFeedData();
  }, []);

  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    const res = await toggleLikePost(postId, currentUser.id);
    if (res.success) {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const hasLiked = p.likes.includes(currentUser.id);
            return {
              ...p,
              likes: hasLiked ? p.likes.filter((id) => id !== currentUser.id) : [...p.likes, currentUser.id],
            };
          }
          return p;
        })
      );
    }
  };

  const handleSave = async (postId: string) => {
    if (!currentUser) return;
    const res = await toggleSavePost(postId, currentUser.id);
    if (res.success) {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const hasSaved = p.savedBy.includes(currentUser.id);
            return {
              ...p,
              savedBy: hasSaved ? p.savedBy.filter((id) => id !== currentUser.id) : [...p.savedBy, currentUser.id],
            };
          }
          return p;
        })
      );
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!currentUser || !commentText.trim()) return;
    const res = await addComment(postId, currentUser.id, commentText.trim());
    if (res.success && res.comment) {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, res.comment] } : p))
      );
      setCommentText('');
    }
  };

  const handleReport = async (postId: string) => {
    if (!currentUser) return;
    await reportContent(postId, currentUser.id, reportReason);
    setReportModalPostId(null);
    alert('Thank you. Content has been reported to INSTIK CHAT Administrators.');
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-24 text-[#F5F5F5]">
      {/* Stories Bar */}
      <StoriesBar stories={stories} onRefresh={loadFeedData} />

      {/* Main Feed Posts */}
      <div className="flex flex-col gap-6 mt-4 px-2 sm:px-0">
        {posts.map((post) => {
          const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
          const isSaved = currentUser ? post.savedBy.includes(currentUser.id) : false;

          return (
            <article key={post.id} className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-2xl overflow-hidden shadow-xl">
              {/* Post Header */}
              <div className="p-3.5 flex items-center justify-between border-b border-[#1A1A1A]">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => {
                    setSelectedUserId(post.userId);
                    setActiveTab('profile');
                  }}
                >
                  <img src={post.userAvatar} alt="" className="w-10 h-10 rounded-full object-cover border border-[#34D399]/30" />
                  <div>
                    <div className="flex items-center text-sm font-bold text-white hover:text-[#34D399]">
                      <span>{post.userName}</span>
                      <UserBadge badgeType={post.userBadge} customIconUrl={post.customBadgeIcon} />
                    </div>
                    <span className="text-[11px] text-gray-400">@{post.userUsername}</span>
                  </div>
                </div>

                <button
                  onClick={() => setReportModalPostId(post.id)}
                  className="p-1.5 text-gray-500 hover:text-rose-400 rounded-lg transition-colors"
                  title="Report Post"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Media Display */}
              {post.mediaUrls.length > 0 && (
                <div className="w-full bg-[#121212] aspect-square sm:aspect-[4/3] overflow-hidden flex items-center justify-center border-b border-[#1A1A1A]">
                  <img
                    src={post.mediaUrls[0]}
                    alt="Post Media"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Actions Bar */}
              <div className="p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 transition-all group ${
                        isLiked ? 'text-rose-500 fill-rose-500' : 'text-gray-400 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-6 h-6 ${isLiked ? 'fill-rose-500' : ''}`} />
                      <span className="text-xs font-bold">{post.likes.length}</span>
                    </button>

                    <button
                      onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                      className="flex items-center gap-2 text-gray-400 hover:text-[#34D399] transition-colors group"
                    >
                      <MessageCircle className="w-6 h-6" />
                      <span className="text-xs font-bold">{post.comments.length}</span>
                    </button>

                    <button className="text-gray-400 hover:text-[#34D399] transition-colors">
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleSave(post.id)}
                    className={`transition-colors ${isSaved ? 'text-[#34D399] fill-[#34D399]' : 'text-gray-400 hover:text-[#34D399]'}`}
                  >
                    <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-[#34D399]' : ''}`} />
                  </button>
                </div>

                {/* Caption & Hashtags */}
                <div className="text-xs leading-relaxed text-gray-300 mt-1">
                  <span className="font-bold text-white mr-1.5">{post.userName}</span>
                  <span>{post.caption}</span>
                </div>

                {post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {post.hashtags.map((tag, i) => (
                      <span key={i} className="text-[11px] font-semibold text-[#34D399]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-gray-500 font-mono mt-1">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>

                {/* Comment Drawer Expand */}
                {activeCommentPostId === post.id && (
                  <div className="mt-3 pt-3 border-t border-[#1A1A1A] flex flex-col gap-2">
                    <div className="max-h-40 overflow-y-auto flex flex-col gap-2 pr-1">
                      {post.comments.map((c) => (
                        <div key={c.id} className="text-xs bg-[#121212] p-2.5 rounded-xl border border-[#1F1F1F]">
                          <span className="font-bold text-[#34D399] mr-1.5">{c.userName}:</span>
                          <span className="text-gray-200">{c.text}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 bg-[#121212] border border-[#1F1F1F] rounded-xl text-xs text-white outline-none focus:border-[#34D399]"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-3 py-2 bg-[#34D399] text-black font-bold rounded-xl text-xs flex items-center justify-center hover:bg-[#2EB886]"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Report Modal */}
      {reportModalPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-2xl p-5 w-full max-w-sm text-white">
            <h3 className="text-sm font-bold text-rose-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Report Content
            </h3>
            <p className="text-xs text-gray-400 mb-3">Select why you are reporting this post to INSTIK Administrators:</p>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-[#121212] border border-[#1F1F1F] rounded-xl px-3 py-2 text-xs text-white mb-4 outline-none"
            >
              <option value="Spam or misleading">Spam or misleading</option>
              <option value="Hate speech or harassment">Hate speech or harassment</option>
              <option value="Inappropriate content">Inappropriate content</option>
              <option value="Copyright violation">Copyright violation</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setReportModalPostId(null)}
                className="flex-1 py-2 bg-[#121212] border border-[#1F1F1F] text-gray-300 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReport(reportModalPostId)}
                className="flex-1 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
