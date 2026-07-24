import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchUserChats, fetchChatMessages, createConversation } from '../../services/api';
import { UserBadge } from '../UserBadge';
import { CallModal } from '../CallModal';
import {
  Send,
  Plus,
  Phone,
  Video,
  Bot,
  Search,
  Users,
  Radio,
  Sparkles,
  Paperclip,
  Mic,
  MoreVertical,
  X
} from 'lucide-react';

export const ChatSystem: React.FC = () => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'direct' | 'group' | 'channel' | 'ai'>('all');
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Calls
  const [activeCall, setActiveCall] = useState<{ type: 'audio' | 'video'; name: string; avatar?: string } | null>(null);

  // AI Options
  const [aiThinkingMode, setAiThinkingMode] = useState(true);

  // New Chat Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'group' | 'channel' | 'community'>('group');
  const [createName, setCreateName] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadChats = async () => {
    if (!currentUser) return;
    const list = await fetchUserChats(currentUser.id);
    setChats(list);
  };

  useEffect(() => {
    loadChats();
  }, [currentUser]);

  // Connect WebSocket
  useEffect(() => {
    if (!currentUser) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'REGISTER', userId: currentUser.id }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_MESSAGE') {
          if (activeChat && data.message.conversationId === activeChat.id) {
            setMessages((prev) => [...prev, data.message]);
          }
          loadChats();
        }
      } catch (e) {
        console.error('WS Error:', e);
      }
    };

    setSocket(ws);
    return () => {
      ws.close();
    };
  }, [currentUser, activeChat]);

  useEffect(() => {
    if (activeChat) {
      fetchChatMessages(activeChat.id).then((msgs) => setMessages(msgs));
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeChat || !messageText.trim()) return;

    const textToSend = messageText.trim();
    setMessageText('');

    // Optimistic insert
    const tempMsg = {
      id: `msg_${Date.now()}`,
      conversationId: activeChat.id,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      content: textToSend,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    if (activeChat.isAi) {
      // Send to server Gemini endpoint
      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: textToSend,
            thinkingMode: aiThinkingMode,
          }),
        });
        const data = await res.json();
        const aiReply = {
          id: `msg_ai_${Date.now()}`,
          conversationId: activeChat.id,
          senderId: 'user_ai_assistant',
          senderName: 'INSTIK AI Assistant',
          content: data.reply || 'Sorry, I am currently processing another request.',
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiReply]);
      } catch {
        // Fallback reply
      }
    } else {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: 'SEND_MESSAGE',
            conversationId: activeChat.id,
            senderId: currentUser.id,
            content: textToSend,
          })
        );
      }
    }
  };

  const handleCreateGroupChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !createName.trim()) return;

    await createConversation({
      type: createType,
      name: createName.trim(),
      participants: [currentUser.id],
      ownerId: currentUser.id,
    });

    setCreateName('');
    setShowCreateModal(false);
    loadChats();
  };

  const filteredChats = chats.filter((c) => {
    if (filter === 'ai') return c.isAi;
    if (filter === 'direct') return c.type === 'direct' && !c.isAi;
    if (filter === 'group') return c.type === 'group' || c.type === 'community';
    if (filter === 'channel') return c.type === 'channel';
    return true;
  });

  return (
    <div className="w-full max-w-4xl mx-auto h-[calc(100vh-120px)] my-2 bg-[#0F0F0F] border border-[#1A1A1A] rounded-3xl overflow-hidden flex flex-col md:flex-row text-white shadow-2xl">
      {/* Left Chat List Panel */}
      <div className={`w-full md:w-80 bg-[#050505] border-r border-[#1A1A1A] flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        {/* Top Header */}
        <div className="p-4 border-b border-[#1A1A1A] flex justify-between items-center">
          <h2 className="font-black text-xs tracking-widest text-[#34D399] uppercase">Active Chats</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 rounded-xl bg-[#121212] border border-[#1F1F1F] text-[#34D399] hover:bg-[#1A1A1A]"
            title="Create Group / Channel"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 p-2 border-b border-[#1A1A1A] overflow-x-auto scrollbar-none text-[11px] font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-[#34D399] text-black font-bold' : 'bg-[#121212] text-gray-400 hover:text-white'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('ai')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1 transition-colors ${filter === 'ai' ? 'bg-[#34D399] text-black font-bold' : 'bg-[#121212] text-[#34D399]'}`}
          >
            <Bot className="w-3 h-3" /> AI Chat
          </button>
          <button
            onClick={() => setFilter('direct')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${filter === 'direct' ? 'bg-[#34D399] text-black font-bold' : 'bg-[#121212] text-gray-400 hover:text-white'}`}
          >
            Direct
          </button>
          <button
            onClick={() => setFilter('group')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${filter === 'group' ? 'bg-[#34D399] text-black font-bold' : 'bg-[#121212] text-gray-400 hover:text-white'}`}
          >
            Groups
          </button>
          <button
            onClick={() => setFilter('channel')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${filter === 'channel' ? 'bg-[#34D399] text-black font-bold' : 'bg-[#121212] text-gray-400 hover:text-white'}`}
          >
            Channels
          </button>
        </div>

        {/* List of Chats */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`p-3.5 flex items-center gap-3 cursor-pointer border-b border-[#1A1A1A] hover:bg-[#121212] transition-colors ${
                activeChat?.id === chat.id ? 'bg-[#121212] border-l-4 border-l-[#34D399]' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={chat.avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover border border-[#1F1F1F]"
                />
                {chat.isAi && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#34D399] text-black rounded-full flex items-center justify-center p-0.5">
                    <Sparkles className="w-3 h-3" />
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold text-xs text-white truncate flex items-center gap-1">
                    {chat.name}
                    {chat.badge && <UserBadge badgeType={chat.badge} />}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">{chat.lastTime}</span>
                </div>
                <p className="text-xs text-gray-400 truncate">{chat.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Chat Conversation View */}
      {activeChat ? (
        <div className="flex-1 flex flex-col bg-[#0F0F0F]">
          {/* Chat Top Header */}
          <div className="p-3.5 bg-[#050505] border-b border-[#1A1A1A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveChat(null)} className="md:hidden text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <img src={activeChat.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-[#1F1F1F]" />
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-1">
                  <span>{activeChat.name}</span>
                  {activeChat.badge && <UserBadge badgeType={activeChat.badge} />}
                </div>
                <div className="text-[11px] text-[#34D399]">
                  {activeChat.isAi ? 'Gemini 3.1 AI Engine Active' : 'Online'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {activeChat.isAi ? (
                <div className="flex items-center gap-2 bg-[#121212] border border-[#1F1F1F] px-3 py-1 rounded-full text-[11px]">
                  <span className="text-gray-400">Thinking Mode:</span>
                  <button
                    onClick={() => setAiThinkingMode(!aiThinkingMode)}
                    className={`font-bold ${aiThinkingMode ? 'text-[#34D399]' : 'text-gray-500'}`}
                  >
                    {aiThinkingMode ? 'ON (Pro)' : 'OFF (Lite)'}
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setActiveCall({ type: 'audio', name: activeChat.name, avatar: activeChat.avatar })}
                    className="p-2 rounded-xl bg-[#121212] text-gray-300 hover:text-[#34D399] hover:bg-[#1A1A1A]"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveCall({ type: 'video', name: activeChat.name, avatar: activeChat.avatar })}
                    className="p-2 rounded-xl bg-[#121212] text-gray-300 hover:text-[#34D399] hover:bg-[#1A1A1A]"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.map((m) => {
              const isMe = m.senderId === currentUser?.id;
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-gray-500 mb-0.5">{m.senderName}</span>
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#0F1F18] border border-[#34D399]/30 text-[#F5F5F5] font-medium rounded-tr-none shadow-md'
                        : 'bg-[#121212] border border-[#1F1F1F] text-gray-200 rounded-tl-none'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#050505] border-t border-[#1A1A1A] flex items-center gap-2">
            <button type="button" className="p-2 text-gray-400 hover:text-[#34D399]">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Message ${activeChat.name}...`}
              className="flex-1 px-4 py-2.5 bg-[#121212] border border-[#1F1F1F] rounded-2xl text-xs text-white outline-none focus:border-[#34D399]"
            />
            <button
              type="submit"
              className="p-2.5 bg-[#34D399] text-black font-bold rounded-2xl hover:bg-[#2EB886] transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center text-gray-500">
          <Bot className="w-12 h-12 text-[#34D399]/40 mb-3" />
          <h3 className="font-bold text-white mb-1">Select a Chat or Start with INSTIK AI</h3>
          <p className="text-xs text-gray-400">Send real-time messages, make calls, or create groups.</p>
        </div>
      )}

      {/* Call Overlay */}
      {activeCall && (
        <CallModal
          callType={activeCall.type}
          recipientName={activeCall.name}
          recipientAvatar={activeCall.avatar}
          onEndCall={() => setActiveCall(null)}
        />
      )}

      {/* Group / Channel Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#0F0F0F] border border-[#1A1A1A] rounded-2xl p-5 text-white">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-[#34D399] mb-3">Create Group or Channel</h3>
            <form onSubmit={handleCreateGroupChannel} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Type</label>
                <div className="flex bg-[#121212] p-1 rounded-xl border border-[#1F1F1F]">
                  <button
                    type="button"
                    onClick={() => setCreateType('group')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${createType === 'group' ? 'bg-[#34D399] text-black' : 'text-gray-400'}`}
                  >
                    Group
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateType('channel')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${createType === 'channel' ? 'bg-[#34D399] text-black' : 'text-gray-400'}`}
                  >
                    Channel
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Green Tech Innovators"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#1F1F1F] rounded-xl text-xs text-white outline-none focus:border-[#34D399]"
                  required
                />
              </div>

              <button
                type="submit"
                className="py-2.5 bg-[#34D399] text-black font-bold rounded-xl text-xs hover:bg-[#2EB886]"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
