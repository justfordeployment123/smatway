"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import io from "socket.io-client";
import { initChat, getMessages } from "@/lib/api";
import { SendIcon, XIcon } from "@/app/dashboard/_Components/Icons";
import { spring } from "@/app/dashboard/_Components/ui";

interface Message {
  id?: string;
  content: string;
  senderId: string;
  sender?: { name: string };
  createdAt: string;
}

interface ChatModalProps {
  bookingId: string;
  currentUserId: string;
  title?: string;
  subtitle?: string;
  onClose: () => void;
}

/**
 * Self-contained chat popup. Manages its own socket connection, chat init,
 * and message state. The parent just mounts/unmounts it and passes onClose.
 * Uses an internal `visible` flag so the exit animation plays before onClose fires.
 */
export function ChatModal({
  bookingId,
  currentUserId,
  title = "Chat",
  subtitle,
  onClose,
}: ChatModalProps) {
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const chatIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const chat = await initChat(bookingId);
        if (!mounted) return;
        chatIdRef.current = chat.id;

        const msgs = await getMessages(chat.id);
        if (!mounted) return;
        setMessages(msgs);

        const socket = io(
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002",
          { query: { userId: currentUserId }, reconnection: true },
        );
        socketRef.current = socket;
        socket.emit("join-chat", { chatId: chat.id });
        socket.on("message", (msg: Message) => {
          if (mounted) setMessages((prev) => [...prev, msg]);
        });
      } catch {
        // silent — chat may not be available yet
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
      if (socketRef.current) {
        if (chatIdRef.current) {
          socketRef.current.emit("leave-chat", { chatId: chatIdRef.current });
        }
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [bookingId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !chatIdRef.current || !socketRef.current?.connected) return;
    setSending(true);
    socketRef.current.emit("message", {
      chatId: chatIdRef.current,
      content: trimmed,
      userId: currentUserId,
    });
    setText("");
    setSending(false);
  }

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence onExitComplete={onClose}>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setVisible(false)}
          className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={spring}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-[14px] font-semibold text-zinc-950">{title}</h3>
                {subtitle && (
                  <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
                )}
              </div>
              <button
                onClick={() => setVisible(false)}
                className="text-slate-400 hover:text-zinc-900 p-1 -m-1 transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            {loading ? (
              <div className="p-10 text-center text-sm text-slate-400">Loading…</div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/60">
                  {messages.length === 0 ? (
                    <div className="text-center text-[13px] text-slate-400 mt-16">
                      No messages yet. Say hello.
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const mine = msg.senderId === currentUserId;
                      return (
                        <motion.div
                          key={msg.id ?? i}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...spring, stiffness: 300 }}
                          className={`flex ${mine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] px-3 py-2 rounded-2xl text-[13px] ${
                              mine
                                ? "bg-zinc-950 text-white rounded-br-md"
                                : "bg-white border border-slate-200 text-zinc-900 rounded-bl-md"
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p
                              className={`text-[10px] mt-1 ${
                                mine ? "text-white/50" : "text-slate-400"
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-slate-100 flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder="Type a message…"
                    className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !text.trim()}
                    className="bg-zinc-950 text-white px-3.5 rounded-xl hover:bg-zinc-800 disabled:opacity-40 transition-all active:scale-[0.97] flex items-center justify-center"
                  >
                    <SendIcon className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
