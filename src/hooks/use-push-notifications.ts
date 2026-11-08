import { useMutation, useQuery } from 'convex/react';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { api } from '../../convex/_generated/api';

// Push notifications for care team replies, sent by Convex's Expo push component.

// Show notifications that arrive while the app is open too, like a reply while on Home.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const TOKEN_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

// Fetching the token calls Expo's servers, which can fail on a flaky connection, so try a
// few times before giving up until the chat is opened again.
async function fetchExpoPushToken(projectId: string | undefined) {
  for (let attempt = 1; ; attempt++) {
    try {
      return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    } catch (error) {
      if (attempt >= TOKEN_ATTEMPTS) throw error;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    }
  }
}

type PushSetup = { status: 'granted'; token: string } | { status: 'denied' | 'unavailable' };

async function registerForPushNotifications(): Promise<PushSetup> {
  // Only real phones get push tokens.
  if (!Device.isDevice) return { status: 'unavailable' };

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Messages',
      // The enum is re-exported in a way the import lint rule can't follow; TypeScript checks it.
      // eslint-disable-next-line import/namespace
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status === 'undetermined') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') return { status: 'denied' };

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  return { status: 'granted', token: await fetchExpoPushToken(projectId) };
}

/**
 * Asks for notification permission the first time, then saves this phone's push token in
 * Convex so care team replies arrive as notifications. Asking only once the patient opens
 * their chat keeps the prompt in context.
 */
export function useRegisterPushNotifications() {
  const recordPushToken = useMutation(api.chat.recordPushToken);
  // Skipped while loading, and when the patient turned notifications off in Profile.
  const enabled = useQuery(api.settings.get)?.notificationsEnabled;

  useEffect(() => {
    if (!enabled) return;
    registerForPushNotifications()
      .then((setup) => (setup.status === 'granted' ? recordPushToken({ token: setup.token }) : null))
      .catch((error) => console.warn('Could not set up push notifications', error));
  }, [enabled, recordPushToken]);
}

/**
 * Turns notifications on from Profile: asks for permission if needed and saves the token.
 * Resolves to 'denied' when the phone's settings block them, so the switch can stay off.
 */
export function useEnablePushNotifications() {
  const recordPushToken = useMutation(api.chat.recordPushToken);

  return async () => {
    const setup = await registerForPushNotifications();
    if (setup.status === 'granted') await recordPushToken({ token: setup.token });
    return setup.status;
  };
}

/** Tapping a reply notification opens the chat. */
export function useOpenChatFromNotification() {
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    const url = response?.notification.request.content.data?.url;
    if (typeof url === 'string' && url.startsWith('/chat/')) {
      router.push(url as Href);
    }
  }, [response]);
}
