import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedButton } from '@/components/animated-button';
import { SettingsCard, SettingsRow } from '@/components/profile/settings-card';
import { LANGUAGES, useLanguage } from '@/hooks/use-language';

// Pushed from the Language row on Profile, in the same grey page and white card style.
// Picking a language saves it and slides back.
export default function LanguageScreen() {
  const insets = useSafeAreaInsets();
  const { language, setLanguage } = useLanguage();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <AnimatedButton onPress={() => router.back()} scaleTo={0.95} style={styles.backButton}>
        <SymbolView
          name="arrow.left"
          size={20}
          weight="medium"
          tintColor="#000"
          fallback={<Text style={styles.backFallback}>←</Text>}
        />
      </AnimatedButton>

      <SettingsCard title="Language">
        {LANGUAGES.map((option) => (
          <SettingsRow
            key={option.value}
            label={option.label}
            emoji={option.flag}
            checked={option.value === language}
            onPress={() => {
              setLanguage(option.value);
              router.back();
            }}
          />
        ))}
      </SettingsCard>
    </View>
  );
}

const styles = StyleSheet.create({
  // Same light grey page as Profile.
  screen: {
    flex: 1,
    backgroundColor: '#f6f6f9',
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 24,
  },
  // White round button so it stands out on the grey page.
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  backFallback: {
    fontSize: 22,
    lineHeight: 24,
    color: '#000',
  },
});
