import { useQuery } from 'convex/react';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text } from 'react-native';

import { CardColors, MetricCard, ProgressRingButton } from '@/components/home/metric-card';
import { metricHref } from '@/constants/metrics';
import { useTodaySteps } from '@/hooks/use-daily-steps';
import { api } from '../../../convex/_generated/api';

// Until the user's goals load, or when signed out.
const DEFAULT_STEPS_GOAL = 10000;
const STEPS_COLOR = '#6bbf8a';

// Today's steps from Apple Health against the daily goal saved in Convex.
export function StepsCard() {
  const steps = useTodaySteps();
  const goal = useQuery(api.goals.get)?.steps ?? DEFAULT_STEPS_GOAL;

  return (
    <MetricCard
      title="Steps"
      onPress={() => router.push(metricHref('steps'))}
      icon={require('@/assets/images/cardIcons/steps.png')}
      // A dash while Health loads, or where it isn't available (Android, web).
      value={steps === null ? '—' : steps.toLocaleString('en-US')}
      actionPlacement="top"
      action={
        <ProgressRingButton
          progress={steps === null ? 0 : Math.min(steps / goal, 1)}
          color={STEPS_COLOR}
          icon={
            <SymbolView
              name="figure.walk"
              size={20}
              weight="semibold"
              tintColor={CardColors.value}
              fallback={<Text style={styles.footerText}>👟</Text>}
            />
          }
        />
      }>
    </MetricCard>
  );
}

const styles = StyleSheet.create({
  footerText: {
    fontSize: 17,
    fontWeight: '600',
    color: CardColors.label,
  },
});
