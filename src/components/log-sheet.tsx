import { Host, Text as SwiftText, TextField, useNativeState } from '@expo/ui/swift-ui';
import {
  font,
  foregroundStyle,
  keyboardType,
  multilineTextAlignment,
  textFieldStyle,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { AnimatedButton } from '@/components/animated-button';
import { formatLogDay } from '@/components/log-day';
import { PillButton } from '@/components/pill-button';
import { dayKey } from '@/lib/days';
import { BrandColor } from '@/constants/theme';

// React Native finds the font by the alias it was loaded under in _layout.tsx.
const NUMBER_FONT = 'BricolageGrotesque_Condensed800ExtraBold';
// SwiftUI doesn't know that alias and needs the font's PostScript name instead.
const SWIFTUI_NUMBER_FONT = 'BricolageGrotesqueCondensed-ExtraBold';

// Accepts a keystroke only if the result is still a valid entry: no leading zero, at most
// one decimal when decimals are allowed, and not above `max`. Values under the minimum
// can't be blocked while typing ("8" may become "80"), so Save checks that instead.
// Runs on the UI thread, so a rejected digit is never drawn.
function nextText(current: string, typed: string, max: number, allowDecimal: boolean) {
  'worklet';
  // Some keyboards type a comma for the decimal.
  const text = typed.replace(',', '.');
  const pattern = allowDecimal ? /^([1-9]\d*)?(\.\d?)?$/ : /^([1-9]\d*)?$/;
  if (!pattern.test(text)) return current;
  if (text.startsWith('.')) return current;
  if (Number(text) > max) return current;
  return text;
}

type LogSheetProps = {
  /** Shown under the number, like "kg". */
  unit: string;
  /** Save stays off below this. */
  min: number;
  /** Keystrokes that would go above this are ignored. */
  max: number;
  /** One decimal place, like 72.5 kg. Whole numbers only when false. */
  allowDecimal: boolean;
  /** Centered in the header, like "Goal weight". */
  title: string;
  /** Shows the date pill under the unit. Off for values not tied to a day, like goals. */
  showDate?: boolean;
  /** The day the entry saves to, "YYYY-MM-DD", shown on the date pill. Defaults to today. */
  day?: string;
  /** Opens the date screen from the date pill. The pill does nothing without it. */
  onDatePress?: () => void;
  /**
   * Called with the entered number when Save is tapped. Defaults to closing the sheet.
   * While a returned promise is pending Save stays off; if it rejects, the error is shown
   * and the sheet stays open so nothing typed is lost.
   */
  onSave?: (value: number) => void | Promise<void>;
};

// Sheet for logging one number: an X in the header, a big field with the unit under it,
// the day it's logged for, and a Save button riding on top of the keyboard. Shared by the
// log and goal sheets.
export function LogSheet({
  unit,
  min,
  max,
  allowDecimal,
  title,
  showDate = false,
  day,
  onDatePress,
  onSave,
}: LogSheetProps) {
  const insets = useSafeAreaInsets();
  const text = useNativeState('');
  // The last value that passed validation. The field's own state already holds the
  // new keystroke when onTextChange runs, so it can't be used to roll back.
  const lastAccepted = useSharedValue('');
  // A JS copy of the accepted text, for enabling Save.
  const [entry, setEntry] = useState('');
  const [saving, setSaving] = useState(false);
  const canSave = Number(entry) >= min && !saving;

  const handleSave = async () => {
    if (!onSave) {
      router.back();
      return;
    }
    setSaving(true);
    try {
      await onSave(Number(entry));
    } catch (error) {
      setSaving(false);
      Alert.alert("Couldn't save", error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AnimatedButton onPress={() => router.back()} scaleTo={0.95} style={styles.closeButton}>
          <SymbolView
            name="xmark"
            size={18}
            weight="medium"
            tintColor="#000"
            fallback={<Text style={styles.closeFallback}>×</Text>}
          />
        </AnimatedButton>
        {/* Absolutely centered so the X on the left doesn't push it off center. */}
        <Text style={styles.headerTitle} numberOfLines={1} pointerEvents="none">
          {title}
        </Text>
      </View>

      <View style={styles.body}>
        <Host style={styles.fieldHost}>
          <TextField
            autoFocus
            text={text}
            onTextChange={(typed) => {
              'worklet';
              // Writing back from the UI thread replaces the keystroke before it renders.
              const accepted = nextText(lastAccepted.get(), typed, max, allowDecimal);
              lastAccepted.set(accepted);
              if (accepted !== typed) {
                text.set(accepted);
              }
              scheduleOnRN(setEntry, accepted);
            }}
            modifiers={[
              textFieldStyle('plain'),
              keyboardType(allowDecimal ? 'decimal-pad' : 'numeric'),
              multilineTextAlignment('center'),
              font({ family: SWIFTUI_NUMBER_FONT, size: 104 }),
              foregroundStyle('#262626'),
              tint(BrandColor),
            ]}>
            <TextField.Placeholder>
              <SwiftText
                modifiers={[
                  font({ family: SWIFTUI_NUMBER_FONT, size: 104 }),
                  foregroundStyle('#d4d4d4'),
                ]}>
                0
              </SwiftText>
            </TextField.Placeholder>
          </TextField>
        </Host>
        <Text style={styles.unit}>{unit}</Text>

        {showDate && (
          <AnimatedButton onPress={onDatePress} scaleTo={0.95} style={styles.dateButton}>
            <Text style={styles.dateText}>{formatLogDay(day ?? dayKey())}</Text>
          </AnimatedButton>
        )}
      </View>

      {/* Follows the keyboard frame by frame. With the field autofocused it sits 15pt
          above the keyboard; if the keyboard closes it drops to the home indicator. */}
      <KeyboardStickyView
        offset={{ closed: 0, opened: Math.max(insets.bottom, 20) - 15 }}
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <PillButton label="Save" onPress={handleSave} disabled={!canSave} />
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Same size as the Add shot sheet's title, one step lighter.
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
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f6f9',
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  closeFallback: {
    fontSize: 26,
    lineHeight: 28,
    color: '#000',
  },
  // Number on top, unit centered underneath, in the space above the keyboard.
  body: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  // A SwiftUI field fills the width it's given, so the host needs a size.
  fieldHost: {
    width: 280,
    height: 130,
  },
  unit: {
    fontFamily: NUMBER_FONT,
    fontSize: 36,
    color: '#d4d4d4',
  },
  // Outlined pill under the unit: no fill, just a soft border.
  dateButton: {
    marginTop: 24,
    height: 48,
    paddingHorizontal: 22,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#ececf0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#262626',
  },
});
