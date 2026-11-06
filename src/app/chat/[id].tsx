import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View, type ScrollViewProps } from 'react-native';
import { KeyboardChatScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedButton } from '@/components/animated-button';
import { ChatAvatar } from '@/components/chat/chat-avatar';
import { ChatComposer } from '@/components/chat/chat-composer';
import { formatDay, isSameDay } from '@/components/chat/chat-format';
import { MessageBubble } from '@/components/chat/message-bubble';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { ChatContacts, type ChatId, type ChatMessage } from '@/constants/sample-chats';
import { useChatMessages, useChats } from '@/hooks/use-chats';

// Messages further apart than this start a new run, with its own name and time.
const GROUP_GAP_MS = 5 * 60 * 1000;

type ListItem =
  | { kind: 'day'; key: string; label: string }
  | { kind: 'message'; key: string; message: ChatMessage; isFirstInGroup: boolean; isLastInGroup: boolean };

function startsNewGroup(previous: ChatMessage | undefined, message: ChatMessage) {
  return (
    !previous ||
    previous.from !== message.from ||
    !isSameDay(previous.sentAt, message.sentAt) ||
    message.sentAt - previous.sentAt > GROUP_GAP_MS
  );
}

// Day labels and grouped messages, newest first for the inverted list.
function buildListItems(messages: ChatMessage[]): ListItem[] {
  const items: ListItem[] = [];
  messages.forEach((message, index) => {
    const previous = messages[index - 1];
    const next = messages[index + 1];
    if (!previous || !isSameDay(previous.sentAt, message.sentAt)) {
      items.push({ kind: 'day', key: `day-${message.id}`, label: formatDay(message.sentAt) });
    }
    items.push({
      kind: 'message',
      key: message.id,
      message,
      isFirstInGroup: startsNewGroup(previous, message),
      isLastInGroup: !next || startsNewGroup(message, next),
    });
  });
  return items.reverse();
}

function isChatId(id: string | undefined): id is ChatId {
  return !!id && id in ChatContacts;
}

export default function ChatConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!isChatId(id)) {
    return <Redirect href="/chat" />;
  }
  return <Conversation chatId={id} />;
}

function Conversation({ chatId }: { chatId: ChatId }) {
  const insets = useSafeAreaInsets();
  const contact = ChatContacts[chatId];
  const { send, typing, markRead } = useChats();
  const messages = useChatMessages(chatId);
  const items = useMemo(() => buildListItems(messages), [messages]);
  // Only messages that arrive after opening slide in, not the history.
  const [initialIds] = useState(() => new Set(messages.map((message) => message.id)));

  // Being on screen means every message, including replies arriving now, has been seen.
  useEffect(() => {
    markRead(chatId);
  }, [chatId, messages.length, markRead]);

  // The list pads itself for the keyboard, less the safe area the composer already covers.
  const renderScrollComponent = useCallback(
    (props: ScrollViewProps) => <KeyboardChatScrollView {...props} inverted offset={insets.bottom} />,
    [insets.bottom],
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <AnimatedButton onPress={() => router.back()} scaleTo={0.9} style={styles.backButton}>
          <SymbolView
            name="arrow.left"
            size={20}
            weight="semibold"
            tintColor="#262626"
            fallback={<Text style={styles.backFallback}>←</Text>}
          />
        </AnimatedButton>
        <ChatAvatar source={contact.avatar} size={44} />
        <View style={styles.headerText}>
          <Text style={styles.headerName} numberOfLines={1}>
            {contact.name}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {typing[chatId] ? 'Typing…' : contact.subtitle}
          </Text>
        </View>
      </View>

      <FlatList
        inverted
        data={items}
        keyExtractor={(item) => item.key}
        renderScrollComponent={renderScrollComponent}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        // Inverted, so the header sits at the bottom, under the newest message.
        ListHeaderComponent={typing[chatId] ? <TypingIndicator contact={contact} /> : undefined}
        renderItem={({ item }) =>
          item.kind === 'day' ? (
            <Text style={styles.day}>{item.label}</Text>
          ) : (
            <MessageBubble
              message={item.message}
              contact={contact}
              isFirstInGroup={item.isFirstInGroup}
              isLastInGroup={item.isLastInGroup}
              animate={!initialIds.has(item.message.id)}
            />
          )
        }
      />

      <KeyboardStickyView offset={{ opened: insets.bottom }}>
        <ChatComposer
          bottomInset={insets.bottom}
          onSend={(text) => send(chatId, { text })}
          onSendPhoto={(image) => send(chatId, { image })}
        />
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    zIndex: 1,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f6',
  },
  backFallback: {
    fontSize: 22,
    color: '#262626',
  },
  headerText: {
    flex: 1,
    gap: 1,
  },
  headerName: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 22,
    color: '#262626',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#a3a3a3',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  day: {
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#a3a3a3',
  },
});
