import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; name: string; avatarUrl?: string; role?: 'traveler' | 'transporter' };
  createdAt: string;
}

interface Notification {
  type: string;
  message?: Message;
  bookingId?: string;
  [key: string]: any;
}

let lastBrowserNotificationRef: { key: string; time: number } | null = null;

export function useChat(userId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const lastNotificationRef = useRef<{ id: string; time: number } | null>(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002', {
      query: { userId },
      reconnection: true,
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('message', (message: Message) => {
      setMessages(prev => {
        const chatId = `chat-${message.id}`;
        const msgs = prev.get(chatId) || [];
        return new Map(prev).set(chatId, [...msgs, message]);
      });
    });

    socket.on('notification', (notification: Notification) => {
      const messageId = notification.message?.id;
      const now = Date.now();
      const lastNotification = lastNotificationRef.current;
      const isDuplicate = !!lastNotification && lastNotification.id === messageId && (now - lastNotification.time) < 1000;
      const notificationKey = messageId
        || `${notification.type}:${notification.message?.senderId || ''}:${notification.message?.createdAt || ''}:${notification.message?.content || ''}`;
      const isGlobalDuplicate = !!lastBrowserNotificationRef
        && lastBrowserNotificationRef.key === notificationKey
        && (now - lastBrowserNotificationRef.time) < 3000;
      const senderRole = notification.message?.sender?.role;
      const senderRoleLabel = senderRole === 'traveler' ? 'Traveler' : senderRole === 'transporter' ? 'Transporter' : 'User';
      const senderName = notification.message?.sender?.name || 'Someone';
      const targetPath = senderRole === 'traveler' ? '/dashboard/bookings' : '/dashboard/my-bookings';
      const targetUrl = notification.bookingId
        ? `${targetPath}?openChatBooking=${encodeURIComponent(notification.bookingId)}`
        : targetPath;

      if (!isDuplicate) {
        setNotifications(prev => [notification, ...prev]);
        if (Notification.permission === 'granted' && !isGlobalDuplicate) {
          const browserNotification = new Notification(`Message from ${senderName} (${senderRoleLabel})`, {
            body: notification.message?.content
              ? notification.message.content
              : `New notification from ${senderName} (${senderRoleLabel})`,
            icon: '/smatway-favicon.svg',
          });

          browserNotification.onclick = () => {
            window.focus();
            window.location.href = targetUrl;
            browserNotification.close();
          };

          lastBrowserNotificationRef = { key: notificationKey, time: now };
        }
        lastNotificationRef.current = { id: messageId || '', time: now };
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const joinChat = (chatId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-chat', { chatId });
    }
  };

  const leaveChat = (chatId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-chat', { chatId });
    }
  };

  const sendMessage = (chatId: string, content: string) => {
    if (socketRef.current?.connected && userId) {
      socketRef.current.emit('message', { chatId, content, userId });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return {
    connected,
    messages,
    notifications,
    joinChat,
    leaveChat,
    sendMessage,
    requestNotificationPermission,
  };
}
