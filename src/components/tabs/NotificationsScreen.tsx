import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchNotifications } from '../../services/api';
import { NotificationItem } from '../../types';
import { Bell, Heart, MessageCircle, UserPlus, ShieldAlert } from 'lucide-react';

export const NotificationsScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications(currentUser.id).then((n) => setNotifications(n));
    }
  }, [currentUser]);

  return (
    <div className="w-full max-w-lg mx-auto pb-24 text-white p-2">
      <h2 className="text-xs font-black uppercase tracking-widest text-[#34D399] mb-4 px-2">Notifications</h2>

      <div className="flex flex-col gap-2">
        {notifications.length === 0 ? (
          <div className="text-gray-500 text-xs text-center py-12">No notifications yet.</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="p-3.5 bg-[#0F0F0F] border border-[#1A1A1A] rounded-2xl flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#121212] border border-[#1F1F1F] text-[#34D399]">
                {n.type === 'like' && <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />}
                {n.type === 'comment' && <MessageCircle className="w-4 h-4 text-[#34D399]" />}
                {n.type === 'follow' && <UserPlus className="w-4 h-4 text-sky-400" />}
                {n.type === 'system' && <ShieldAlert className="w-4 h-4 text-amber-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs text-white">
                  <span className="font-bold mr-1">{n.senderName}</span>
                  <span>{n.text}</span>
                </div>
                <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
