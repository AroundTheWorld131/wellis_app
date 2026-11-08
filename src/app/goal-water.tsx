import { useMutation } from 'convex/react';
import { router } from 'expo-router';

import { LogSheet } from '@/components/log-sheet';
import { api } from '../../convex/_generated/api';

// Sheet for changing the daily water goal. Saves it to the user's goals in Convex.
export default function GoalWaterScreen() {
  const updateGoals = useMutation(api.goals.update);

  return (
    <LogSheet
      unit="ml"
      min={250}
      max={10000}
      allowDecimal={false}
      title="Daily water goal"
      onSave={async (waterMl) => {
        await updateGoals({ waterMl });
        router.back();
      }}
    />
  );
}
