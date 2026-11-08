import {
  insertAtTop,
  useConvexAuth,
  useMutation,
  usePaginatedQuery,
  useQuery,
} from 'convex/react';
import type { OptimisticLocalStore } from 'convex/browser';
import type { ImageSource } from 'expo-image';
import { useCallback, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';

import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

// The patient's chat with their care team, from Convex. There's one conversation per
// patient, opened at /chat/care.

/** The only conversation for now: the patient's care team. */
export type ChatId = 'care';

export type ChatContact = {
  name: string;
  /** Shown under the name in the conversation header, like "Nurse". */
  subtitle: string;
  avatar: ImageSource | number;
};

export type ChatImage = {
  uri: string;
  width: number;
  height: number;
};

export type ChatMessage = {
  id: string;
  /** 'me' for the signed-in patient, otherwise the care team. */
  from: 'me' | 'them';
  /** Every message has text, a photo, or both. */
  text?: string;
  image?: ChatImage;
  sentAt: number;
};

const PAGE_SIZE = 30;
const FALLBACK_AVATAR = require('@/assets/images/nurse-avatar.jpg');

/**
 * The patient's conversation for the Chat tab: undefined while loading, null before it
 * exists. Creates it, with the care team's welcome messages, the first time it's missing.
 */
export function useCareConversation() {
  const { isAuthenticated } = useConvexAuth();
  const conversation = useQuery(api.chat.myConversation);
  const start = useMutation(api.chat.start);

  useEffect(() => {
    if (isAuthenticated && conversation === null) {
      start().catch((error) => console.warn('Could not start the chat', error));
    }
  }, [isAuthenticated, conversation, start]);

  return conversation;
}

/** Who the patient is talking to, falling back to the bundled nurse photo. */
export function useCareContact(): ChatContact {
  const conversation = useQuery(api.chat.myConversation);
  const staff = conversation?.staff;
  return {
    name: staff?.name ?? 'Care team',
    subtitle: staff?.role ?? 'Wellis',
    avatar: staff?.avatarUrl ? { uri: staff.avatarUrl } : FALLBACK_AVATAR,
  };
}

/** The conversation's messages, oldest first, plus `loadMore` for older pages. */
export function useCareMessages() {
  const { results, status, loadMore } = usePaginatedQuery(api.chat.listMessages, {}, { initialNumItems: PAGE_SIZE });

  const messages = useMemo<ChatMessage[]>(
    () =>
      results
        .map((message) => ({
          id: message._id,
          from: message.sender === 'patient' ? ('me' as const) : ('them' as const),
          text: message.text ?? undefined,
          image: message.image
            ? { uri: message.image.url, width: message.image.width, height: message.image.height }
            : undefined,
          sentAt: message._creationTime,
        }))
        // The query returns newest first.
        .reverse(),
    [results],
  );

  const loadOlder = useCallback(() => {
    if (status === 'CanLoadMore') loadMore(PAGE_SIZE);
  }, [status, loadMore]);

  return { messages, loadOlder, isLoading: status === 'LoadingFirstPage' };
}

// Shows a sent text at the bottom of the chat right away, until the saved copy replaces it.
function showSentText(localStore: OptimisticLocalStore, args: { text?: string }) {
  if (!args.text) return;
  const now = Date.now();
  insertAtTop({
    paginatedQuery: api.chat.listMessages,
    localQueryStore: localStore,
    item: {
      _id: `optimistic-${now}` as Id<'messages'>,
      _creationTime: now,
      sender: 'patient',
      text: args.text,
      image: null,
    },
  });
}

/**
 * Sends text and photos. Text shows up straight away while it saves; photos appear once
 * they've uploaded.
 */
export function useSendMessage() {
  const send = useMutation(api.chat.send).withOptimisticUpdate(showSentText);
  const generateUploadUrl = useMutation(api.chat.generateUploadUrl);

  const sendText = useCallback(
    (text: string) => {
      send({ text }).catch(() => Alert.alert("Message not sent", 'Check your connection and try again.'));
    },
    [send],
  );

  const sendPhoto = useCallback(
    async (image: ChatImage) => {
      try {
        const photo = await (await fetch(image.uri)).blob();
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': photo.type || 'image/jpeg' },
          body: photo,
        });
        if (!response.ok) throw new Error(`Upload failed with ${response.status}`);
        const { storageId } = (await response.json()) as { storageId: Id<'_storage'> };
        await send({ image: { storageId, width: image.width, height: image.height } });
      } catch {
        Alert.alert("Photo not sent", 'Check your connection and try again.');
      }
    },
    [generateUploadUrl, send],
  );

  return { sendText, sendPhoto };
}

/** Clears the unread dot while the conversation is open. */
export function useMarkRead(unread: boolean | undefined) {
  const markRead = useMutation(api.chat.markRead);
  useEffect(() => {
    if (unread) markRead().catch(() => {});
  }, [unread, markRead]);
}
