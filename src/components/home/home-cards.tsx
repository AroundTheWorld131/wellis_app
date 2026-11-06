import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import {
  CardColors,
  CardFooter,
  MetricCard,
  PlusCircleButton,
  ProgressRingButton,
} from '@/components/home/metric-card';
import { WaterGlass } from '@/components/home/water-glass';
import { metricHref } from '@/constants/metrics';
import { useAnimatedProgress } from '@/hooks/use-animated-progress';

// UI only: the numbers are placeholders until there's real tracking data.
// TODO: wire the plus and more buttons to logging screens.

// Grams eaten and the daily goal for each macro.
const MACROS = [
  { label: 'Carbs', eaten: 134, goal: 492, color: '#f2b544' },
  { label: 'Fats', eaten: 38, goal: 84, color: '#ec7a8c' },
  { label: 'Proteins', eaten: 61, goal: 150, color: '#6bbf8a' },
];

const CALORIES_COLOR = '#4f8bec';

// Grey track whose colored fill grows in from the left.
function MacroBar({ progress, color }: { progress: number; color: string }) {
  const animatedProgress = useAnimatedProgress(progress);
  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  return (
    <View style={styles.macroTrack}>
      <Animated.View style={[styles.macroFill, { backgroundColor: color }, fillStyle]} />
    </View>
  );
}

export function CaloriesCard() {
  return (
    <MetricCard
      title="Calories eaten"
      onPress={() => router.push(metricHref('calories'))}
      icon={require('@/assets/images/cardIcons/calories.png')}
      value="30"
      action={<ProgressRingButton progress={0} color={CALORIES_COLOR} />}>
      <View style={styles.macros}>
        {MACROS.map((macro) => (
          <View key={macro.label} style={styles.macro}>
            <Text style={styles.macroLabel}>{macro.label}</Text>
            <MacroBar progress={macro.eaten / macro.goal} color={macro.color} />
            <Text style={styles.macroAmount}>
              {macro.eaten}
              <Text style={styles.macroGoal}>/{macro.goal}</Text>
            </Text>
          </View>
        ))}
      </View>
    </MetricCard>
  );
}

const GLASS_ML = 250;
const WATER_GOAL_ML = 2500;
const GLASS_COUNT = WATER_GOAL_ML / GLASS_ML;
const GLASSES_PER_ROW = 6;
const GLASS_GAP = 10;

export function WaterCard() {
  const [glassesDrunk, setGlassesDrunk] = useState(2);
  const [gridWidth, setGridWidth] = useState(0);
  const waterMl = glassesDrunk * GLASS_ML;
  const glassWidth = (gridWidth - GLASS_GAP * (GLASSES_PER_ROW - 1)) / GLASSES_PER_ROW;

  // Tapping an empty glass fills up to it; tapping a full one empties it and everything after.
  const handleGlassPress = (index: number) => {
    setGlassesDrunk(index < glassesDrunk ? index : index + 1);
  };

  return (
    <MetricCard
      title="Water"
      onPress={() => router.push(metricHref('water'))}
      icon={require('@/assets/images/cardIcons/water.png')}
      value={waterMl.toLocaleString('en-US')}
      unit="ml"
      action={
        <ProgressRingButton
          progress={waterMl / WATER_GOAL_ML}
          color={CALORIES_COLOR}
          onPress={() => setGlassesDrunk((count) => Math.min(count + 1, GLASS_COUNT))}
        />
      }>
      <View style={styles.glasses} onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}>
        {gridWidth > 0
          ? Array.from({ length: GLASS_COUNT }, (_, index) => (
              <WaterGlass
                key={index}
                width={glassWidth}
                filled={index < glassesDrunk}
                showPlus={index === glassesDrunk}
                onPress={() => handleGlassPress(index)}
              />
            ))
          : null}
      </View>
      <CardFooter>
        <Text style={styles.footerText}>Goal: {WATER_GOAL_ML.toLocaleString('en-US')} ml</Text>
      </CardFooter>
    </MetricCard>
  );
}

// Placeholder for the most recent injection until shots are logged for real.
const LAST_SHOT = {
  dose: '2.5',
  time: '12:39',
  site: 'Stomach, upper left',
};

export function ShotCard() {
  return (
    <MetricCard
      title="Shot"
      onPress={() => router.push(metricHref('shot'))}
      icon={require('@/assets/images/cardIcons/shot.png')}
      value={LAST_SHOT.dose}
      unit="mg"
      unitColor="#d4d4d4"
      action={<PlusCircleButton />}>
      <CardFooter>
        <Text style={styles.footerText}>
          {LAST_SHOT.time} · {LAST_SHOT.site}
        </Text>
      </CardFooter>
    </MetricCard>
  );
}

const WEIGHT_KG = 60;
const START_WEIGHT_KG = 67.4;

const STEPS = 6240;
const STEPS_GOAL = 10000;
const STEPS_COLOR = '#6bbf8a';

export function StepsCard() {
  return (
    <MetricCard
      title="Steps"
      onPress={() => router.push(metricHref('steps'))}
      icon={require('@/assets/images/cardIcons/steps.png')}
      value={STEPS.toLocaleString('en-US')}
      action={
        <ProgressRingButton
          progress={STEPS / STEPS_GOAL}
          color={STEPS_COLOR}
          icon={
            <SymbolView
              name="figure.walk"
              size={26}
              weight="semibold"
              tintColor={CardColors.value}
              fallback={<Text style={styles.footerText}>👟</Text>}
            />
          }
        />
      }>
      <CardFooter>
        <Text style={styles.footerText}>Goal: {STEPS_GOAL.toLocaleString('en-US')} steps</Text>
      </CardFooter>
    </MetricCard>
  );
}

const openLogWeight = () => router.push('/log-weight');

export function WeightCard() {
  const lostKg = Math.round((START_WEIGHT_KG - WEIGHT_KG) * 10) / 10;

  return (
    <MetricCard
      title="Weight"
      icon={require('@/assets/images/cardIcons/weight.png')}
      value={String(WEIGHT_KG)}
      unit="kg"
      unitColor="#d4d4d4"
      // The card opens the Weight screen; the plus logs a new weight.
      onPress={() => router.push(metricHref('weight'))}
      action={<PlusCircleButton onPress={openLogWeight} />}>
      <CardFooter>
        <View style={styles.downBadge}>
          <SymbolView
            name="chevron.down"
            size={11}
            weight="heavy"
            tintColor="#ffffff"
            fallback={<Text style={styles.downFallback}>⌄</Text>}
          />
        </View>
        <Text style={[styles.footerText, styles.successText]}>Down −{lostKg} kg</Text>
      </CardFooter>
    </MetricCard>
  );
}

const styles = StyleSheet.create({
  macros: {
    flexDirection: 'row',
    gap: 24,
  },
  macro: {
    flex: 1,
    gap: 12,
  },
  macroLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: CardColors.label,
  },
  macroTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#ececf1',
    overflow: 'hidden',
  },
  macroAmount: {
    // Sits 4pt under the bar instead of the column's 12pt gap.
    marginTop: -8,
    fontSize: 15,
    fontWeight: '600',
    color: CardColors.value,
  },
  macroGoal: {
    color: CardColors.label,
  },
  macroFill: {
    height: '100%',
    borderRadius: 999,
  },
  glasses: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: GLASS_GAP,
    rowGap: 16,
  },
  footerText: {
    fontSize: 17,
    fontWeight: '600',
    color: CardColors.label,
  },
  successText: {
    color: CardColors.success,
  },
  downBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: CardColors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downFallback: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
});
