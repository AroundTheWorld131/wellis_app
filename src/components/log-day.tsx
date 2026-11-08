import { DatePicker, Host } from '@expo/ui/swift-ui';
import { datePickerStyle, tint } from '@expo/ui/swift-ui/modifiers';
import { router, Stack } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { createContext, use, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedButton } from '@/components/animated-button';
import { PillButton } from '@/components/pill-button';
import { BrandColor } from '@/constants/theme';
import { dayKey, daysAgo, HISTORY_DAYS } from '@/lib/days';

// The day a log sheet saves to. The sheet and its date screen are separate routes in the
// same modal stack, so they share the pick through this context instead of route params.
type LogDay = { day: string; setDay: (day: string) => void };

const LogDayContext = createContext<LogDay | null>(null);

/** The day picked for the open log sheet, today until the date screen changes it. */
export function useLogDay() {
  const value = use(LogDayContext);
  if (value === null) throw new Error('useLogDay must be used inside a LogStack.');
  return value;
}

/**
 * Layout for a log sheet's folder (log-weight/, log-water/): a stack inside the modal, so
 * the date pill pushes the date screen with the native slide from the right.
 */
export function LogStack({ children }: { children?: ReactNode }) {
  const [day, setDay] = useState(() => dayKey());

  return (
    <LogDayContext value={{ day, setDay }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#ffffff' },
        }}>
        {children}
      </Stack>
    </LogDayContext>
  );
}

/** "2026-11-05" → a local Date at midnight. */
export function dayToDate(day: string) {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date);
}

/** What the date pill says: "Today, Nov 7", "Yesterday, Nov 6" or "Wed, Nov 4". */
export function formatLogDay(day: string) {
  const date = dayToDate(day);
  const short = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  if (day === dayKey()) return `Today, ${short}`;
  if (day === dayKey(daysAgo(1))) return `Yesterday, ${short}`;
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  return `${weekday}, ${short}`;
}

/**
 * Top of a screen pushed inside a log sheet's stack: a round back button with the title
 * centered beside it, like the log sheets' own header. Shared by the date, dose, site and
 * notes screens.
 */
export function PushedScreenHeader({ title }: { title: string }) {
  return (
    <>
      <View style={styles.header}>
        <AnimatedButton onPress={() => router.back()} scaleTo={0.95} style={styles.backButton}>
          <SymbolView
            name="arrow.left"
            size={20}
            weight="medium"
            tintColor="#000"
            fallback={<Text style={styles.backFallback}>←</Text>}
          />
        </AnimatedButton>
        {/* Absolutely centered so the back button doesn't push it off center. */}
        <Text style={styles.headerTitle} numberOfLines={1} pointerEvents="none">
          {title}
        </Text>
      </View>
    </>
  );
}

/**
 * The date screen pushed from a log sheet's date pill: a calendar from a year ago up to
 * today. Tapping a day only highlights it; Done saves the pick and slides back to the sheet,
 * and the back button leaves the day as it was.
 */
export function LogDateScreen() {
  const { day, setDay } = useLogDay();
  const [picked, setPicked] = useState(day);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <PushedScreenHeader title="Date" />

      {/* Fills the space between the header and Done, with the calendar centered in it. */}
      <View style={styles.pickerArea}>
        <Host matchContents={{ vertical: true }} style={styles.picker}>
          <DatePicker
            selection={dayToDate(picked)}
            // Back as far as the charts go, and nothing in the future.
            range={{ start: daysAgo(HISTORY_DAYS - 1), end: new Date() }}
            displayedComponents={['date']}
            onDateChange={(date) => setPicked(dayKey(date))}
            modifiers={[datePickerStyle('graphical'), tint(BrandColor)]}
          />
        </Host>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <PillButton
          label="Done"
          onPress={() => {
            setDay(picked);
            router.back();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  // Same round button and spacing as the sheet's close button, pointing back instead.
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f6f9',
  },
  backFallback: {
    fontSize: 22,
    lineHeight: 24,
    color: '#000',
  },
  // Matches the log sheets' header title.
  headerTitle: {
    position: 'absolute',
    left: 80,
    right: 80,
    bottom: 11,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#262626',
  },
  pickerArea: {
    flex: 1,
    justifyContent: 'center',
  },
  picker: {
    marginHorizontal: 12,
  },
  // Pinned to the bottom, same pill and spacing as the log sheets' Save button.
  footer: {
    paddingHorizontal: 22,
    paddingTop: 10,
  },
});
