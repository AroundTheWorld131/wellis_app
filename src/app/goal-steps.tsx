import { useMutation } from 'convex/react';
import { router } from 'expo-router';

import { LogSheet } from '@/components/log-sheet';
import { api } from '../../convex/_generated/api';

// Sheet for changing the daily step goal. Saves it to the user's goals in Convex.
export default function GoalStepsScreen() {
  const updateGoals = useMutation(api.goals.update);

  return (
    <LogSheet
      unit="steps"
      min={500}
      max={50000}
      allowDecimal={false}
      title="Daily step goal"
      onSave={async (steps) => {
        await updateGoals({ steps });
        router.back();
      }}
    />
  );
}
