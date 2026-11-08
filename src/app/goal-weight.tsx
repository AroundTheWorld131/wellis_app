import { useMutation } from 'convex/react';
import { router } from 'expo-router';

import { LogSheet } from '@/components/log-sheet';
import { api } from '../../convex/_generated/api';

// Sheet for changing the goal weight. Saves it to the user's goals in Convex.
export default function GoalWeightScreen() {
  const updateGoals = useMutation(api.goals.update);

  return (
    <LogSheet
      unit="kg"
      min={30}
      max={300}
      allowDecimal
      title="Goal weight"
      onSave={async (weightKg) => {
        await updateGoals({ weightKg });
        router.back();
      }}
    />
  );
}
