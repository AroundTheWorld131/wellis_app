import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View, type ScrollViewProps } from 'react-native';
import { KeyboardChatScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedButton } from '@/components/animated-button';
import { ChatAvatar } from '@/components/chat/chat-avatar';
import { ChatComposer } from '@/components/chat/chat-composer';
import { formatDay, isSameDay } from '@/components/chat/chat-format';
import { MessageBubble } from '@/components/chat/message-bubble';
import {
  useCareContact,
  useCareConversation,
  useCareMessages,
  useMarkRead,
  useSendMessage,
  type ChatId,
  type ChatMessage,
} from '@/hooks/use-chat';
import { useRegisterPushNotifications } from '@/hooks/use-push-notifications';

// Messages further apart than this start a new run, with its own name and time.
const GROUP_GAP_MS = 5 * 60 * 1000;

type ListItem =
  | { kind: 'day'; key: string; label: string }
  | { kind: 'message'; key: string; message: ChatMessage; isLastInGroup: boolean };

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
      isLastInGroup: !next || startsNewGroup(message, next),
    });
  });
  return items.reverse();
}

function isChatId(id: string | undefined): id is ChatId {
  return id === 'care';
}

export default function ChatConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!isChatId(id)) {
    return <Redirect href="/chat" />;
  }
  return <Conversation />;
}

// The patient's chat with their care team, the only conversation for now.
function Conversation() {
  const insets = useSafeAreaInsets();
  const contact = useCareContact();
  const conversation = useCareConversation();
  const { messages, loadOlder } = useCareMessages();
  const { sendText, sendPhoto } = useSendMessage();
  const items = useMemo(() => buildListItems(messages), [messages]);

  // Being on screen means every message, including replies arriving now, has been seen.
  useMarkRead(conversation?.unread);
  // Ask for notifications here, where it's clear they're for care team replies.
  useRegisterPushNotifications();

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
            {contact.subtitle}
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
        // Inverted, so the end is the top: scrolling up loads older messages.
        onEndReached={loadOlder}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) =>
          item.kind === 'day' ? (
            <Text style={styles.day}>{item.label}</Text>
          ) : (
            <MessageBubble
              message={item.message}
              contact={contact}
              isLastInGroup={item.isLastInGroup}
            />
          )
        }
      />

      <KeyboardStickyView offset={{ opened: insets.bottom }}>
        <ChatComposer
          bottomInset={insets.bottom}
          onSend={sendText}
          onSendPhoto={(image) => void sendPhoto(image)}
        />
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  },
  backFallback: {
    fontSize: 22,
    color: '#262626',
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 22,
    // Tight line height so "Nurse" sits right under the name.
    lineHeight: 24,
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
