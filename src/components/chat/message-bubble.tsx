import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { ChatAvatar } from '@/components/chat/chat-avatar';
import { formatTime } from '@/components/chat/chat-format';
import type { ChatContact, ChatMessage } from '@/hooks/use-chat';
import { BrandColor } from '@/constants/theme';

export const AVATAR_SIZE = 32;
const BUBBLE_RADIUS = 22;
// The corner nearest the avatar, squared off on the last bubble of a group.
const TAIL_RADIUS = 6;
// Photos keep their shape inside this box.
const PHOTO_MAX_WIDTH = 240;
const PHOTO_MAX_HEIGHT = 320;

// Fits the photo's own aspect ratio inside the max box.
function photoSize(width: number, height: number) {
  const scale = Math.min(PHOTO_MAX_WIDTH / width, PHOTO_MAX_HEIGHT / height);
  return { width: width * scale, height: height * scale };
}

type MessageBubbleProps = {
  message: ChatMessage;
  contact: ChatContact;
  /** Last of a run: shows the avatar, time and the squared corner. */
  isLastInGroup: boolean;
};

// Brand-colored bubbles on the right for the user, light gray ones with an avatar on the left for the contact.
export function MessageBubble({ message, contact, isLastInGroup }: MessageBubbleProps) {
  const isMine = message.from === 'me';
  const { image, text } = message;

  return (
    <View
      style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs, isLastInGroup && styles.rowLast]}>
      {!isMine ? (
        <View style={styles.avatarSlot}>
          {isLastInGroup ? <ChatAvatar source={contact.avatar} size={AVATAR_SIZE} /> : null}
        </View>
      ) : null}

      <View style={[styles.column, isMine ? styles.columnMine : styles.columnTheirs]}>
        <View
          style={[
            styles.bubble,
            isMine ? styles.bubbleMine : styles.bubbleTheirs,
            image && styles.bubblePhoto,
            isLastInGroup && (isMine ? styles.tailMine : styles.tailTheirs),
          ]}>
          {image ? (
            <Image source={{ uri: image.uri }} style={photoSize(image.width, image.height)} contentFit="cover" />
          ) : null}
          {text ? <Text style={[styles.text, isMine && styles.textMine, image && styles.photoCaption]}>{text}</Text> : null}
        </View>
        {isLastInGroup ? <Text style={styles.time}>{formatTime(message.sentAt)}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  // More room between runs than between bubbles in a run.
  rowLast: {
    marginBottom: 12,
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowTheirs: {
    justifyContent: 'flex-start',
  },
  // Keeps every bubble in a run lined up, with or without the avatar. Lifted to sit beside the bubble, not the time.
  avatarSlot: {
    width: AVATAR_SIZE,
    marginBottom: 20,
  },
  column: {
    maxWidth: '78%',
    gap: 4,
  },
  columnMine: {
    alignItems: 'flex-end',
  },
  columnTheirs: {
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: BUBBLE_RADIUS,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  bubbleMine: {
    backgroundColor: BrandColor,
  },
  bubbleTheirs: {
    backgroundColor: '#f6f6f9',
  },
  // The photo runs to the bubble's edges, clipped by its corners.
  bubblePhoto: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  photoCaption: {
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  tailMine: {
    borderBottomRightRadius: TAIL_RADIUS,
  },
  tailTheirs: {
    borderBottomLeftRadius: TAIL_RADIUS,
  },
  text: {
    fontSize: 17,
    lineHeight: 23,
    color: '#262626',
  },
  textMine: {
    color: '#ffffff',
  },
  time: {
    marginHorizontal: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#a3a3a3',
  },
});
