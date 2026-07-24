import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2 } from 'lucide-react';

interface CallModalProps {
  callType: 'audio' | 'video';
  recipientName: string;
  recipientAvatar?: string;
  onEndCall: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({ callType, recipientName, recipientAvatar, onEndCall }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/95 backdrop-blur-xl text-white p-4 animate-fadeIn">
      <div className="relative w-full max-w-md h-[80vh] bg-[#0F0F0F] border border-[#1A1A1A] rounded-3xl overflow-hidden flex flex-col justify-between p-6 shadow-2xl">
        {/* Top Call Bar */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-semibold text-[#34D399] uppercase tracking-widest">
            INSTIK {callType === 'video' ? 'Video' : 'Voice'} Call
          </span>
          <span className="text-sm font-mono text-gray-400">{formatTime(callDuration)}</span>
        </div>

        {/* Center Video/Avatar */}
        <div className="flex flex-col items-center justify-center my-auto">
          {callType === 'video' && !isVideoOff ? (
            <div className="relative w-full aspect-[3/4] bg-[#050505] rounded-2xl overflow-hidden border border-[#1A1A1A]">
              <img
                src={recipientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 right-3 w-28 h-36 bg-[#121212] rounded-xl border border-[#34D399]/40 overflow-hidden shadow-lg">
                <div className="w-full h-full flex items-center justify-center bg-[#050505] text-gray-500 text-[10px]">
                  You
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-28 h-28 rounded-full p-1 bg-[#34D399] animate-pulse">
                  <img
                    src={recipientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt=""
                    className="w-full h-full rounded-full object-cover border-2 border-[#0F0F0F]"
                  />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white">{recipientName}</h2>
              <span className="text-xs text-[#34D399] font-semibold">Connected</span>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-[#1A1A1A]">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all ${isMuted ? 'bg-rose-500 text-white' : 'bg-[#121212] border border-[#1F1F1F] text-gray-300 hover:text-white'}`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {callType === 'video' && (
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-rose-500 text-white' : 'bg-[#121212] border border-[#1F1F1F] text-gray-300 hover:text-white'}`}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
          )}

          <button
            onClick={onEndCall}
            className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition-all scale-110"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
