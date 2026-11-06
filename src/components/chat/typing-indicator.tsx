import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ChatAvatar } from '@/components/chat/chat-avatar';
import { AVATAR_SIZE } from '@/components/chat/message-bubble';
import type { ChatContact } from '@/constants/sample-chats';

const DOT_STAGGER_MS = 160;

function Dot({ index }: { index: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(
      withDelay(
        index * DOT_STAGGER_MS,
        withRepeat(withSequence(withTiming(1, { duration: 320 }), withTiming(0, { duration: 320 })), -1),
      ),
    );
  }, [index, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + progress.get() * 0.65,
    transform: [{ translateY: progress.get() * -3 }],
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

// Three bouncing dots in a white bubble while the contact is "typing".
export function TypingIndicator({ contact }: { contact: ChatContact }) {
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.row}>
      <ChatAvatar source={contact.avatar} size={AVATAR_SIZE} />
      <View style={styles.bubble}>
        {[0, 1, 2].map((index) => (
          <Dot key={index} index={index} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  bubble: {
    flexDirection: 'row',
    gap: 5,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderBottomLeftRadius: 6,
    borderCurve: 'continuous',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#a3a3a3',
  },
});
