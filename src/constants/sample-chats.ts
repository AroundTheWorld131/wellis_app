import type { ImageSource } from 'expo-image';

// Placeholder conversations for the Chat tab until there's a messaging backend.

// Customer support isn't a chat: the Chat tab links out to the Wellis help center instead.
export type ChatId = 'care';

export type ChatContact = {
  id: ChatId;
  name: string;
  /** Small caps label above the name, like "NURSE". */
  role: string;
  /** Shown under the name in the conversation header. */
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
  chatId: ChatId;
  /** 'me' for the signed-in user, otherwise the contact. */
  from: 'me' | 'them';
  /** Every message has text, a photo, or both. */
  text?: string;
  image?: ChatImage;
  sentAt: number;
};

export const ChatContacts: Record<ChatId, ChatContact> = {
  care: {
    id: 'care',
    name: 'Marianne de Vries',
    role: 'Nurse',
    subtitle: 'Nurse · Your care team',
    avatar: require('@/assets/images/nurse-avatar.jpg'),
  },
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Builds the starting history relative to now, so the day labels always read naturally.
export function sampleChatMessages(now = Date.now()): ChatMessage[] {
  return [
    {
      id: 'care-1',
      chatId: 'care',
      from: 'them',
      text: "Hi Mark, welcome to Wellis! I'm Marianne, the nurse on your care team. If you have any questions in the meantime, just ask them here – we're here for you!",
      sentAt: now - 2 * DAY - 3 * HOUR,
    },
    {
      id: 'care-2',
      chatId: 'care',
      from: 'them',
      text: 'Our opening hours ⏰\nWeekdays: 07:00 – 22:00\nWeekends: 09:00 – 21:00',
      sentAt: now - 2 * DAY - 3 * HOUR + 20 * 1000,
    },
    {
      id: 'care-3',
      chatId: 'care',
      from: 'me',
      text: 'Thanks! I filled in the intake questions. Is there anything else you need from me?',
      sentAt: now - DAY - 5 * HOUR,
    },
    {
      id: 'care-4',
      chatId: 'care',
      from: 'them',
      text: 'Hi Mark, thanks for your answers.\n\nOur care is meant for people with obesity (BMI ≥ 30) or overweight (BMI ≥ 27) combined with health problems or risk factors, like high blood pressure, high cholesterol or sleep apnea. Based on your answers you qualify for treatment. Your intake call is on Monday at 10:00.',
      sentAt: now - 2 * HOUR,
    },
  ];
}

// Canned answers while there's no backend, so a sent message gets a reply.
export const SampleReplies: Record<ChatId, string[]> = {
  care: [
    'Thanks for letting me know! I’ll look into it and get back to you shortly.',
    'Good question. Mild nausea in the first weeks is common – eat smaller meals and drink plenty of water. Let me know if it doesn’t get better.',
    'Noted! I’ve added this to your file so the doctor sees it before your call.',
  ],
};
