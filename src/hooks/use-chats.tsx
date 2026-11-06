import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import {
  SampleReplies,
  sampleChatMessages,
  type ChatId,
  type ChatImage,
  type ChatMessage,
} from '@/constants/sample-chats';

// Chat history shared by the Chat tab and the conversation screen, so a sent message
// shows up in the list preview too. Kept in memory only, so it resets on restart.
// TODO: back this with a messaging backend and push notifications.

// How long the other side "types" before a canned reply arrives.
const REPLY_DELAY_MS = 2200;

type Chats = {
  messages: ChatMessage[];
  /** Chats with a reply on the way, for the typing indicator. */
  typing: Partial<Record<ChatId, boolean>>;
  /** Chats with messages the user hasn't opened yet. */
  unread: Partial<Record<ChatId, boolean>>;
  send: (chatId: ChatId, content: { text?: string; image?: ChatImage }) => void;
  markRead: (chatId: ChatId) => void;
};

const ChatsContext = createContext<Chats | null>(null);

export function ChatsProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState(() => sampleChatMessages());
  const [typing, setTyping] = useState<Chats['typing']>({});
  const [unread, setUnread] = useState<Chats['unread']>({ care: true });
  const replyCount = useRef<Partial<Record<ChatId, number>>>({});
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const send: Chats['send'] = (chatId, content) => {
    const now = Date.now();
    setMessages((current) => [...current, { id: `me-${now}`, chatId, from: 'me', ...content, sentAt: now }]);

    // Fake the other side answering, cycling through the canned replies.
    setTyping((current) => ({ ...current, [chatId]: true }));
    timers.current.push(
      setTimeout(() => {
        const replies = SampleReplies[chatId];
        const index = replyCount.current[chatId] ?? 0;
        replyCount.current[chatId] = index + 1;
        const sentAt = Date.now();
        setMessages((current) => [
          ...current,
          { id: `them-${sentAt}`, chatId, from: 'them', text: replies[index % replies.length], sentAt },
        ]);
        setTyping((current) => ({ ...current, [chatId]: false }));
        // The open conversation marks it read again straight away.
        setUnread((current) => ({ ...current, [chatId]: true }));
      }, REPLY_DELAY_MS),
    );
  };

  // Stable, since the conversation screen calls it from an effect.
  const markRead = useCallback((chatId: ChatId) => {
    setUnread((current) => (current[chatId] ? { ...current, [chatId]: false } : current));
  }, []);

  return (
    <ChatsContext.Provider value={{ messages, typing, unread, send, markRead }}>
      {children}
    </ChatsContext.Provider>
  );
}

export function useChats() {
  const chats = useContext(ChatsContext);
  if (!chats) {
    throw new Error('useChats must be used inside ChatsProvider');
  }
  return chats;
}

// One conversation's messages, oldest first.
export function useChatMessages(chatId: ChatId) {
  const { messages } = useChats();
  return messages.filter((message) => message.chatId === chatId);
}
