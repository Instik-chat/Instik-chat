import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchUserProfile, updateUserProfile, toggleFollowUser, fetchPosts } from '../../services/api';
import { User, Post } from '../../types';
import { UserBadge } from '../UserBadge';
import { Edit, Link as LinkIcon, Grid, Film, Bookmark, Settings, X, Plus } from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { currentUser, selectedUserId, setSelectedUserId, refreshUser, setActiveTab } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'reels' | 'saved'>('posts');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBanner, setEditBanner] = useState('');
  const [editLink, setEditLink] = useState('');

  const targetId = selectedUserId || currentUser?.id;
  const isOwnProfile = !selectedUserId || selectedUserId === currentUser?.id;

  const loadProfile = async () => {
    if (!targetId) return;
    const user = await fetchUserProfile(targetId);
    setProfileUser(user);

    const allPosts = await fetchPosts();
    setUserPosts(allPosts.filter((p) => p.userId === targetId));
  };

  useEffect(() => {
    loadProfile();
  }, [targetId]);

  const handleFollowToggle = async () => {
    if (!currentUser || !profileUser) return;
    const res = await toggleFollowUser(profileUser.id, currentUser.id);
    if (res.success) {
      loadProfile();
      refreshUser();
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    await updateUserProfile(currentUser.id, {
      fullName: editFullName.trim(),
      bio: editBio.trim(),
      avatar: editAvatar.trim(),
      banner: editBanner.trim(),
      links: editLink.trim() ? [editLink.trim()] : [],
    });

    setShowEditModal(false);
    refreshUser();
    loadProfile();
  };

  if (!profileUser) {
    return <div className="text-center py-12 text-slate-500 text-xs">Loading profile...</div>;
  }

  const isFollowing = currentUser ? profileUser.followers.includes(currentUser.id) : false;

  return (
    <div className="w-full max-w-lg mx-auto pb-24 text-white">
      {/* Banner */}
      <div className="relative w-full h-36 bg-slate-800 overflow-hidden">
        <img
          src={profileUser.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
          alt="Banner"
          className="w-full h-full object-cover"
        />
        {!isOwnProfile && (
          <button
            onClick={() => setSelectedUserId(null)}
            className="absolute top-3 left-3 p-2 rounded-full bg-black/60 text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Profile Header Block */}
      <div className="px-4 relative pb-4 border-b border-slate-800">
        <div className="flex justify-between items-end -mt-12 mb-3">
          <div className="relative">
            <img
              src={profileUser.avatar}
              alt=""
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-950 bg-slate-900 shadow-xl"
            />
          </div>

          <div>
            {isOwnProfile ? (
              <button
                onClick={() => {
                  setEditFullName(profileUser.fullName);
                  setEditBio(profileUser.bio || '');
                  setEditAvatar(profileUser.avatar);
                  setEditBanner(profileUser.banner || '');
                  setEditLink(profileUser.links[0] || '');
                  setShowEditModal(true);
                }}
                className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Profile
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all ${
                  isFollowing
                    ? 'bg-slate-900 border border-slate-800 text-slate-300'
                    : 'bg-emerald-500 text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-950/50'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-lg font-extrabold text-white">
          <span>{profileUser.fullName}</span>
          <UserBadge badgeType={profileUser.badgeType} customIconUrl={profileUser.customBadgeIcon} />
        </div>
        <div className="text-xs text-emerald-400 font-medium">@{profileUser.username}</div>

        {profileUser.bio && <p className="text-xs text-slate-300 mt-2 leading-relaxed">{profileUser.bio}</p>}

        {profileUser.links.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-sky-400 mt-2 font-medium">
            <LinkIcon className="w-3.5 h-3.5" />
            <a href={profileUser.links[0]} target="_blank" rel="noreferrer" className="hover:underline truncate">
              {profileUser.links[0]}
            </a>
          </div>
        )}

        {/* Followers / Following Stats */}
        <div className="flex gap-6 mt-4 pt-3 border-t border-slate-900 text-xs">
          <div>
            <span className="font-extrabold text-white text-sm">{userPosts.length}</span>{' '}
            <span className="text-slate-400">Posts</span>
          </div>
          <div>
            <span className="font-extrabold text-white text-sm">{profileUser.followers.length}</span>{' '}
            <span className="text-slate-400">Followers</span>
          </div>
          <div>
            <span className="font-extrabold text-white text-sm">{profileUser.following.length}</span>{' '}
            <span className="text-slate-400">Following</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('posts')}
          className={`flex-1 py-3 flex justify-center items-center gap-1.5 ${
            activeSubTab === 'posts' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500'
          }`}
        >
          <Grid className="w-4 h-4" /> Posts
        </button>
        <button
          onClick={() => setActiveSubTab('reels')}
          className={`flex-1 py-3 flex justify-center items-center gap-1.5 ${
            activeSubTab === 'reels' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500'
          }`}
        >
          <Film className="w-4 h-4" /> Reels
        </button>
      </div>

      {/* Post Grid */}
      <div className="grid grid-cols-3 gap-1 p-1 mt-1">
        {userPosts.map((post) => (
          <div key={post.id} className="aspect-square bg-slate-900 overflow-hidden relative group">
            {post.mediaUrls.length > 0 ? (
              <img src={post.mediaUrls[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full p-2 flex items-center justify-center text-[10px] text-slate-400 text-center">
                {post.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-slate-900 border border-emerald-500/20 rounded-3xl p-5 text-white">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-emerald-400 mb-3">Edit Profile</h3>
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Banner Image URL</label>
                <input
                  type="text"
                  value={editBanner}
                  onChange={(e) => setEditBanner(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Website Link</label>
                <input
                  type="text"
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:brightness-110 mt-1"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
