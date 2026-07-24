export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  avatar: string;
  bio?: string;
  isPrivate: boolean;
  isVerified?: boolean;
  badgeType?: 'blue' | 'gold' | 'music' | 'creator' | 'gaming' | 'business' | 'premium' | 'vip' | 'official' | 'custom';
  customBadgeIcon?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  reelsCount: number;
  createdAt: string;
  isBanned?: boolean;
  isSuspended?: boolean;
  lastSeen?: string;
  onlineStatus?: 'online' | 'offline';
  links?: ProfileLink[];
}

export interface ProfileLink {
  id: string;
  title: string;
  url: string;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: string; // ISO string
  expiresAt: string; // 24h later
  viewsCount: number;
  likesCount: number;
  likedByCurrentUser?: boolean;
  viewers?: string[]; // userIds
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string;
  userBadge?: string;
  customBadgeIcon?: string;
  mediaUrls: string[];
  mediaType: 'image' | 'video' | 'mixed';
  caption: string;
  hashtags: string[];
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  likedByCurrentUser?: boolean;
  savedByCurrentUser?: boolean;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  postId?: string;
  reelId?: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  likesCount: number;
  likedByCurrentUser?: boolean;
  replies?: CommentReply[];
}

export interface CommentReply {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  likesCount: number;
  likedByCurrentUser?: boolean;
}

export interface Reel {
  id: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string;
  videoUrl: string;
  caption: string;
  hashtags: string[];
  musicTitle: string;
  musicCreator: string;
  musicId: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  likedByCurrentUser?: boolean;
  savedByCurrentUser?: boolean;
  privacy: 'public' | 'followers' | 'private';
}

export interface MusicTrack {
  id: string;
  title: string;
  creator: string;
  audioUrl?: string;
  totalVideosCount: number;
}

export interface ChatConversation {
  id: string;
  type: 'direct' | 'group' | 'community' | 'channel';
  name: string;
  username?: string;
  avatar: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  onlineStatus?: 'online' | 'offline';
  participants: string[]; // userIds
  ownerId?: string;
  admins?: string[];
  isPrivateChannel?: boolean;
  settings?: {
    adminsOnlyMessage?: boolean;
    disableVoice?: boolean;
    disableMedia?: boolean;
    disableLinks?: boolean;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: 'text' | 'image' | 'video' | 'voice' | 'system';
  content: string; // text or media URL
  voiceDuration?: number; // seconds
  createdAt: string;
  status: 'sending' | 'sent' | 'delivered' | 'seen';
}

export interface NotificationItem {
  id: string;
  userId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  type: 'like' | 'comment' | 'reply' | 'story_like' | 'story_reply' | 'story_view' | 'follow_request' | 'follow_accept' | 'new_follower' | 'mention' | 'tag' | 'shared_post' | 'shared_reel' | 'verification';
  targetId?: string; // postId, reelId, chatConversationId
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string;
  category: string;
  documentProof?: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ReportItem {
  id: string;
  reportedUserId?: string;
  reporterUserId: string;
  reporterUsername: string;
  contentType: 'post' | 'reel' | 'video' | 'comment' | 'user';
  contentId: string;
  reason: string;
  reportTime: string;
  status: 'pending' | 'reviewed' | 'action_taken' | 'ignored';
  details?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface SearchResultGoogle {
  title: string;
  snippet: string;
  url: string;
  icon?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  onlineUsers: number;
  totalPosts: number;
  totalReels: number;
  totalVideos: number;
  totalStories: number;
  totalMessages: number;
  totalGroups: number;
  totalCommunities: number;
  totalChannels: number;
  totalReports: number;
  pendingVerifications: number;
}
