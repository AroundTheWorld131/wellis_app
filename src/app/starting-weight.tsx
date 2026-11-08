import { useMutation } from 'convex/react';
import { router } from 'expo-router';

import { LogSheet } from '@/components/log-sheet';
import { api } from '../../convex/_generated/api';

// Sheet for the weight the user started at. Saves it to their body details in Convex.
export default function StartingWeightScreen() {
  const updateBody = useMutation(api.body.update);

  return (
    <LogSheet
      unit="kg"
      min={30}
      max={300}
      allowDecimal
      title="Starting weight"
      onSave={async (startingWeightKg) => {
        await updateBody({ startingWeightKg });
        router.back();
      }}
    />
  );
}
