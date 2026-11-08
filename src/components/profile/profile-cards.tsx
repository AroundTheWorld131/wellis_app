import { useAuthActions } from '@convex-dev/auth/react';
import { useMutation, useQuery } from 'convex/react';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { Alert } from 'react-native';

import { SettingsCard, SettingsRow } from '@/components/profile/settings-card';
import { useBody, useGoalWeightKg } from '@/hooks/use-body';
import { useAppleHealth, type AppleHealthStatus } from '@/hooks/use-apple-health';
import { useLanguage } from '@/hooks/use-language';
import { useEnablePushNotifications } from '@/hooks/use-push-notifications';
import { api } from '../../../convex/_generated/api';

// Goals come from Convex, and each row opens its goal sheet. Name and email are still placeholders.

const formatNumber = (value: number) => value.toLocaleString('en-US');

export function GoalsCard() {
  const goals = useQuery(api.goals.get);
  const goalWeightKg = useGoalWeightKg();
  // While loading, rows keep their labels and leave the value empty.
  const show = (value: number | undefined, unit?: string) =>
    value === undefined ? undefined : unit ? `${formatNumber(value)} ${unit}` : formatNumber(value);

  return (
    <SettingsCard title="Goals">
      <SettingsRow
        label="Weight"
        onPress={() => router.push('/goal-weight')}
        icon="weight"
        value={show(goalWeightKg, 'kg')}
      />
      <SettingsRow
        label="Water"
        onPress={() => router.push('/goal-water')}
        icon="water"
        value={show(goals?.waterMl, 'ml')}
      />
      <SettingsRow
        label="Steps"
        onPress={() => router.push('/goal-steps')}
        icon="steps"
        value={show(goals?.steps)}
      />
    </SettingsCard>
  );
}

// Starting weight and height, each opening its own sheet. Empty until the user enters them.
// While USE_MOCK_HISTORY is on, both are the demo values instead.
export function BodyCard() {
  const body = useBody();
  const show = (value: number | undefined, unit: string) =>
    value === undefined ? (body === undefined ? undefined : 'Add') : `${formatNumber(value)} ${unit}`;

  return (
    <SettingsCard title="Body">
      <SettingsRow
        label="Starting weight"
        icon="calendar"
        value={show(body?.startingWeightKg, 'kg')}
        onPress={() => router.push('/starting-weight')}
      />
      <SettingsRow
        label="Height"
        icon="ruler"
        value={show(body?.heightCm, 'cm')}
        onPress={() => router.push('/height')}
      />
    </SettingsCard>
  );
}

const HEALTH_STATUS_LABEL: Record<AppleHealthStatus, string | undefined> = {
  unavailable: 'Not available',
  checking: undefined,
  notConnected: 'Connect',
  connected: 'Connected',
};

// Apple Health, where steps and exercise minutes come from. Tapping it asks for access the
// first time, then opens the Health app to manage it.
export function ConnectionsCard() {
  const { status, connect } = useAppleHealth();

  return (
    <SettingsCard title="Connections">
      <SettingsRow
        label="Apple Health"
        icon="heart"
        value={HEALTH_STATUS_LABEL[status]}
        showChevron={status !== 'unavailable'}
        onPress={status === 'unavailable' ? undefined : () => void connect()}
      />
    </SettingsCard>
  );
}

export function AccountCard() {
  const { label: languageLabel } = useLanguage();

  return (
    <SettingsCard title="Account">
      <SettingsRow label="Name" icon="person" value="Lissa Delft" />
      <SettingsRow label="Email" icon="mail" value="mark@example.com" />
      <SettingsRow
        label="Language"
        icon="globe"
        value={languageLabel}
        onPress={() => router.push('/language')}
      />
      <NotificationsRow />
    </SettingsCard>
  );
}

// On by default. Off means Convex sends no push notifications at all; care team messages
// still show up in the chat.
function NotificationsRow() {
  const settings = useQuery(api.settings.get);
  const enablePush = useEnablePushNotifications();
  const setEnabled = useMutation(api.settings.setNotificationsEnabled).withOptimisticUpdate(
    (store, { enabled }) => store.setQuery(api.settings.get, {}, { notificationsEnabled: enabled }),
  );

  const onValueChange = async (enabled: boolean) => {
    if (!enabled) return void setEnabled({ enabled: false });

    try {
      if ((await enablePush()) === 'denied') {
        Alert.alert(
          'Notifications are turned off',
          'Allow notifications for Wellis in your phone settings to turn them on.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => void Linking.openSettings() },
          ],
        );
        return;
      }
    } catch (error) {
      // The token can fail on a bad connection; the chat screen tries again later.
      console.warn('Could not set up push notifications', error);
    }
    await setEnabled({ enabled: true });
  };

  return (
    <SettingsRow
      label="Notifications"
      icon="bell"
      toggle={{
        value: settings?.notificationsEnabled ?? true,
        onValueChange: (enabled) => void onValueChange(enabled),
        disabled: settings === undefined,
      }}
    />
  );
}

// Pages on the Wellis website, opened in the browser.
const LINKS = {
  contact: 'https://getwellis.com/nl-en/contact-us',
  faq: 'https://help.getwellis.com/en/',
  terms: 'https://getwellis.com/nl-en/terms-and-conditions',
  privacy: 'https://getwellis.com/nl-en/privacy-policy',
};

const open = (url: string) => () => void Linking.openURL(url);

// The user's Wellis plan. Not connected to billing yet, so it doesn't open anything.
export function SubscriptionCard() {
  return (
    <SettingsCard title="Subscription">
      <SettingsRow label="Manage subscription" icon="card" />
    </SettingsCard>
  );
}

export function SupportCard() {
  return (
    <SettingsCard title="Support">
      <SettingsRow label="Contact us" icon="chat" onPress={open(LINKS.contact)} />
      <SettingsRow label="FAQ" icon="help" onPress={open(LINKS.faq)} />
    </SettingsCard>
  );
}

export function LegalCard() {
  return (
    <SettingsCard title="Legal">
      <SettingsRow label="Terms of Use" icon="document" onPress={open(LINKS.terms)} />
      <SettingsRow label="Privacy Policy" icon="shield" onPress={open(LINKS.privacy)} />
    </SettingsCard>
  );
}

// Log out on its own card at the bottom, in red. Signing out flips the auth guards, which
// sends the user back to onboarding.
export function LogOutCard() {
  const { signOut } = useAuthActions();

  const confirmLogOut = () =>
    Alert.alert('Log out?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => void signOut() },
    ]);

  return (
    <SettingsCard>
      <SettingsRow label="Log out" icon="logout" destructive showChevron={false} onPress={confirmLogOut} />
    </SettingsCard>
  );
}
