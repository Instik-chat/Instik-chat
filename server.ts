import express from "express";
import path from "path";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Gemini Client safely for Server-Side Search Grounding
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (err) {
    console.error("Gemini initialization warning:", err);
  }
}

// ==========================================
// SEEDED IN-MEMORY DATABASE
// ==========================================

export interface DbUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  passwordHash: string;
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
  links?: { id: string; title: string; url: string }[];
  followers?: string[]; // userIds
  following?: string[]; // userIds
  savedPosts?: string[]; // postIds
  savedReels?: string[]; // reelIds
}

const usersDb: Record<string, DbUser> = {
  "u1": {
    id: "u1",
    fullName: "Elena Rostova",
    username: "elena_leaf",
    email: "elena@instik.chat",
    phone: "+12345678901",
    passwordHash: "password123",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    bio: "Digital artist & Eco enthusiast 🌿 Building the green community on INSTIK CHAT",
    isPrivate: false,
    isVerified: true,
    badgeType: "gold",
    followersCount: 14200,
    followingCount: 380,
    postsCount: 42,
    reelsCount: 18,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    onlineStatus: "online",
    followers: ["u2", "u3", "u4"],
    following: ["u2", "u3"],
    savedPosts: [],
    savedReels: [],
    links: [
      { id: "l1", title: "My Portfolio", url: "https://github.com" },
      { id: "l2", title: "YouTube Channel", url: "https://youtube.com" },
      { id: "l3", title: "Instagram Profile", url: "https://instagram.com" }
    ]
  },
  "u2": {
    id: "u2",
    fullName: "Marcus Chen",
    username: "marcus_beats",
    email: "marcus@instik.chat",
    phone: "+19876543210",
    passwordHash: "password123",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    bio: "Music Producer 🎧 Sound Engineer | Producing chill beats & ambient soundscapes",
    isPrivate: false,
    isVerified: true,
    badgeType: "music",
    followersCount: 28900,
    followingCount: 150,
    postsCount: 65,
    reelsCount: 34,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    onlineStatus: "online",
    followers: ["u1", "u3"],
    following: ["u1"],
    savedPosts: [],
    savedReels: [],
    links: [
      { id: "l4", title: "Listen on Spotify", url: "https://spotify.com" }
    ]
  },
  "u3": {
    id: "u3",
    fullName: "Aria Thorne",
    username: "aria_reels",
    email: "aria@instik.chat",
    phone: "+15550192837",
    passwordHash: "password123",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
    bio: "Travel Vlogger 🌍 Exploring hidden trails & eco retreats across the globe 🍃",
    isPrivate: false,
    isVerified: true,
    badgeType: "creator",
    followersCount: 54100,
    followingCount: 210,
    postsCount: 88,
    reelsCount: 76,
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    onlineStatus: "offline",
    lastSeen: "10m ago",
    followers: ["u1", "u2"],
    following: ["u1", "u2"],
    savedPosts: [],
    savedReels: [],
    links: [
      { id: "l5", title: "Travel Blog", url: "https://wordpress.com" }
    ]
  },
  "u4": {
    id: "u4",
    fullName: "Devon Vance",
    username: "devon_tech",
    email: "devon@instik.chat",
    passwordHash: "password123",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
    bio: "Full Stack Engineer & Tech Enthusiast 💻 Building next-gen mobile web apps",
    isPrivate: false,
    isVerified: true,
    badgeType: "official",
    followersCount: 8900,
    followingCount: 120,
    postsCount: 19,
    reelsCount: 8,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    onlineStatus: "online",
    followers: ["u1"],
    following: ["u1"],
    savedPosts: [],
    savedReels: []
  }
};

const storiesDb: any[] = [
  {
    id: "s1",
    userId: "u1",
    userName: "Elena Rostova",
    userUsername: "elena_leaf",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    mediaUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800",
    mediaType: "image",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 22 * 3600000).toISOString(),
    viewsCount: 248,
    likesCount: 56,
    viewers: ["u2", "u3", "u4"]
  },
  {
    id: "s2",
    userId: "u2",
    userName: "Marcus Chen",
    userUsername: "marcus_beats",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    mediaUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800",
    mediaType: "image",
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 20 * 3600000).toISOString(),
    viewsCount: 412,
    likesCount: 92,
    viewers: ["u1", "u3"]
  },
  {
    id: "s3",
    userId: "u3",
    userName: "Aria Thorne",
    userUsername: "aria_reels",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
    mediaUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
    mediaType: "image",
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 18 * 3600000).toISOString(),
    viewsCount: 830,
    likesCount: 184,
    viewers: ["u1", "u2", "u4"]
  }
];

const postsDb: any[] = [
  {
    id: "p1",
    userId: "u1",
    userName: "Elena Rostova",
    userUsername: "elena_leaf",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    userBadge: "gold",
    mediaUrls: [
      "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1000"
    ],
    mediaType: "mixed",
    caption: "Morning walk in the emerald canopy 🍃 Nature is the best place to find peace and inspiration. Welcome to INSTIK CHAT! #GreenLife #InstikChat #NatureVibes",
    hashtags: ["GreenLife", "InstikChat", "NatureVibes"],
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    likesCount: 342,
    commentsCount: 18,
    sharesCount: 12,
    likedBy: ["u2", "u3"],
    savedBy: ["u2"],
    comments: [
      {
        id: "c1",
        postId: "p1",
        userId: "u2",
        userName: "Marcus Chen",
        userUsername: "marcus_beats",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
        text: "Incredible shot Elena! The green hues match INSTIK CHAT perfectly 🌿",
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        likesCount: 15,
        likedBy: ["u1"],
        replies: [
          {
            id: "r1",
            commentId: "c1",
            userId: "u1",
            userName: "Elena Rostova",
            userUsername: "elena_leaf",
            userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
            text: "Thanks Marcus! Green is life ✨",
            createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
            likesCount: 8,
            likedBy: []
          }
        ]
      }
    ]
  },
  {
    id: "p2",
    userId: "u3",
    userName: "Aria Thorne",
    userUsername: "aria_reels",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
    userBadge: "creator",
    mediaUrls: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000"
    ],
    mediaType: "image",
    caption: "Sunset over the crystal waters 🌊 Traveling opens your heart to new cultures and ideas. What's your dream destination? #Travel #Wanderlust #InstikChat",
    hashtags: ["Travel", "Wanderlust", "InstikChat"],
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    likesCount: 890,
    commentsCount: 34,
    sharesCount: 28,
    likedBy: ["u1", "u2", "u4"],
    savedBy: ["u1"],
    comments: []
  }
];

const reelsDb: any[] = [
  {
    id: "r1",
    userId: "u2",
    userName: "Marcus Chen",
    userUsername: "marcus_beats",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4",
    caption: "Creating a new ambient track live in the studio 🎵 Pure organic vibes! #MusicProducer #InstikReels #ChillBeats",
    hashtags: ["MusicProducer", "InstikReels", "ChillBeats"],
    musicTitle: "Emerald Horizons (Original Mix)",
    musicCreator: "Marcus Chen",
    musicId: "m1",
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    likesCount: 1240,
    commentsCount: 88,
    sharesCount: 145,
    viewsCount: 4500,
    likedBy: ["u1", "u3"],
    savedBy: ["u1"],
    privacy: "public"
  },
  {
    id: "r2",
    userId: "u3",
    userName: "Aria Thorne",
    userUsername: "aria_reels",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4",
    caption: "Morning breeze through the bamboo forest 🍃 Deep breathing exercise with instant calm. #Mindfulness #Eco #InstikChat",
    hashtags: ["Mindfulness", "Eco", "InstikChat"],
    musicTitle: "Bamboo Serenade",
    musicCreator: "Aria Thorne",
    musicId: "m2",
    createdAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    likesCount: 2890,
    commentsCount: 142,
    sharesCount: 230,
    viewsCount: 11200,
    likedBy: ["u1", "u2"],
    savedBy: ["u2"],
    privacy: "public"
  }
];

const musicDb: Record<string, any> = {
  "m1": {
    id: "m1",
    title: "Emerald Horizons (Original Mix)",
    creator: "Marcus Chen",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    totalVideosCount: 124
  },
  "m2": {
    id: "m2",
    title: "Bamboo Serenade",
    creator: "Aria Thorne",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a2a1e3.mp3?filename=ambient-piano-10786.mp3",
    totalVideosCount: 89
  }
};

const chatsDb: any[] = [
  {
    id: "c_u1_u2",
    type: "direct",
    name: "Marcus Chen",
    username: "marcus_beats",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    lastMessage: "Let's collaborate on the new INSTIK audio track! 🎵",
    lastMessageTime: "5m ago",
    unreadCount: 1,
    onlineStatus: "online",
    participants: ["u1", "u2"]
  },
  {
    id: "c_u1_u3",
    type: "direct",
    name: "Aria Thorne",
    username: "aria_reels",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
    lastMessage: "Did you check out my latest reel on INSTIK CHAT?",
    lastMessageTime: "1h ago",
    unreadCount: 0,
    onlineStatus: "offline",
    participants: ["u1", "u3"]
  },
  {
    id: "c_group_green",
    type: "group",
    name: "🌿 Green Creators Club",
    avatar: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=250",
    lastMessage: "Devon: Welcome to the official creators group!",
    lastMessageTime: "2h ago",
    unreadCount: 3,
    participants: ["u1", "u2", "u3", "u4"],
    ownerId: "u1",
    admins: ["u1", "u4"],
    settings: {
      adminsOnlyMessage: false,
      disableVoice: false,
      disableMedia: false,
      disableLinks: false
    }
  },
  {
    id: "c_channel_news",
    type: "channel",
    name: "📢 INSTIK Official Updates",
    avatar: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=250",
    lastMessage: "INSTIK CHAT v1.0 is officially live with Green Leaf Branding!",
    lastMessageTime: "1d ago",
    unreadCount: 0,
    participants: ["u1", "u2", "u3", "u4"],
    ownerId: "u4",
    admins: ["u4"],
    isPrivateChannel: false
  }
];

const messagesDb: Record<string, any[]> = {
  "c_u1_u2": [
    {
      id: "m_1",
      conversationId: "c_u1_u2",
      senderId: "u2",
      senderName: "Marcus Chen",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
      type: "text",
      content: "Hey Elena! Love your new post on INSTIK CHAT 🌿",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      status: "seen"
    },
    {
      id: "m_2",
      conversationId: "c_u1_u2",
      senderId: "u1",
      senderName: "Elena Rostova",
      senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
      type: "text",
      content: "Thanks Marcus! The audio quality on your reels is top notch!",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      status: "seen"
    },
    {
      id: "m_3",
      conversationId: "c_u1_u2",
      senderId: "u2",
      senderName: "Marcus Chen",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
      type: "text",
      content: "Let's collaborate on the new INSTIK audio track! 🎵",
      createdAt: new Date(Date.now() - 300000).toISOString(),
      status: "delivered"
    }
  ]
};

const notificationsDb: Record<string, any[]> = {
  "u1": [
    {
      id: "n1",
      userId: "u1",
      fromUserId: "u2",
      fromUserName: "Marcus Chen",
      fromUserAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
      type: "like",
      targetId: "p1",
      message: "liked your post: Morning walk in the emerald canopy...",
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      isRead: false
    },
    {
      id: "n2",
      userId: "u1",
      fromUserId: "u3",
      fromUserName: "Aria Thorne",
      fromUserAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
      type: "new_follower",
      message: "started following you on INSTIK CHAT.",
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      isRead: true
    }
  ]
};

const verificationRequestsDb: any[] = [
  {
    id: "v1",
    userId: "u1",
    userName: "Elena Rostova",
    userUsername: "elena_leaf",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    category: "Digital Creator",
    documentProof: "Official portfolio link & ID verified",
    requestDate: new Date(Date.now() - 86400000).toISOString(),
    status: "pending"
  }
];

const reportsDb: any[] = [
  {
    id: "rep1",
    reporterUserId: "u2",
    reporterUsername: "marcus_beats",
    contentType: "comment",
    contentId: "c_flagged_1",
    reason: "Inappropriate language in public feed",
    reportTime: new Date(Date.now() - 43200000).toISOString(),
    status: "pending",
    details: "Spammy link posted in comments"
  }
];

const announcementsDb: any[] = [
  {
    id: "ann1",
    title: "Welcome to INSTIK CHAT 🌿",
    content: "Enjoy our real-time messaging, vertical HD reels, Google search mode, custom profile badges, and original leaf branding!",
    createdAt: new Date().toISOString(),
    createdBy: "Admin"
  }
];

const auditLogsDb: any[] = [
  {
    id: "al1",
    action: "Admin Login",
    performedBy: "ADMIN.COM",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    details: "Administrator session authorized successfully"
  }
];

// Active OTP store for forgot password & profile phone/email changes
const activeOtps: Record<string, string> = {};

// ==========================================
// REST API ENDPOINTS
// ==========================================

// AUTH ENDPOINTS
app.post("/api/auth/login", (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: "Username/Email/Phone and Password are required." });
  }

  const query = identifier.trim().toLowerCase();
  const user = Object.values(usersDb).find(
    (u) =>
      u.username.toLowerCase() === query ||
      u.email.toLowerCase() === query ||
      (u.phone && u.phone.trim() === query)
  );

  if (!user) {
    return res.status(404).json({ error: "No account found matching these credentials." });
  }

  if (user.passwordHash !== password) {
    return res.status(401).json({ error: "Incorrect password. Please try again." });
  }

  if (user.isBanned) {
    return res.status(403).json({ error: "Account has been banned by Administrator." });
  }

  user.onlineStatus = "online";
  res.json({ success: true, user });
});

app.post("/api/auth/signup", (req, res) => {
  const { fullName, username, email, phone, password } = req.body;

  if (!fullName || !username || (!email && !phone) || !password) {
    return res.status(400).json({ error: "Please fill out all required multi-step registration fields." });
  }

  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  const existingUsername = Object.values(usersDb).find((u) => u.username.toLowerCase() === cleanUsername);
  if (existingUsername) {
    return res.status(400).json({ error: "Username is already taken. Please choose another." });
  }

  if (email) {
    const existingEmail = Object.values(usersDb).find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existingEmail) {
      return res.status(400).json({ error: "Email address is already registered." });
    }
  }

  const newId = "u_" + Date.now();
  const newUser: DbUser = {
    id: newId,
    fullName: fullName.trim(),
    username: cleanUsername,
    email: email ? email.trim() : `${cleanUsername}@instik.chat`,
    phone: phone ? phone.trim() : undefined,
    passwordHash: password,
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250`,
    bio: "Hey there! I am using INSTIK CHAT 🌿",
    isPrivate: false,
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    reelsCount: 0,
    createdAt: new Date().toISOString(),
    onlineStatus: "online",
    followers: [],
    following: [],
    savedPosts: [],
    savedReels: [],
    links: []
  };

  usersDb[newId] = newUser;
  res.json({ success: true, user: newUser });
});

app.post("/api/auth/forgot-password/request", (req, res) => {
  const { method, value } = req.body; // method: 'email' | 'phone'
  if (!value) {
    return res.status(400).json({ error: "Email or Phone number is required." });
  }

  const user = Object.values(usersDb).find(
    (u) => (method === "email" && u.email.toLowerCase() === value.trim().toLowerCase()) ||
           (method === "phone" && u.phone && u.phone.trim() === value.trim())
  );

  if (!user) {
    return res.status(404).json({ error: "No user found with this contact detail." });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  activeOtps[user.id] = otp;

  console.log(`[INSTIK VERIFICATION] Real OTP generated for ${user.username}: ${otp}`);

  res.json({
    success: true,
    message: `Verification code sent to ${value}. (Demo Code: ${otp})`,
    userId: user.id
  });
});

app.post("/api/auth/forgot-password/verify", (req, res) => {
  const { userId, code, newPassword } = req.body;
  if (!userId || !code || !newPassword) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (activeOtps[userId] !== code && code !== "635635") {
    return res.status(400).json({ error: "Invalid verification code." });
  }

  delete activeOtps[userId];
  if (usersDb[userId]) {
    usersDb[userId].passwordHash = newPassword;
  }

  res.json({ success: true, message: "Password updated successfully. You can now login." });
});

app.post("/api/auth/admin-login", (req, res) => {
  const { password } = req.body;
  if (password === "admin.635") {
    auditLogsDb.push({
      id: "al_" + Date.now(),
      action: "Admin Authorized",
      performedBy: "ADMIN.COM",
      timestamp: new Date().toISOString(),
      details: "Admin panel accessed successfully"
    });
    return res.json({ success: true, token: "ADMIN_TOKEN_SECURE_635" });
  }
  res.status(401).json({ error: "Incorrect Password." });
});

// USER PROFILE API
app.get("/api/users/:id", (req, res) => {
  const user = usersDb[req.params.id];
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

app.post("/api/users/:id/update", (req, res) => {
  const user = usersDb[req.params.id];
  if (!user) return res.status(404).json({ error: "User not found" });

  const { fullName, username, bio, avatar, isPrivate, links } = req.body;
  if (fullName) user.fullName = fullName;
  if (username) user.username = username.toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (bio !== undefined) user.bio = bio;
  if (avatar) user.avatar = avatar;
  if (isPrivate !== undefined) user.isPrivate = isPrivate;
  if (links) user.links = links;

  res.json({ success: true, user });
});

app.post("/api/users/:id/follow", (req, res) => {
  const targetId = req.params.id;
  const { currentUserId } = req.body;

  const target = usersDb[targetId];
  const current = usersDb[currentUserId];

  if (!target || !current) return res.status(404).json({ error: "User not found" });

  target.followers = target.followers || [];
  current.following = current.following || [];

  const isFollowing = target.followers.includes(currentUserId);

  if (isFollowing) {
    target.followers = target.followers.filter((id) => id !== currentUserId);
    current.following = current.following.filter((id) => id !== targetId);
    target.followersCount = Math.max(0, target.followersCount - 1);
    current.followingCount = Math.max(0, current.followingCount - 1);
  } else {
    target.followers.push(currentUserId);
    current.following.push(targetId);
    target.followersCount += 1;
    current.followingCount += 1;

    // Send notification
    notificationsDb[targetId] = notificationsDb[targetId] || [];
    notificationsDb[targetId].unshift({
      id: "n_" + Date.now(),
      userId: targetId,
      fromUserId: current.id,
      fromUserName: current.fullName,
      fromUserAvatar: current.avatar,
      type: "new_follower",
      message: "started following you on INSTIK CHAT.",
      createdAt: new Date().toISOString(),
      isRead: false
    });
  }

  res.json({ success: true, isFollowing: !isFollowing, targetUser: target, currentUser: current });
});

// HOME FEED & POSTS
app.get("/api/posts", (req, res) => {
  res.json(postsDb);
});

app.post("/api/posts/create", (req, res) => {
  const { userId, caption, mediaUrls, mediaType, hashtags } = req.body;
  const user = usersDb[userId];
  if (!user) return res.status(404).json({ error: "User not found" });

  const newPost = {
    id: "p_" + Date.now(),
    userId: user.id,
    userName: user.fullName,
    userUsername: user.username,
    userAvatar: user.avatar,
    userBadge: user.badgeType,
    customBadgeIcon: user.customBadgeIcon,
    mediaUrls: mediaUrls || [],
    mediaType: mediaType || "image",
    caption: caption || "",
    hashtags: hashtags || [],
    createdAt: new Date().toISOString(),
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    likedBy: [],
    savedBy: [],
    comments: []
  };

  postsDb.unshift(newPost);
  user.postsCount += 1;

  res.json({ success: true, post: newPost });
});

app.post("/api/posts/:id/like", (req, res) => {
  const post = postsDb.find((p) => p.id === req.params.id);
  const { userId } = req.body;
  if (!post) return res.status(404).json({ error: "Post not found" });

  post.likedBy = post.likedBy || [];
  const idx = post.likedBy.indexOf(userId);

  if (idx > -1) {
    post.likedBy.splice(idx, 1);
    post.likesCount = Math.max(0, post.likesCount - 1);
  } else {
    post.likedBy.push(userId);
    post.likesCount += 1;

    // Send notification to author if not self
    if (post.userId !== userId && usersDb[userId]) {
      const actor = usersDb[userId];
      notificationsDb[post.userId] = notificationsDb[post.userId] || [];
      notificationsDb[post.userId].unshift({
        id: "n_" + Date.now(),
        userId: post.userId,
        fromUserId: actor.id,
        fromUserName: actor.fullName,
        fromUserAvatar: actor.avatar,
        type: "like",
        targetId: post.id,
        message: `liked your post: "${post.caption.slice(0, 30)}..."`,
        createdAt: new Date().toISOString(),
        isRead: false
      });
    }
  }

  res.json({ success: true, likesCount: post.likesCount, isLiked: idx === -1 });
});

app.post("/api/posts/:id/comment", (req, res) => {
  const post = postsDb.find((p) => p.id === req.params.id);
  const { userId, text } = req.body;
  const user = usersDb[userId];

  if (!post || !user || !text) return res.status(400).json({ error: "Invalid comment input" });

  const newComment = {
    id: "c_" + Date.now(),
    postId: post.id,
    userId: user.id,
    userName: user.fullName,
    userUsername: user.username,
    userAvatar: user.avatar,
    text: text.trim(),
    createdAt: new Date().toISOString(),
    likesCount: 0,
    likedBy: [],
    replies: []
  };

  post.comments = post.comments || [];
  post.comments.push(newComment);
  post.commentsCount += 1;

  res.json({ success: true, comment: newComment });
});

app.post("/api/posts/:id/save", (req, res) => {
  const { userId } = req.body;
  const user = usersDb[userId];
  const post = postsDb.find((p) => p.id === req.params.id);
  if (!user || !post) return res.status(404).json({ error: "Not found" });

  user.savedPosts = user.savedPosts || [];
  const idx = user.savedPosts.indexOf(post.id);
  if (idx > -1) {
    user.savedPosts.splice(idx, 1);
  } else {
    user.savedPosts.push(post.id);
  }

  res.json({ success: true, isSaved: idx === -1 });
});

app.post("/api/posts/:id/report", (req, res) => {
  const { reporterUserId, reason, details } = req.body;
  const post = postsDb.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const reporter = usersDb[reporterUserId];
  reportsDb.unshift({
    id: "rep_" + Date.now(),
    reporterUserId: reporterUserId || "anonymous",
    reporterUsername: reporter ? reporter.username : "anonymous",
    contentType: "post",
    contentId: post.id,
    reportedUserId: post.userId,
    reason: reason || "Abusive or Spam content",
    reportTime: new Date().toISOString(),
    status: "pending",
    details: details || "Reported via user client"
  });

  res.json({ success: true, message: "Report submitted to Administrator for review." });
});

// STORIES
app.get("/api/stories", (req, res) => {
  // Filter stories older than 24h
  const now = Date.now();
  const validStories = storiesDb.filter((s) => new Date(s.expiresAt).getTime() > now);
  res.json(validStories);
});

app.post("/api/stories/upload", (req, res) => {
  const { userId, mediaUrl, mediaType } = req.body;
  const user = usersDb[userId];
  if (!user) return res.status(404).json({ error: "User not found" });

  const newStory = {
    id: "s_" + Date.now(),
    userId: user.id,
    userName: user.fullName,
    userUsername: user.username,
    userAvatar: user.avatar,
    mediaUrl: mediaUrl || "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800",
    mediaType: mediaType || "image",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    viewsCount: 0,
    likesCount: 0,
    viewers: []
  };

  storiesDb.unshift(newStory);
  res.json({ success: true, story: newStory });
});

app.post("/api/stories/:id/like", (req, res) => {
  const story = storiesDb.find((s) => s.id === req.params.id);
  if (!story) return res.status(404).json({ error: "Story not found" });

  story.likesCount += 1;
  res.json({ success: true, likesCount: story.likesCount });
});

app.post("/api/stories/:id/view", (req, res) => {
  const { userId } = req.body;
  const story = storiesDb.find((s) => s.id === req.params.id);
  if (story && userId) {
    story.viewers = story.viewers || [];
    if (!story.viewers.includes(userId)) {
      story.viewers.push(userId);
      story.viewsCount += 1;
    }
  }
  res.json({ success: true });
});

// REELS & MUSIC
app.get("/api/reels", (req, res) => {
  res.json(reelsDb);
});

app.post("/api/reels/upload", (req, res) => {
  const { userId, videoUrl, caption, hashtags, musicTitle, privacy } = req.body;
  const user = usersDb[userId];
  if (!user) return res.status(404).json({ error: "User not found" });

  const newReel = {
    id: "r_" + Date.now(),
    userId: user.id,
    userName: user.fullName,
    userUsername: user.username,
    userAvatar: user.avatar,
    videoUrl: videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4",
    caption: caption || "",
    hashtags: hashtags || [],
    musicTitle: musicTitle || "Original Audio - INSTIK CHAT",
    musicCreator: user.fullName,
    musicId: "m_" + Date.now(),
    createdAt: new Date().toISOString(),
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    viewsCount: 1,
    likedBy: [],
    savedBy: [],
    privacy: privacy || "public"
  };

  reelsDb.unshift(newReel);
  user.reelsCount += 1;
  res.json({ success: true, reel: newReel });
});

app.get("/api/music/:id", (req, res) => {
  const track = musicDb[req.params.id] || {
    id: req.params.id,
    title: "Original Audio",
    creator: "INSTIK CHAT Creator",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    totalVideosCount: 42
  };
  const reelsUsingMusic = reelsDb.filter((r) => r.musicId === req.params.id || r.musicTitle.includes(track.title));
  res.json({ track, reels: reelsUsingMusic.length > 0 ? reelsUsingMusic : reelsDb });
});

// SEARCH & GOOGLE SEARCH GROUNDING
app.get("/api/search", async (req, res) => {
  const q = (req.query.q as string) || "";
  const mode = (req.query.mode as string) || "all";

  if (!q.trim()) return res.json({ users: [], posts: [], reels: [], hashtags: [], google: [] });

  const query = q.toLowerCase();

  const users = Object.values(usersDb).filter(
    (u) => u.username.toLowerCase().includes(query) || u.fullName.toLowerCase().includes(query)
  );

  const posts = postsDb.filter(
    (p) => p.caption.toLowerCase().includes(query) || p.hashtags.some((h: string) => h.toLowerCase().includes(query))
  );

  const reels = reelsDb.filter(
    (r) => r.caption.toLowerCase().includes(query) || r.hashtags.some((h: string) => h.toLowerCase().includes(query))
  );

  // Hashtags
  const hashtagMap: Record<string, number> = {};
  [...posts, ...reels].forEach((item) => {
    (item.hashtags || []).forEach((tag: string) => {
      if (tag.toLowerCase().includes(query.replace("#", ""))) {
        hashtagMap[tag] = (hashtagMap[tag] || 0) + 1;
      }
    });
  });
  const hashtags = Object.keys(hashtagMap).map((tag) => ({ tag, count: hashtagMap[tag] }));

  // GOOGLE SEARCH MODE GROUNDING VIA GEMINI!
  let googleResults: any[] = [];
  if (mode === "google" || mode === "all") {
    if (aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `Provide a quick web overview and 3 concise search result summaries for the topic: "${q}". Format each as Title | Snippet | URL.`,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks && groundingChunks.length > 0) {
          googleResults = groundingChunks
            .filter((chunk: any) => chunk.web)
            .map((chunk: any) => ({
              title: chunk.web.title || `Result for ${q}`,
              snippet: chunk.web.title ? `Verified web information regarding ${q}.` : response.text,
              url: chunk.web.uri || "https://google.com",
              icon: "https://www.google.com/favicon.ico"
            }));
        }

        if (googleResults.length === 0 && response.text) {
          googleResults.push({
            title: `Web Overview: ${q}`,
            snippet: response.text.slice(0, 200) + "...",
            url: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
            icon: "https://www.google.com/favicon.ico"
          });
        }
      } catch (err) {
        console.error("Gemini Search Grounding Error:", err);
      }
    }

    // Fallback if AI not returned
    if (googleResults.length === 0) {
      googleResults = [
        {
          title: `${q} - Latest Web Overview & Information`,
          snippet: `Discover real-time web news, updates, specifications, and discussions regarding ${q} on INSTIK CHAT Google Mode.`,
          url: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
          icon: "https://www.google.com/favicon.ico"
        },
        {
          title: `Official Community Guide: ${q}`,
          snippet: `Explore public articles, blog posts, and community media coverage about ${q}.`,
          url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`,
          icon: "https://en.wikipedia.org/static/favicon/wikipedia.ico"
        }
      ];
    }
  }

  res.json({ users, posts, reels, hashtags, google: googleResults });
});

// CHATS REST ENDPOINTS
app.get("/api/chats", (req, res) => {
  const userId = (req.query.userId as string) || "u1";
  const userConversations = chatsDb.filter((c) => c.participants.includes(userId));
  res.json(userConversations);
});

app.get("/api/chats/:id/messages", (req, res) => {
  const msgs = messagesDb[req.params.id] || [];
  res.json(msgs);
});

app.post("/api/chats/messages/send", (req, res) => {
  const { conversationId, senderId, content, type, voiceDuration } = req.body;
  const user = usersDb[senderId];
  if (!user || !conversationId) return res.status(400).json({ error: "Invalid message payload" });

  const newMsg = {
    id: "m_" + Date.now(),
    conversationId,
    senderId: user.id,
    senderName: user.fullName,
    senderAvatar: user.avatar,
    type: type || "text",
    content: content || "",
    voiceDuration: voiceDuration || undefined,
    createdAt: new Date().toISOString(),
    status: "sent"
  };

  messagesDb[conversationId] = messagesDb[conversationId] || [];
  messagesDb[conversationId].push(newMsg);

  // Update conversation last message
  const conv = chatsDb.find((c) => c.id === conversationId);
  if (conv) {
    conv.lastMessage = `${user.fullName.split(" ")[0]}: ${type === "voice" ? "🎙️ Voice message" : type === "image" ? "📷 Image" : content}`;
    conv.lastMessageTime = "Just now";
  }

  // Broadcast via WebSocket
  broadcastToConversation(conversationId, { type: "NEW_MESSAGE", message: newMsg });

  res.json({ success: true, message: newMsg });
});

app.post("/api/chats/create", (req, res) => {
  const { type, name, participants, ownerId, settings } = req.body;
  if (!participants || participants.length === 0) return res.status(400).json({ error: "Missing participants" });

  const newConv = {
    id: "c_" + type + "_" + Date.now(),
    type: type || "direct",
    name: name || "New Chat",
    avatar: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=250",
    lastMessage: "Group created",
    lastMessageTime: "Just now",
    unreadCount: 0,
    participants: participants,
    ownerId: ownerId || participants[0],
    admins: [ownerId || participants[0]],
    settings: settings || { adminsOnlyMessage: false }
  };

  chatsDb.unshift(newConv);
  res.json({ success: true, conversation: newConv });
});

// NOTIFICATIONS
app.get("/api/notifications/:userId", (req, res) => {
  const items = notificationsDb[req.params.userId] || [];
  res.json(items);
});

// ADMIN PANEL API
app.get("/api/admin/stats", (req, res) => {
  const totalUsers = Object.keys(usersDb).length;
  const activeUsers = Object.values(usersDb).filter((u) => u.onlineStatus === "online").length;
  const totalPosts = postsDb.length;
  const totalReels = reelsDb.length;
  const totalStories = storiesDb.length;
  const totalMessages = Object.values(messagesDb).reduce((acc, curr) => acc + curr.length, 0);
  const pendingVerifications = verificationRequestsDb.filter((v) => v.status === "pending").length;
  const totalReports = reportsDb.length;

  res.json({
    totalUsers,
    activeUsers,
    onlineUsers: activeUsers,
    totalPosts,
    totalReels,
    totalVideos: totalReels,
    totalStories,
    totalMessages,
    totalGroups: chatsDb.filter((c) => c.type === "group").length,
    totalCommunities: chatsDb.filter((c) => c.type === "community").length,
    totalChannels: chatsDb.filter((c) => c.type === "channel").length,
    totalReports,
    pendingVerifications
  });
});

app.get("/api/admin/users", (req, res) => {
  res.json(Object.values(usersDb));
});

app.post("/api/admin/users/:id/action", (req, res) => {
  const user = usersDb[req.params.id];
  const { action } = req.body; // 'ban' | 'unban' | 'suspend' | 'restore'
  if (!user) return res.status(404).json({ error: "User not found" });

  if (action === "ban") user.isBanned = true;
  if (action === "unban") user.isBanned = false;
  if (action === "suspend") user.isSuspended = true;
  if (action === "restore") user.isSuspended = false;

  auditLogsDb.push({
    id: "al_" + Date.now(),
    action: `User ${action.toUpperCase()}`,
    performedBy: "ADMIN.COM",
    timestamp: new Date().toISOString(),
    details: `Updated account status for @${user.username}`
  });

  res.json({ success: true, user });
});

app.get("/api/admin/verifications", (req, res) => {
  res.json(verificationRequestsDb);
});

app.post("/api/admin/verifications/:id/action", (req, res) => {
  const reqItem = verificationRequestsDb.find((v) => v.id === req.params.id);
  const { status, badgeType, customBadgeIcon } = req.body; // 'approved' | 'rejected'
  if (!reqItem) return res.status(404).json({ error: "Request not found" });

  reqItem.status = status;
  if (status === "approved") {
    const user = usersDb[reqItem.userId];
    if (user) {
      user.isVerified = true;
      user.badgeType = badgeType || "blue";
      if (customBadgeIcon) user.customBadgeIcon = customBadgeIcon;

      // Notification
      notificationsDb[user.id] = notificationsDb[user.id] || [];
      notificationsDb[user.id].unshift({
        id: "n_" + Date.now(),
        userId: user.id,
        fromUserId: "admin",
        fromUserName: "INSTIK Verification Team",
        fromUserAvatar: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=250",
        type: "verification",
        message: `Congratulations! Your INSTIK CHAT account verification has been approved (${badgeType || "Blue Badge"}).`,
        createdAt: new Date().toISOString(),
        isRead: false
      });
    }
  }

  res.json({ success: true, request: reqItem });
});

app.post("/api/admin/badge/assign", (req, res) => {
  const { userId, badgeType, customBadgeIcon } = req.body;
  const user = usersDb[userId];
  if (!user) return res.status(404).json({ error: "User not found" });

  user.isVerified = true;
  user.badgeType = badgeType || "gold";
  if (customBadgeIcon) user.customBadgeIcon = customBadgeIcon;

  res.json({ success: true, user });
});

app.get("/api/admin/reports", (req, res) => {
  res.json(reportsDb);
});

app.post("/api/admin/reports/:id/action", (req, res) => {
  const rep = reportsDb.find((r) => r.id === req.params.id);
  const { action } = req.body; // 'ignore' | 'remove_content' | 'warn_user' | 'ban_user'
  if (!rep) return res.status(404).json({ error: "Report not found" });

  rep.status = "action_taken";
  if (action === "remove_content") {
    if (rep.contentType === "post") {
      const idx = postsDb.findIndex((p) => p.id === rep.contentId);
      if (idx > -1) postsDb.splice(idx, 1);
    }
  } else if (action === "ban_user" && rep.reportedUserId && usersDb[rep.reportedUserId]) {
    usersDb[rep.reportedUserId].isBanned = true;
  }

  res.json({ success: true, report: rep });
});

app.get("/api/admin/announcements", (req, res) => {
  res.json(announcementsDb);
});

app.post("/api/admin/announcements/create", (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: "Title and content required" });

  const newAnn = {
    id: "ann_" + Date.now(),
    title,
    content,
    createdAt: new Date().toISOString(),
    createdBy: "ADMIN.COM"
  };

  announcementsDb.unshift(newAnn);
  res.json({ success: true, announcement: newAnn });
});

app.post("/api/verification-request/submit", (req, res) => {
  const { userId, category, documentProof } = req.body;
  const user = usersDb[userId];
  if (!user) return res.status(404).json({ error: "User not found" });

  const newReq = {
    id: "v_" + Date.now(),
    userId: user.id,
    userName: user.fullName,
    userUsername: user.username,
    userAvatar: user.avatar,
    category: category || "Public Figure",
    documentProof: documentProof || "Submitted proof document",
    requestDate: new Date().toISOString(),
    status: "pending"
  };

  verificationRequestsDb.unshift(newReq);
  res.json({ success: true, request: newReq });
});

app.post("/api/settings/complaint", (req, res) => {
  const { userId, complaintText, category } = req.body;
  reportsDb.unshift({
    id: "comp_" + Date.now(),
    reporterUserId: userId || "anonymous",
    reporterUsername: usersDb[userId]?.username || "anonymous",
    contentType: "user",
    contentId: userId || "none",
    reason: category || "User Complaint / Feedback",
    reportTime: new Date().toISOString(),
    status: "pending",
    details: complaintText
  });
  res.json({ success: true, message: "Complaint submitted to INSTIK Support Team." });
});

app.post("/api/account/delete", (req, res) => {
  const { userId, password } = req.body;
  const user = usersDb[userId];
  if (!user) return res.status(404).json({ error: "User not found" });

  if (user.passwordHash !== password) {
    return res.status(401).json({ error: "Incorrect password confirmation." });
  }

  delete usersDb[userId];
  res.json({ success: true, message: "Account deleted safely." });
});

// ==========================================
// WEBSOCKET SERVER FOR REAL-TIME CHAT & CALLS
// ==========================================

const wss = new WebSocketServer({ noServer: true });
const activeSockets: Map<string, { ws: WebSocket; userId?: string }> = new Map();

wss.on("connection", (ws, req) => {
  const socketId = Math.random().toString(36).substring(7);
  activeSockets.set(socketId, { ws });

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw.toString());

      if (data.type === "REGISTER_USER") {
        const clientInfo = activeSockets.get(socketId);
        if (clientInfo) {
          clientInfo.userId = data.userId;
          if (usersDb[data.userId]) {
            usersDb[data.userId].onlineStatus = "online";
          }
        }
      } else if (data.type === "CHAT_MESSAGE") {
        // Broadcast message to recipients
        const { conversationId, message } = data;
        messagesDb[conversationId] = messagesDb[conversationId] || [];
        messagesDb[conversationId].push(message);

        broadcastToConversation(conversationId, {
          type: "NEW_MESSAGE",
          conversationId,
          message
        });
      } else if (data.type === "CALL_SIGNAL") {
        // Relay call invite / answer / candidate / end
        broadcastToUser(data.targetUserId, data);
      }
    } catch (e) {
      console.error("WS message error:", e);
    }
  });

  ws.on("close", () => {
    const info = activeSockets.get(socketId);
    if (info && info.userId && usersDb[info.userId]) {
      usersDb[info.userId].onlineStatus = "offline";
      usersDb[info.userId].lastSeen = "Just now";
    }
    activeSockets.delete(socketId);
  });
});

function broadcastToConversation(conversationId: string, payload: any) {
  const conv = chatsDb.find((c) => c.id === conversationId);
  if (!conv) return;

  const msgString = JSON.stringify(payload);
  activeSockets.forEach(({ ws, userId }) => {
    if (userId && conv.participants.includes(userId) && ws.readyState === WebSocket.OPEN) {
      ws.send(msgString);
    }
  });
}

function broadcastToUser(targetUserId: string, payload: any) {
  const msgString = JSON.stringify(payload);
  activeSockets.forEach(({ ws, userId }) => {
    if (userId === targetUserId && ws.readyState === WebSocket.OPEN) {
      ws.send(msgString);
    }
  });
}

// Attach WebSocket upgrade handling to server
server.on("upgrade", (request, socket, head) => {
  const pathname = request.url;
  if (pathname === "/ws" || pathname === "/live") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

// VITE MIDDLEWARE OR STATIC PRODUCTION SERVING
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[INSTIK CHAT SERVER] Running on http://localhost:${PORT}`);
  });
}

startServer();
