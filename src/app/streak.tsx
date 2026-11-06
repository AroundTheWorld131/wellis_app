import { Host, Text as SwiftText } from '@expo/ui/swift-ui';
import {
  Animation,
  animation,
  blur,
  contentTransition,
  font,
  foregroundStyle,
  frame,
  opacity,
  scaleEffect,
} from '@expo/ui/swift-ui/modifiers';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { usePatternComposer } from 'react-native-pulsar';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedButton } from '@/components/animated-button';
import { BrandColor } from '@/constants/theme';
import { sampleStreakWeek } from '@/constants/sample-streak';

// Ported from the Balm app's streak screen, shown after logging a weight.
// Balm's confetti needs a native module Wellis doesn't have yet.

// Yesterday's streak fades in, then rolls up to today's once the haptic has charged.
const START_DELAY_MS = 300;
const CHARGE_DURATION_MS = 500;
const ROLL_DELAY_MS = START_DELAY_MS + CHARGE_DURATION_MS;
const CONFIRMATION_DELAY_MS = 60;
// Same as Balm: a rising buzz while the number charges, then one sharp tap as it rolls.
const CHARGING_HAPTIC_PATTERN = {
  continuousPattern: {
    amplitude: [
      { time: 0, value: 0.2 },
      { time: CHARGE_DURATION_MS, value: 0.5 },
    ],
    frequency: [
      { time: 0, value: 0.15 },
      { time: CHARGE_DURATION_MS, value: 0.85 },
    ],
  },
  discretePattern: [
    {
      time: CHARGE_DURATION_MS + CONFIRMATION_DELAY_MS,
      amplitude: 1,
      frequency: 0.9,
    },
  ],
};

// SwiftUI looks fonts up by PostScript name, not the alias React Native uses.
const SWIFTUI_NUMBER_FONT = 'BricolageGrotesqueCondensed-ExtraBold';
const NUMBER_FONT = 'BricolageGrotesque_Condensed800ExtraBold';

export default function StreakScreen() {
  const insets = useSafeAreaInsets();
  const [{ days, streak }] = useState(sampleStreakWeek);
  const [streakValue, setStreakValue] = useState(Math.max(streak - 1, 0));
  const [isStreakVisible, setIsStreakVisible] = useState(false);
  const { play: playChargingHaptic, stop: stopChargingHaptic } =
    usePatternComposer(CHARGING_HAPTIC_PATTERN);

  useEffect(() => {
    const revealTimer = setTimeout(() => {
      setIsStreakVisible(true);
      playChargingHaptic();
    }, START_DELAY_MS);
    // Changing the value runs SwiftUI's numeric content transition, so the digit rolls.
    const rollTimer = setTimeout(() => setStreakValue(streak), ROLL_DELAY_MS);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(rollTimer);
      stopChargingHaptic();
    };
  }, [streak, playChargingHaptic, stopChargingHaptic]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.content}>
        <View style={styles.summary}>
          <Image
            source={require('@/assets/images/cardIcons/streak.png')}
            style={styles.flame}
            contentFit="contain"
          />
          <Host matchContents={{ vertical: true }} style={styles.numberHost}>
            <SwiftText
              modifiers={[
                font({ family: SWIFTUI_NUMBER_FONT, size: 120 }),
                foregroundStyle('#262626'),
                frame({ width: 240, alignment: 'center' }),
                blur(isStreakVisible ? 0 : 8),
                opacity(isStreakVisible ? 1 : 0),
                scaleEffect(isStreakVisible ? 1 : 0.6),
                animation(Animation.easeIn({ duration: 0.3 }), isStreakVisible),
                contentTransition('numericText', { countsDown: false }),
                animation(Animation.spring({ duration: 0.5, bounce: 0.3 }), streakValue),
              ]}>
              {String(streakValue)}
            </SwiftText>
          </Host>
          <Text style={styles.streakLabel}>DAY STREAK</Text>
        </View>

        <View style={styles.weekRow}>
          {days.map((day, index) => (
            <View key={index} style={styles.dayColumn}>
              <Text style={[styles.dayLabel, day.isToday && styles.todayLabel]}>{day.letter}</Text>
              <View style={styles.dayCircle}>
                {day.logged ? (
                  // Today's circle pops in as the number rolls; earlier days are already filled.
                  <Animated.View
                    entering={ZoomIn.delay(day.isToday ? ROLL_DELAY_MS : 0)}
                    style={styles.dayLogged}>
                    <SymbolView
                      name="checkmark"
                      size={14}
                      weight="bold"
                      tintColor="#ffffff"
                      fallback={<Text style={styles.checkFallback}>✓</Text>}
                    />
                  </Animated.View>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.message}>
          {'Weight logged! Step on the scale again\ntomorrow to keep your streak alive.'}
        </Text>
      </View>

      <AnimatedButton navigates onPress={() => router.back()} style={styles.button}>
        <Text style={styles.buttonText}>Keep it up</Text>
      </AnimatedButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    marginBottom: 60,
    alignItems: 'center',
  },
  flame: {
    width: 100,
    height: 100,
  },
  numberHost: {
    marginTop: 10,
    width: 240,
  },
  streakLabel: {
    marginTop: -6,
    fontFamily: NUMBER_FONT,
    fontSize: 22,
    color: 'rgba(0, 0, 0, 0.3)',
  },
  weekRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 45,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.3)',
  },
  todayLabel: {
    color: '#000000',
  },
  dayCircle: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#f6f6f9',
  },
  dayLogged: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: BrandColor,
  },
  checkFallback: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  message: {
    marginTop: 60,
    paddingHorizontal: 30,
    fontSize: 16,
    letterSpacing: -0.2,
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.5)',
  },
  // Same pill as the welcome screen's Get Started button.
  button: {
    marginHorizontal: 30,
    height: 52,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BrandColor,
  },
  buttonText: {
    fontSize: 19,
    fontWeight: '600',
    color: '#ffffff',
  },
});
