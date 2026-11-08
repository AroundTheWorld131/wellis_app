import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedButton } from '@/components/animated-button';
import { ChatAvatar } from '@/components/chat/chat-avatar';
import { useCareContact, useCareConversation, type ChatId } from '@/hooks/use-chat';

// Row for one conversation: avatar, name, last message and an unread dot.
export function ChatListCard({ chatId }: { chatId: ChatId }) {
  const contact = useCareContact();
  const conversation = useCareConversation();
  const isUnread = !!conversation?.unread;

  const preview = conversation
    ? `${conversation.lastMessageSender === 'patient' ? 'You: ' : ''}${conversation.lastMessageText}`
    : null;

  return (
    <AnimatedButton
      navigates
      scaleTo={0.98}
      onPress={() => router.push({ pathname: '/chat/[id]', params: { id: chatId } })}
      style={styles.card}>
      <ChatAvatar source={contact.avatar} size={44} />
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {contact.name}
        </Text>
        {preview ? (
          <Text style={styles.preview} numberOfLines={1}>
            {preview}
          </Text>
        ) : null}
      </View>
      {isUnread ? (
        <View style={styles.unreadDot} />
      ) : null}
    </AnimatedButton>
  );
}

const HELP_CENTER_URL = 'https://help.getwellis.com/en/';

// Same row as a chat, but it opens a page in the browser instead of a conversation.
function LinkCard({ title, subtitle, url }: { title: string; subtitle: string; url: string }) {
  return (
    <AnimatedButton scaleTo={0.98} onPress={() => Linking.openURL(url)} style={styles.card}>
      <ChatAvatar
        source={require('@/assets/images/wellis-icon.png')}
        size={44}
        inset={6}
        background="#004851"
      />
      <View style={styles.text}>
        <Text style={styles.name}>{title}</Text>
        <Text style={styles.preview} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </AnimatedButton>
  );
}

// Customer support: opens the Wellis help center.
export function SupportLinkCard() {
  return (
    <LinkCard
      title="Customer support"
      subtitle="Get help with your account"
      url={HELP_CENTER_URL}
    />
  );
}

// FAQ: the help center doubles as the FAQ for now.
export function FaqLinkCard() {
  return (
    <LinkCard
      title="FAQ"
      subtitle="Quick answers to common questions"
      url={HELP_CENTER_URL}
    />
  );
}

const styles = StyleSheet.create({
  // Plain row on the screen background, inset to line up with the section title.
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  text: {
    flex: 1,
  },
  name: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#262626',
  },
  preview: {
    fontSize: 14,
    fontWeight: '500',
    color: '#a3a3a3',
  },
  // Last item in the row, so the row's alignItems centers it vertically.
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b30',
  },
});
