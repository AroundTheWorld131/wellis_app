/// <reference types="vite/client" />
import pushNotificationsTest from '@convex-dev/expo-push-notifications/test';
import rateLimiterTest from '@convex-dev/rate-limiter/test';
import { convexTest } from 'convex-test';
import { describe, expect, test } from 'vitest';

import { api, internal } from './_generated/api';
import schema from './schema';

const modules = import.meta.glob('./**/*.ts');

function setup() {
  const t = convexTest(schema, modules);
  pushNotificationsTest.register(t);
  rateLimiterTest.register(t);
  return t;
}

// A signed-in patient. Convex Auth reads the user id from the first part of the subject.
async function signedInPatient(t: ReturnType<typeof setup>, email: string) {
  const userId = await t.run((ctx) => ctx.db.insert('users', { email }));
  return { userId, as: t.withIdentity({ subject: `${userId}|session` }) };
}

const page = { paginationOpts: { numItems: 50, cursor: null } };

describe('patient chat', () => {
  test('signed out, there is no conversation and nothing can be sent', async () => {
    const t = setup();
    expect(await t.query(api.chat.myConversation, {})).toBeNull();
    expect((await t.query(api.chat.listMessages, page)).page).toEqual([]);
    await expect(t.mutation(api.chat.send, { text: 'Hi' })).rejects.toThrow(/Sign in/);
    await expect(t.mutation(api.chat.generateUploadUrl, {})).rejects.toThrow(/Sign in/);
  });

  test('starting opens the conversation with the nurse, whose welcome arrives unread', async () => {
    const t = setup();
    await t.mutation(internal.chat.addStaff, { name: 'Daan de Vries', role: 'Nurse' });
    const patient = await signedInPatient(t, 'lissa@example.com');

    await patient.as.mutation(api.chat.start, {});
    await patient.as.mutation(api.chat.start, {}); // Idempotent: still one conversation.

    const conversation = await patient.as.query(api.chat.myConversation, {});
    expect(conversation?.staff).toMatchObject({ name: 'Daan de Vries', role: 'Nurse' });
    expect(conversation?.unread).toBe(true);

    const messages = (await patient.as.query(api.chat.listMessages, page)).page;
    expect(messages).toHaveLength(2);
    expect(messages.every((message) => message.sender === 'staff')).toBe(true);
    expect(messages.at(-1)?.text).toContain("I'm Daan, the nurse");

    await patient.as.mutation(api.chat.markRead, {});
    expect((await patient.as.query(api.chat.myConversation, {}))?.unread).toBe(false);
  });

  test('sending adds the message, updates the preview and checks the text', async () => {
    const t = setup();
    const patient = await signedInPatient(t, 'lissa@example.com');

    await patient.as.mutation(api.chat.send, { text: '  Is mild nausea normal?  ' });
    const conversation = await patient.as.query(api.chat.myConversation, {});
    expect(conversation).toMatchObject({ lastMessageText: 'Is mild nausea normal?', lastMessageSender: 'patient' });
    expect((await patient.as.query(api.chat.listMessages, page)).page[0]).toMatchObject({
      sender: 'patient',
      text: 'Is mild nausea normal?',
    });

    await expect(patient.as.mutation(api.chat.send, { text: '   ' })).rejects.toThrow(/Write a message/);
    await expect(patient.as.mutation(api.chat.send, { text: 'x'.repeat(2001) })).rejects.toThrow(/2000/);
  });

  test("a patient never sees another patient's messages", async () => {
    const t = setup();
    const lissa = await signedInPatient(t, 'lissa@example.com');
    const mark = await signedInPatient(t, 'mark@example.com');

    await lissa.as.mutation(api.chat.send, { text: 'Private question from Lissa' });
    await mark.as.mutation(api.chat.start, {});

    const marksMessages = (await mark.as.query(api.chat.listMessages, page)).page;
    expect(marksMessages.some((message) => message.text?.includes('Lissa'))).toBe(false);
  });

  test('sending too fast is rate limited', async () => {
    const t = setup();
    const patient = await signedInPatient(t, 'lissa@example.com');
    for (let index = 0; index < 5; index++) {
      await patient.as.mutation(api.chat.send, { text: `Message ${index}` });
    }
    await expect(patient.as.mutation(api.chat.send, { text: 'One too many' })).rejects.toThrow();
  });

  test('only Expo push tokens are saved', async () => {
    const t = setup();
    const patient = await signedInPatient(t, 'lissa@example.com');
    await expect(patient.as.mutation(api.chat.recordPushToken, { token: 'not-a-token' })).rejects.toThrow(
      /Expo push token/,
    );
    await patient.as.mutation(api.chat.recordPushToken, { token: 'ExponentPushToken[abc123]' });
  });
});

describe('care team replies', () => {
  test('a reply lands in the conversation as unread, with or without a push token', async () => {
    const t = setup();
    await t.mutation(internal.chat.addStaff, { name: 'Daan de Vries', role: 'Nurse' });
    const patient = await signedInPatient(t, 'lissa@example.com');
    await patient.as.mutation(api.chat.send, { text: 'Hello?' });

    const conversationId = await t.run(async (ctx) => (await ctx.db.query('conversations').first())!._id);
    await t.mutation(internal.chat.replyAsStaff, { conversationId, text: 'Hi Lissa, how can I help?' });

    const conversation = await patient.as.query(api.chat.myConversation, {});
    expect(conversation).toMatchObject({ lastMessageSender: 'staff', unread: true });
    expect((await patient.as.query(api.chat.listMessages, page)).page[0]).toMatchObject({
      sender: 'staff',
      text: 'Hi Lissa, how can I help?',
    });

    // With a saved token the reply also queues a push notification.
    await patient.as.mutation(api.chat.recordPushToken, { token: 'ExponentPushToken[abc123]' });
    await t.mutation(internal.chat.replyAsStaff, { conversationId, text: 'Still there?' });
  });
});
