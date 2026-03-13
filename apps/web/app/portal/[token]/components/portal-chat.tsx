"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Loader2, Paperclip, Send } from "lucide-react";

interface Message {
  id: string;
  contentEncrypted: string;
  createdAt: string;
  isFromClient: boolean;
  sender?: {
    name: string;
    role: string;
  };
}

export function PortalChat({ messages: initialMessages, token }: { messages: Message[], token: string }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/portal/access/${token}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentEncrypted: newMessage }), // MVP: no actual encryption yet
      });

      if (!res.ok) throw new Error("Erro ao enviar mensagem");

      const newMessageObj = await res.json();
      setMessages([...messages, newMessageObj.data || newMessageObj]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
      alert("Não foi possível enviar a mensagem. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="p-4 border-b border-gray-100 bg-white shadow-sm z-10">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          Mensagens
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Comunicação direta e encriptada com o seu advogado.
        </p>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm">Não há mensagens neste processo.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isClient = msg.isFromClient;
            return (
              <div key={msg.id} className={`flex flex-col max-w-[85%] ${isClient ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                <div className={`text-[11px] text-gray-400 mb-1 px-1 flex items-center gap-2`}>
                  <span className="font-medium text-gray-600">{isClient ? "Você" : msg.sender?.name || "Advogado"}</span>
                  <span>{format(new Date(msg.createdAt), "dd/MM, HH:mm")}</span>
                </div>
                <div 
                  className={`px-4 py-2.5 rounded-2xl ${
                    isClient 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.contentEncrypted}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escreva a sua mensagem..."
              className="w-full resize-none rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 pr-10"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !newMessage.trim()}
            className="h-[46px] w-[46px] shrink-0 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
          </button>
        </form>
      </div>
    </>
  );
}
