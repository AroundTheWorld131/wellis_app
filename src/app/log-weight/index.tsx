import { useMutation } from 'convex/react';
import { router } from 'expo-router';

import { useLogDay } from '@/components/log-day';
import { LogSheet } from '@/components/log-sheet';
import { api } from '../../../convex/_generated/api';

// Sheet for logging weight, today unless the date pill picks another day. Saves it to
// Convex, replacing any weigh-in already logged that day.
export default function LogWeightScreen() {
  const logWeight = useMutation(api.weight.log);
  const { day } = useLogDay();

  return (
    <LogSheet
      title="Add weight"
      showDate
      unit="kg"
      min={30}
      max={300}
      allowDecimal
      day={day}
      onDatePress={() => router.push('/log-weight/date')}
      onSave={async (weightKg) => {
        await logWeight({ day, weightKg });
        // Swap the sheet for the streak celebration, like Balm after a check-in.
        router.replace('/streak');
      }}
    />
  );
}
