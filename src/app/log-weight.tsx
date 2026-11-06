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
import { StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { AnimatedButton } from '@/components/animated-button';
import { BrandColor } from '@/constants/theme';

// Save stays off below this, since it can't be enforced while typing.
const MIN_WEIGHT_KG = 30;
const MAX_WEIGHT_KG = 300;

// React Native finds the font by the alias it was loaded under in _layout.tsx.
const NUMBER_FONT = 'BricolageGrotesque_Condensed800ExtraBold';
// SwiftUI doesn't know that alias and needs the font's PostScript name instead.
const SWIFTUI_NUMBER_FONT = 'BricolageGrotesqueCondensed-ExtraBold';

// Accepts a keystroke only if the result could still be a real body weight.
// Values under MIN_WEIGHT_KG can't be blocked while typing ("8" may become "80"),
// so Save checks that instead. Runs on the UI thread, so a rejected digit is
// never drawn.
function nextWeightText(current: string, typed: string) {
  'worklet';
  // Some keyboards type a comma for the decimal.
  const text = typed.replace(',', '.');
  // Up to three whole digits with no leading zero, then at most one decimal.
  if (!/^([1-9]\d{0,2})?(\.\d?)?$/.test(text)) return current;
  if (text.startsWith('.')) return current;
  if (Number(text) > MAX_WEIGHT_KG) return current;
  return text;
}

// "Today, Nov 5": the day the weight is logged for.
function formatToday() {
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `Today, ${date}`;
}

// Sheet for logging today's weight. UI only for now.
export default function LogWeightScreen() {
  const text = useNativeState('');
  // The last value that passed validation. The field's own state already holds the
  // new keystroke when onTextChange runs, so it can't be used to roll back.
  const lastAccepted = useSharedValue('');
  // A JS copy of the accepted text, for enabling Save.
  const [weight, setWeight] = useState('');
  const canSave = Number(weight) >= MIN_WEIGHT_KG;

  const handleSave = () => {
    // TODO: store the weight and show it on the Weight card.
    // Swap the sheet for the streak celebration, like Balm after a check-in.
    router.replace('/streak');
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

        <AnimatedButton
          onPress={handleSave}
          disabled={!canSave}
          scaleTo={0.95}
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}>
          <Text style={styles.saveText}>Save</Text>
        </AnimatedButton>
      </View>

      <View style={styles.body}>
        <Host style={styles.fieldHost}>
          <TextField
            autoFocus
            text={text}
            onTextChange={(typed) => {
              'worklet';
              // Writing back from the UI thread replaces the keystroke before it renders.
              const accepted = nextWeightText(lastAccepted.get(), typed);
              lastAccepted.set(accepted);
              if (accepted !== typed) {
                text.set(accepted);
              }
              scheduleOnRN(setWeight, accepted);
            }}
            modifiers={[
              textFieldStyle('plain'),
              keyboardType('decimal-pad'),
              multilineTextAlignment('center'),
              font({ family: SWIFTUI_NUMBER_FONT, size: 104 }),
              foregroundStyle('#262626'),
              tint(BrandColor),
            ]}>
            <TextField.Placeholder>
              <SwiftText
                modifiers={[font({ family: SWIFTUI_NUMBER_FONT, size: 104 }), foregroundStyle('#d4d4d4')]}>
                0
              </SwiftText>
            </TextField.Placeholder>
          </TextField>
        </Host>
        <Text style={styles.unit}>kg</Text>

        {/* TODO: open a date picker so past weigh-ins can be logged. */}
        <AnimatedButton scaleTo={0.95} style={styles.dateButton}>
          <Text style={styles.dateText}>{formatToday()}</Text>
        </AnimatedButton>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f6f9',
  },
  // Same pill as the app's main buttons, sized to sit opposite the close button.
  saveButton: {
    height: 42,
    paddingHorizontal: 20,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BrandColor,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
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
