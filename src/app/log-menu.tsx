import { useRouter, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { SettingsIconName } from '@/components/icons/settings-icons';
import { SettingsCard, SettingsRow } from '@/components/profile/settings-card';

// Options without an href are placeholders: they show in the sheet but don't open anything yet.
type LogOption = { label: string; icon: SettingsIconName; href?: Href };

const OPTIONS: LogOption[] = [
  { label: 'Log shot', icon: 'syringe', href: '/log-shot' },
  { label: 'Log weight', icon: 'weight', href: '/log-weight' },
  { label: 'Log water', icon: 'water', href: '/log-water' },
  { label: 'Log protein', icon: 'protein' },
  { label: 'Log exercise', icon: 'stopwatch' },
];

// The sheet the black plus in the tab bar opens: the logging sheets as Profile style rows
// (icon, label, chevron), each in its own white card. Picking a row closes this sheet and opens that one.
export default function LogMenuSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const choose = (href: Href) => {
    router.dismiss();
    router.push(href);
  };

  return (
    <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
      <Text style={styles.title}>What would you like to log?</Text>
      <View style={styles.cards}>
        {OPTIONS.map((option) => (
          <SettingsCard key={option.label}>
            <SettingsRow label={option.label} icon={option.icon} onPress={option.href ? () => choose(option.href!) : undefined} />
          </SettingsCard>
        ))}
      </View>
    </View>
  );
}

// The Profile page's light grey, so the white card stands out like it does there.
const LOG_MENU_BACKGROUND = '#f6f6f9';

const styles = StyleSheet.create({
  sheet: {
    paddingTop: 28,
    paddingHorizontal: 16,
    backgroundColor: LOG_MENU_BACKGROUND,
  },
  cards: {
    gap: 10,
  },
  title: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 26,
    color: '#000000',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
});
