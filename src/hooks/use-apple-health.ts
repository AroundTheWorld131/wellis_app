import {
  AuthorizationRequestStatus,
  getRequestStatusForAuthorization,
  isHealthDataAvailable,
  requestAuthorization,
} from '@kingstinct/react-native-healthkit';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';

// Everything the app reads from Apple Health: steps (Home, steps chart) and exercise minutes.
const READ_TYPES = ['HKQuantityTypeIdentifierStepCount', 'HKQuantityTypeIdentifierAppleExerciseTime'] as const;

/**
 * - `unavailable`: no Apple Health here (Android, web, iPad without Health).
 * - `checking`: still asking iOS.
 * - `notConnected`: the Health permission sheet hasn't been shown yet.
 * - `connected`: the sheet has been answered. iOS never says whether reading was allowed,
 *   so this can't tell an allow from a deny.
 */
export type AppleHealthStatus = 'unavailable' | 'checking' | 'notConnected' | 'connected';

function healthAvailable() {
  return Platform.OS === 'ios' && isHealthDataAvailable();
}

async function readStatus(): Promise<AppleHealthStatus> {
  if (!healthAvailable()) return 'unavailable';
  const status = await getRequestStatusForAuthorization({ toRead: READ_TYPES });
  return status === AuthorizationRequestStatus.unnecessary ? 'connected' : 'notConnected';
}

/**
 * Whether the app is connected to Apple Health, plus `connect`: it shows the Health permission
 * sheet the first time, and after that opens the Health app, where access is managed
 * (Sharing › Apps). Checks again whenever the app comes back to the foreground.
 */
export function useAppleHealth() {
  const [status, setStatus] = useState<AppleHealthStatus>(() => (healthAvailable() ? 'checking' : 'unavailable'));

  const refresh = useCallback(() => {
    readStatus()
      .then(setStatus)
      .catch((error) => console.warn('Could not check Apple Health access', error));
  }, []);

  useEffect(() => {
    refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  const connect = useCallback(async () => {
    if (!healthAvailable()) return;
    try {
      if ((await readStatus()) === 'notConnected') {
        await requestAuthorization({ toRead: READ_TYPES });
        refresh();
        return;
      }
      await Linking.openURL('x-apple-health://');
    } catch (error) {
      console.warn('Could not connect to Apple Health', error);
    }
  }, [refresh]);

  return { status, connect };
}
