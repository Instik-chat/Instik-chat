import { User, Post, Reel, Story, NotificationItem, VerificationRequest, ReportItem, Announcement, SearchResultGoogle, AdminStats } from '../types';

export async function loginUser(identifier: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function signUpUser(data: { fullName: string; username: string; email?: string; phone?: string; password: string }): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function requestForgotOtp(method: 'email' | 'phone', value: string): Promise<{ success: boolean; userId?: string; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/auth/forgot-password/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, value }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function verifyForgotOtp(userId: string, code: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/auth/forgot-password/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, code, newPassword }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminLogin(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchPosts(): Promise<Post[]> {
  try {
    const res = await fetch('/api/posts');
    return await res.json();
  } catch {
    return [];
  }
}

export async function createPost(userId: string, caption: string, mediaUrls: string[], mediaType: 'image' | 'video' | 'mixed', hashtags: string[]): Promise<any> {
  const res = await fetch('/api/posts/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, caption, mediaUrls, mediaType, hashtags }),
  });
  return await res.json();
}

export async function toggleLikePost(postId: string, userId: string): Promise<any> {
  const res = await fetch(`/api/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  return await res.json();
}

export async function addComment(postId: string, userId: string, text: string): Promise<any> {
  const res = await fetch(`/api/posts/${postId}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, text }),
  });
  return await res.json();
}

export async function toggleSavePost(postId: string, userId: string): Promise<any> {
  const res = await fetch(`/api/posts/${postId}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  return await res.json();
}

export async function reportContent(postId: string, reporterUserId: string, reason: string, details?: string): Promise<any> {
  const res = await fetch(`/api/posts/${postId}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reporterUserId, reason, details }),
  });
  return await res.json();
}

export async function fetchStories(): Promise<Story[]> {
  try {
    const res = await fetch('/api/stories');
    return await res.json();
  } catch {
    return [];
  }
}

export async function uploadStory(userId: string, mediaUrl: string, mediaType: 'image' | 'video'): Promise<any> {
  const res = await fetch('/api/stories/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, mediaUrl, mediaType }),
  });
  return await res.json();
}

export async function fetchReels(): Promise<Reel[]> {
  try {
    const res = await fetch('/api/reels');
    return await res.json();
  } catch {
    return [];
  }
}

export async function uploadReel(data: { userId: string; videoUrl: string; caption: string; hashtags: string[]; musicTitle?: string; privacy: 'public' | 'followers' | 'private' }): Promise<any> {
  const res = await fetch('/api/reels/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function fetchMusicDetails(musicId: string): Promise<any> {
  const res = await fetch(`/api/music/${musicId}`);
  return await res.json();
}

export async function searchContent(q: string, mode: 'all' | 'users' | 'reels' | 'posts' | 'hashtags' | 'google'): Promise<{ users: User[]; posts: Post[]; reels: Reel[]; hashtags: any[]; google: SearchResultGoogle[] }> {
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&mode=${mode}`);
    return await res.json();
  } catch {
    return { users: [], posts: [], reels: [], hashtags: [], google: [] };
  }
}

export async function fetchUserChats(userId: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/chats?userId=${userId}`);
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchChatMessages(conversationId: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/chats/${conversationId}/messages`);
    return await res.json();
  } catch {
    return [];
  }
}

export async function sendChatMessage(data: { conversationId: string; senderId: string; content: string; type?: string; voiceDuration?: number }): Promise<any> {
  const res = await fetch('/api/chats/messages/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function createConversation(data: { type: string; name?: string; participants: string[]; ownerId?: string; settings?: any }): Promise<any> {
  const res = await fetch('/api/chats/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  try {
    const res = await fetch(`/api/notifications/${userId}`);
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    const res = await fetch(`/api/users/${userId}`);
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateUserProfile(userId: string, data: Partial<User>): Promise<any> {
  const res = await fetch(`/api/users/${userId}/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function toggleFollowUser(targetUserId: string, currentUserId: string): Promise<any> {
  const res = await fetch(`/api/users/${targetUserId}/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentUserId }),
  });
  return await res.json();
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch('/api/admin/stats');
  return await res.json();
}

export async function fetchAdminUsers(): Promise<User[]> {
  const res = await fetch('/api/admin/users');
  return await res.json();
}

export async function performAdminUserAction(userId: string, action: 'ban' | 'unban' | 'suspend' | 'restore'): Promise<any> {
  const res = await fetch(`/api/admin/users/${userId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  return await res.json();
}

export async function fetchAdminVerifications(): Promise<VerificationRequest[]> {
  const res = await fetch('/api/admin/verifications');
  return await res.json();
}

export async function actionAdminVerification(reqId: string, status: 'approved' | 'rejected', badgeType?: string, customBadgeIcon?: string): Promise<any> {
  const res = await fetch(`/api/admin/verifications/${reqId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, badgeType, customBadgeIcon }),
  });
  return await res.json();
}

export async function assignAdminBadge(userId: string, badgeType: string, customBadgeIcon?: string): Promise<any> {
  const res = await fetch('/api/admin/badge/assign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, badgeType, customBadgeIcon }),
  });
  return await res.json();
}

export async function fetchAdminReports(): Promise<ReportItem[]> {
  const res = await fetch('/api/admin/reports');
  return await res.json();
}

export async function actionAdminReport(reportId: string, action: 'ignore' | 'remove_content' | 'warn_user' | 'ban_user'): Promise<any> {
  const res = await fetch(`/api/admin/reports/${reportId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  return await res.json();
}

export async function submitVerificationRequest(userId: string, category: string, documentProof: string): Promise<any> {
  const res = await fetch('/api/verification-request/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, category, documentProof }),
  });
  return await res.json();
}

export async function submitUserComplaint(userId: string, complaintText: string, category: string): Promise<any> {
  const res = await fetch('/api/settings/complaint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, complaintText, category }),
  });
  return await res.json();
}

export async function deleteUserAccount(userId: string, password: string): Promise<any> {
  const res = await fetch('/api/account/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, password }),
  });
  return await res.json();
}
