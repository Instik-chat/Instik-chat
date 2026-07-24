import React, { useState } from 'react';
import { Search, Globe, Users, Film, FileText, Hash, ArrowUpRight } from 'lucide-react';
import { searchContent } from '../../services/api';
import { User, Post, Reel, SearchResultGoogle } from '../../types';
import { UserBadge } from '../UserBadge';
import { useAuth } from '../../context/AuthContext';

export const SearchDiscovery: React.FC = () => {
  const { setSelectedUserId, setActiveTab } = useAuth();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'all' | 'users' | 'reels' | 'posts' | 'google'>('all');
  const [results, setResults] = useState<{ users: User[]; posts: Post[]; reels: Reel[]; hashtags: any[]; google: SearchResultGoogle[] }>({
    users: [],
    posts: [],
    reels: [],
    hashtags: [],
    google: [],
  });
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const res = await searchContent(query.trim(), mode);
    setLoading(false);
    setResults(res);
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-24 text-white p-2">
      <div className="flex flex-col gap-3 sticky top-14 z-20 bg-slate-950/95 p-2 rounded-2xl backdrop-blur-md border border-slate-900 shadow-xl">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search INSTIK CHAT or Google..."
            className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-2xl text-xs text-white placeholder-slate-500 outline-none"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
          >
            Search
          </button>
        </form>

        {/* Filter Modes */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none text-xs font-semibold">
          <button
            onClick={() => setMode('all')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${mode === 'all' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'}`}
          >
            All
          </button>
          <button
            onClick={() => setMode('google')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1 ${mode === 'google' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-sky-400'}`}
          >
            <Globe className="w-3 h-3" /> Google Search
          </button>
          <button
            onClick={() => setMode('users')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${mode === 'users' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'}`}
          >
            People
          </button>
          <button
            onClick={() => setMode('reels')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${mode === 'reels' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'}`}
          >
            Reels
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-emerald-400 text-xs font-semibold">
          Searching across INSTIK and Google Web...
        </div>
      )}

      {!loading && (
        <div className="flex flex-col gap-6 mt-4">
          {/* Google Grounding Results */}
          {results.google.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Globe className="w-4 h-4" /> Live Google Web Grounding Results
              </h3>
              {results.google.map((g, idx) => (
                <a
                  key={idx}
                  href={g.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl flex flex-col gap-1 transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-sky-300">
                    <span className="truncate">{g.title}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{g.snippet}</p>
                </a>
              ))}
            </div>
          )}

          {/* Users Results */}
          {results.users.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">People</h3>
              {results.users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    setSelectedUserId(u.id);
                    setActiveTab('profile');
                  }}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-800/80"
                >
                  <img src={u.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center text-xs font-bold text-white">
                      <span>{u.fullName}</span>
                      <UserBadge badgeType={u.badgeType} customIconUrl={u.customBadgeIcon} />
                    </div>
                    <span className="text-[11px] text-slate-400">@{u.username}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reels Results */}
          {results.reels.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">Trending Reels</h3>
              <div className="grid grid-cols-2 gap-2">
                {results.reels.map((r) => (
                  <div key={r.id} className="relative aspect-[3/4] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
                    <video src={r.videoUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent p-2 flex flex-col justify-end">
                      <span className="text-[10px] font-bold text-white line-clamp-1">{r.caption}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
