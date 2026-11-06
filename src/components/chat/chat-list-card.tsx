import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedButton } from '@/components/animated-button';
import { ChatAvatar } from '@/components/chat/chat-avatar';
import { ChatContacts, type ChatId } from '@/constants/sample-chats';
import { BrandColor } from '@/constants/theme';
import { useChatMessages, useChats } from '@/hooks/use-chats';

// White card for one conversation: avatar, name, last message and an unread dot.
export function ChatListCard({ chatId }: { chatId: ChatId }) {
  const contact = ChatContacts[chatId];
  const { typing, unread } = useChats();
  const messages = useChatMessages(chatId);
  const last = messages.at(-1);
  const isUnread = !!unread[chatId];

  const preview = typing[chatId]
    ? 'Typing…'
    : last
      ? `${last.from === 'me' ? 'You: ' : ''}${last.text ? last.text.replace(/\s+/g, ' ') : 'Photo'}`
      : null;

  return (
    <AnimatedButton
      navigates
      scaleTo={0.98}
      onPress={() => router.push({ pathname: '/chat/[id]', params: { id: chatId } })}
      style={styles.card}>
      <ChatAvatar source={contact.avatar} size={56} />
      <View style={styles.text}>
        {contact.role ? <Text style={styles.role}>{contact.role}</Text> : null}
        <Text style={styles.name} numberOfLines={1}>
          {contact.name}
        </Text>
        {preview ? (
          <Text style={styles.preview} numberOfLines={1}>
            {preview}
          </Text>
        ) : null}
      </View>
      {isUnread ? <View style={styles.unreadDot} /> : null}
    </AnimatedButton>
  );
}

const SUPPORT_URL = 'https://help.getwellis.com/en/';

// Same card for customer support, but it opens the Wellis help center in the browser.
export function SupportLinkCard() {
  return (
    <AnimatedButton scaleTo={0.98} onPress={() => Linking.openURL(SUPPORT_URL)} style={styles.card}>
      <ChatAvatar source={require('@/assets/images/wellis-icon.png')} size={56} />
      <View style={styles.text}>
        <Text style={styles.name}>Customer support</Text>
        <Text style={styles.preview} numberOfLines={1}>
          Get help with your account
        </Text>
      </View>
    </AnimatedButton>
  );
}

const styles = StyleSheet.create({
  // Same corners as the Home cards.
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    borderCurve: 'continuous',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  text: {
    flex: 1,
    gap: 3,
  },
  role: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: BrandColor,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#262626',
  },
  preview: {
    fontSize: 15,
    fontWeight: '500',
    color: '#a3a3a3',
  },
  // Pinned to the card's top-right corner, level with the role label.
  unreadDot: {
    position: 'absolute',
    top: 22,
    right: 22,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BrandColor,
  },
});
