import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Send, Paperclip, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';

export default function AgentChatModal({ agent, onClose }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [fileUrls, setFileUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  // Create conversation on mount
  useEffect(() => {
    base44.agents.createConversation({
      agent_name: agent.id,
      metadata: { name: `${agent.name} session` },
    }).then(conv => {
      setConversation(conv);
      setMessages(conv.messages || []);
    });
  }, [agent.id]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, data => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [conversation?.id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFileUrls(prev => [...prev, file_url]);
    setUploading(false);
  };

  const handleSend = async () => {
    if ((!input.trim() && fileUrls.length === 0) || !conversation || sending) return;
    setSending(true);
    const msgPayload = { role: 'user', content: input.trim() };
    if (fileUrls.length > 0) msgPayload.file_urls = fileUrls;
    setInput('');
    setFileUrls([]);
    await base44.agents.addMessage(conversation, msgPayload);
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isTyping = messages.length > 0 && messages[messages.length - 1]?.role === 'user' && sending;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-white w-full md:max-w-2xl md:rounded-2xl shadow-2xl flex flex-col h-[92vh] md:h-[80vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <span className="text-2xl">{agent.emoji}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#1B4332] text-sm">{agent.name}</h3>
            <p className="text-xs text-gray-400 italic truncate">{agent.tagline}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {!conversation ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
              <span className="text-5xl">{agent.emoji}</span>
              <p className="text-sm font-medium text-gray-700">Hi! I'm your {agent.name}.</p>
              <p className="text-xs text-gray-400">{agent.description}</p>
            </div>
          ) : (
            messages.map((msg, i) => <MessageBubble key={i} message={msg} />)
          )}

          {isTyping && (
            <div className="flex gap-3 items-center">
              <div className="h-7 w-7 rounded-lg bg-gray-100 flex items-center justify-center">
                <span className="text-base">{agent.emoji}</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Attached files preview */}
        {fileUrls.length > 0 && (
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {fileUrls.map((url, i) => (
              <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => setFileUrls(f => f.filter((_, j) => j !== i))}
                  className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]"
                >×</button>
              </div>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-end gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-gray-400 hover:text-[#52796F] transition-colors p-1 flex-shrink-0"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${agent.name}…`}
              rows={1}
              className="flex-1 bg-transparent resize-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none max-h-28 py-1"
            />

            <button
              onClick={handleSend}
              disabled={(!input.trim() && fileUrls.length === 0) || sending || !conversation}
              className="bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-40 text-white rounded-lg p-2 flex-shrink-0 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}