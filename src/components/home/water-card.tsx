import { useMutation, useQuery } from 'convex/react';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CardColors, MetricCard, PlusCircleButton } from '@/components/home/metric-card';
import { WaterGlass } from '@/components/home/water-glass';
import { metricHref } from '@/constants/metrics';
import { useTodayWater } from '@/hooks/use-water';
import { dayKey } from '@/lib/days';
import { api } from '../../../convex/_generated/api';

const GLASS_ML = 250;
// Until the user's goals load, or when signed out.
const DEFAULT_WATER_GOAL_ML = 2500;
const GLASSES_PER_ROW = 6;
const GLASS_GAP = 10;

// Today's water from Convex against the daily goal. Each glass is 250 ml. The card opens
// the water detail screen, like Steps; the + button opens the Add Water sheet.
export function WaterCard() {
  const waterMl = useTodayWater();
  const goalMl = useQuery(api.goals.get)?.waterMl ?? DEFAULT_WATER_GOAL_ML;
  // Shows the new total straight away, before Convex confirms it, so taps feel instant.
  const setTotal = useMutation(api.water.setTotal).withOptimisticUpdate((store, { day, totalMl }) => {
    store.setQuery(api.water.history, { from: day, to: day }, totalMl > 0 ? [{ day, totalMl }] : []);
  });
  const [gridWidth, setGridWidth] = useState(0);
  // Enough glasses for the goal, rounded up to fill the last row, minus the last 2
  // (10 for 2,500 ml becomes 12, then 10).
  const glassCount = Math.ceil(Math.ceil(goalMl / GLASS_ML) / GLASSES_PER_ROW) * GLASSES_PER_ROW - 2;
  // Only whole glasses fill, so 330 ml shows one glass.
  const glassesDrunk = Math.floor((waterMl ?? 0) / GLASS_ML);
  const glassWidth = (gridWidth - GLASS_GAP * (GLASSES_PER_ROW - 1)) / GLASSES_PER_ROW;

  // Tapping an empty glass fills up to it; tapping a full one empties it and everything after.
  const handleGlassPress = (index: number) => {
    if (waterMl === undefined) return;
    const glasses = index < glassesDrunk ? index : index + 1;
    setTotal({ day: dayKey(), totalMl: glasses * GLASS_ML }).catch((error) =>
      console.warn('Could not save water', error),
    );
  };

  return (
    <MetricCard
      title="Water"
      onPress={() => router.push(metricHref('water'))}
      icon={require('@/assets/images/cardIcons/water.png')}
      // A dash while loading.
      value={waterMl === undefined ? '—' : waterMl.toLocaleString('en-US')}
      unit="ml"
      actionPlacement="top"
      action={<PlusCircleButton onPress={() => router.push('/log-water')} />}>
      <View style={styles.glasses} onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}>
        {gridWidth > 0
          ? Array.from({ length: glassCount }, (_, index) => (
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
    </MetricCard>
  );
}

const styles = StyleSheet.create({
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
});
