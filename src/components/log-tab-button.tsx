import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedButton } from '@/components/animated-button';

// Size of the black circle in the middle of the tab bar.
const BUTTON_SIZE = 44;
// How far the circle sits below the middle of its tab slot.
const BUTTON_OFFSET_Y = 2;

// The black plus in the middle of the tab bar. It doesn't open a tab: it opens the log sheet
// (app/log-menu.tsx), which lists the logging sheets.
export function LogTabButton() {
  const router = useRouter();

  return (
    <View style={styles.slot}>
      <AnimatedButton
        onPress={() => router.push('/log-menu')}
        scaleTo={0.9}
        hapticStyle="medium"
        accessibilityRole="button"
        accessibilityLabel="Log"
        style={styles.button}>
        <SymbolView
          name="plus"
          size={21}
          weight="semibold"
          tintColor="#FFFFFF"
          fallback={<Text style={styles.plusFallback}>+</Text>}
        />
      </AnimatedButton>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    paddingTop: BUTTON_OFFSET_Y * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusFallback: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
  },
});
