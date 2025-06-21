// components/P2PChat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/client';
import { useWebRTC, ConnectionState } from '@/hooks/use-webrtc';

export default function P2PChat() {
  const supabase = createClient();
  const { connectionState, messages, currentRoomId, joinRoom, sendMessage, disconnect, canSendMessage } = useWebRTC();
  
  const [setupData, setSetupData] = useState({
    roomId: ''
  });
  const [messageInput, setMessageInput] = useState('');
  const [status, setStatus] = useState('Enter your Supabase credentials to start');
  const [showChat, setShowChat] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update status based on connection state
  useEffect(() => {
    if (!showChat) return;

    switch (connectionState) {
      case 'disconnected':
        setStatus('Disconnected - Waiting for peer...');
        break;
      case 'connecting':
        setStatus('Connecting to peer...');
        break;
      case 'connected':
        setStatus('Connected! You can now chat.');
        break;
    }
  }, [connectionState, showChat]);

  const handleInitializeChat = async () => {
    const {  roomId } = setupData;

    if ( !roomId.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      
      
      // Wait a bit for initialization
      setTimeout(async () => {
        setStatus('Connecting to room...');
        await joinRoom(roomId);
        setShowChat(true);
      }, 100);

    } catch (error) {
      console.error('Error initializing chat:', error);
      alert('Error connecting to Supabase. Check your credentials.');
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const success = sendMessage(messageInput);
    if (success) {
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const getConnectionIndicator = () => {
    switch (connectionState) {
      case 'connected':
        return {
          text: '🟢 Connected - Messages are P2P encrypted',
          className: 'bg-green-50 text-green-600'
        };
      case 'connecting':
        return {
          text: '🟡 Connecting to peer...',
          className: 'bg-yellow-50 text-yellow-600'
        };
      default:
        return {
          text: '🔴 Disconnected - Waiting for peer...',
          className: 'bg-red-50 text-red-600'
        };
    }
  };

  const connectionIndicator = getConnectionIndicator();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 text-center">
          <h1 className="text-xl font-bold">🔗 P2P Chat</h1>
          <div className="text-sm opacity-90 mt-1">{status}</div>
        </div>

        {/* Setup Form */}
        {!showChat && (
          <div className="p-5 border-b border-gray-200">
            <div className="space-y-4">
             
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Room ID:
                </label>
                <input
                  type="text"
                  value={setupData.roomId}
                  onChange={(e) => setSetupData(prev => ({ ...prev, roomId: e.target.value }))}
                  placeholder="Enter room name (e.g., room123)"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
              
              <button
                onClick={handleInitializeChat}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-colors"
              >
                Join Chat Room
              </button>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        {showChat && (
          <>
            {/* Connection Indicator */}
            <div className={`px-3 py-2 text-center text-xs font-semibold ${connectionIndicator.className}`}>
              {connectionIndicator.text}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 bg-gray-50 space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`max-w-xs p-3 rounded-2xl animate-fade-in ${
                    message.isSent
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white ml-auto text-right'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  {message.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
              
              {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm">
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-5 bg-white border-t border-gray-200 flex gap-3">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={!canSendMessage}
                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!canSendMessage || !messageInput.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}