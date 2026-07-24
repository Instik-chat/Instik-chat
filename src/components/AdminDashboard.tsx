import React, { useState, useEffect } from 'react';
import { LeafLogo } from './LeafLogo';
import { UserBadge } from './UserBadge';
import {
  Users,
  Shield,
  FileText,
  Video,
  AlertTriangle,
  BadgeCheck,
  Megaphone,
  LogOut,
  Ban,
  CheckCircle2,
  XCircle,
  Search,
  Upload,
  RefreshCw,
  Clock,
  Eye,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchAdminStats,
  fetchAdminUsers,
  performAdminUserAction,
  fetchAdminVerifications,
  actionAdminVerification,
  assignAdminBadge,
  fetchAdminReports,
  actionAdminReport
} from '../services/api';
import { User, AdminStats, VerificationRequest, ReportItem } from '../types';

export const AdminDashboard: React.FC = () => {
  const { setActiveScreen, setIsAdminLoggedIn } = useAuth();
  const [tab, setTab] = useState<'stats' | 'users' | 'verifications' | 'reports' | 'announcements'>('stats');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Badge assign form
  const [badgeType, setBadgeType] = useState<string>('gold');
  const [customBadgeUrl, setCustomBadgeUrl] = useState('');

  // Announcement form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  const [msg, setMsg] = useState('');

  const loadData = async () => {
    try {
      const s = await fetchAdminStats();
      setStats(s);

      const u = await fetchAdminUsers();
      setUsers(u);

      const v = await fetchAdminVerifications();
      setVerifications(v);

      const r = await fetchAdminReports();
      setReports(r);

      const annRes = await fetch('/api/admin/announcements');
      if (annRes.ok) setAnnouncements(await annRes.json());
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUserAction = async (userId: string, action: 'ban' | 'unban' | 'suspend' | 'restore') => {
    await performAdminUserAction(userId, action);
    setMsg(`User action "${action}" completed successfully.`);
    loadData();
  };

  const handleVerificationAction = async (reqId: string, status: 'approved' | 'rejected') => {
    await actionAdminVerification(reqId, status, badgeType, customBadgeUrl);
    setMsg(`Verification request ${status}.`);
    loadData();
  };

  const handleAssignBadge = async (userId: string) => {
    await assignAdminBadge(userId, badgeType, customBadgeUrl);
    setMsg(`Badge (${badgeType}) assigned to user.`);
    loadData();
  };

  const handleReportAction = async (reportId: string, action: 'ignore' | 'remove_content' | 'warn_user' | 'ban_user') => {
    await actionAdminReport(reportId, action);
    setMsg(`Report action "${action}" applied.`);
    loadData();
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    await fetch('/api/admin/announcements/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: annTitle, content: annContent })
    });
    setAnnTitle('');
    setAnnContent('');
    setMsg('Announcement published to all INSTIK users!');
    loadData();
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-emerald-500/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LeafLogo size="sm" />
          <h1 className="text-xl font-black tracking-widest text-emerald-400">ADMIN.COM</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Refresh Stats"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsAdminLoggedIn(false);
              setActiveScreen('welcome');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" /> Exit Admin
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 flex flex-col gap-2 bg-slate-900 border border-slate-800 p-3 rounded-2xl h-fit">
          <button
            onClick={() => setTab('stats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              tab === 'stats' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" /> Live Dashboard
          </button>
          <button
            onClick={() => setTab('users')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              tab === 'users' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-3"><Users className="w-4 h-4" /> Users</span>
            <span className="text-xs opacity-75 font-mono">{users.length}</span>
          </button>
          <button
            onClick={() => setTab('verifications')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              tab === 'verifications' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-3"><BadgeCheck className="w-4 h-4" /> Verifications</span>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
              {verifications.filter((v) => v.status === 'pending').length}
            </span>
          </button>
          <button
            onClick={() => setTab('reports')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              tab === 'reports' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-3"><AlertTriangle className="w-4 h-4" /> Reports</span>
            <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-mono">{reports.length}</span>
          </button>
          <button
            onClick={() => setTab('announcements')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              tab === 'announcements' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Megaphone className="w-4 h-4" /> Announcements
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          {msg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
              <span>{msg}</span>
              <button onClick={() => setMsg('')} className="text-slate-400 hover:text-white">✕</button>
            </div>
          )}

          {/* STATS OVERVIEW */}
          {tab === 'stats' && stats && (
            <div>
              <h2 className="text-xl font-black text-emerald-400 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" /> Live System Metrics
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="text-xs text-slate-400">Total Registered Users</div>
                  <div className="text-2xl font-black text-white mt-1">{stats.totalUsers}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="text-xs text-slate-400">Online Users Now</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{stats.onlineUsers}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="text-xs text-slate-400">Total Feed Posts</div>
                  <div className="text-2xl font-black text-white mt-1">{stats.totalPosts}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="text-xs text-slate-400">Total Reels & Videos</div>
                  <div className="text-2xl font-black text-white mt-1">{stats.totalReels}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="text-xs text-slate-400">Active Stories (24h)</div>
                  <div className="text-2xl font-black text-teal-400 mt-1">{stats.totalStories}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="text-xs text-slate-400">Delivered Messages</div>
                  <div className="text-2xl font-black text-white mt-1">{stats.totalMessages}</div>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-800 pt-6">
                <h3 className="text-sm font-bold text-slate-300 mb-3">System Groups & Channels</h3>
                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-xs text-slate-400">Groups:</span> <span className="font-bold text-emerald-400">{stats.totalGroups}</span>
                  </div>
                  <div className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-xs text-slate-400">Channels:</span> <span className="font-bold text-emerald-400">{stats.totalChannels}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USER MANAGEMENT */}
          {tab === 'users' && (
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-black text-emerald-400">User Accounts</h2>
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-1 text-sm font-bold text-white">
                          <span>{u.fullName}</span>
                          <UserBadge badgeType={u.badgeType} customIconUrl={u.customBadgeIcon} />
                        </div>
                        <div className="text-xs text-slate-400">@{u.username} • {u.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                      >
                        Badge/Edit
                      </button>

                      {u.isBanned ? (
                        <button
                          onClick={() => handleUserAction(u.id, 'unban')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-semibold"
                        >
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction(u.id, 'ban')}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-xs font-semibold flex items-center gap-1"
                        >
                          <Ban className="w-3 h-3" /> Ban
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Badge Assignment Dialog */}
              {selectedUser && (
                <div className="mt-6 p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-emerald-400">Assign Badge to @{selectedUser.username}</h3>
                    <button onClick={() => setSelectedUser(null)} className="text-xs text-slate-400">Close</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Badge Type</label>
                      <select
                        value={badgeType}
                        onChange={(e) => setBadgeType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="blue">Blue Verified</option>
                        <option value="gold">Gold Badge</option>
                        <option value="music">Music Artist</option>
                        <option value="creator">Creator</option>
                        <option value="gaming">Gaming</option>
                        <option value="business">Business</option>
                        <option value="premium">Premium</option>
                        <option value="vip">VIP Badge</option>
                        <option value="official">Official Badge</option>
                        <option value="custom">Custom Badge Icon URL</option>
                      </select>
                    </div>

                    {badgeType === 'custom' && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Custom Icon PNG URL</label>
                        <input
                          type="text"
                          value={customBadgeUrl}
                          onChange={(e) => setCustomBadgeUrl(e.target.value)}
                          placeholder="https://example.com/badge.png"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleAssignBadge(selectedUser.id)}
                    className="w-full py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:brightness-110"
                  >
                    Save Badge to User
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VERIFICATION REQUESTS */}
          {tab === 'verifications' && (
            <div>
              <h2 className="text-xl font-black text-emerald-400 mb-4">Verification Requests</h2>
              <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
                {verifications.length === 0 ? (
                  <div className="text-slate-500 text-xs text-center py-8">No verification requests pending.</div>
                ) : (
                  verifications.map((v) => (
                    <div key={v.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={v.userAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="text-sm font-bold text-white">{v.userName} (@{v.userUsername})</div>
                          <div className="text-xs text-emerald-400 font-semibold">{v.category}</div>
                          <div className="text-[11px] text-slate-400">{v.documentProof}</div>
                        </div>
                      </div>

                      {v.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVerificationAction(v.id, 'approved')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 hover:brightness-110"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleVerificationAction(v.id, 'rejected')}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/30 flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${v.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {v.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* REPORTS */}
          {tab === 'reports' && (
            <div>
              <h2 className="text-xl font-black text-emerald-400 mb-4">Content & User Reports</h2>
              <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
                {reports.length === 0 ? (
                  <div className="text-slate-500 text-xs text-center py-8">No active reports.</div>
                ) : (
                  reports.map((r) => (
                    <div key={r.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-rose-400 uppercase">{r.contentType} REPORT</span>
                        <span className="text-slate-500">{new Date(r.reportTime).toLocaleDateString()}</span>
                      </div>

                      <div className="text-xs text-slate-300">
                        <span className="text-slate-500">Reason:</span> <span className="font-semibold">{r.reason}</span>
                      </div>
                      {r.details && <div className="text-xs text-slate-400 bg-slate-900 p-2 rounded-lg">{r.details}</div>}

                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800 justify-end">
                        <button
                          onClick={() => handleReportAction(r.id, 'remove_content')}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 text-xs font-semibold hover:bg-rose-500/30"
                        >
                          Remove Content
                        </button>
                        <button
                          onClick={() => handleReportAction(r.id, 'ignore')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold hover:text-white"
                        >
                          Ignore
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ANNOUNCEMENTS */}
          {tab === 'announcements' && (
            <div>
              <h2 className="text-xl font-black text-emerald-400 mb-4">Global System Announcements</h2>

              <form onSubmit={handleCreateAnnouncement} className="flex flex-col gap-3 mb-6 bg-slate-950 p-4 border border-slate-800 rounded-xl">
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Announcement Title..."
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  required
                />
                <textarea
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Broadcast message content..."
                  rows={3}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                  required
                />
                <button
                  type="submit"
                  className="py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:brightness-110"
                >
                  Publish Broadcast
                </button>
              </form>

              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                {announcements.map((a) => (
                  <div key={a.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="font-bold text-emerald-400 text-sm">{a.title}</div>
                    <p className="text-xs text-slate-300 mt-1">{a.content}</p>
                    <div className="text-[10px] text-slate-500 mt-2">{new Date(a.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
