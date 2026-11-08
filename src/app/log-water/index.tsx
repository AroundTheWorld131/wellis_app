import { useMutation } from 'convex/react';
import { router } from 'expo-router';

import { useLogDay } from '@/components/log-day';
import { LogSheet } from '@/components/log-sheet';
import { api } from '../../../convex/_generated/api';

// Sheet for logging water, today unless the date pill picks another day. Adds it to that
// day's total in Convex; today's total fills the Water card's glasses.
export default function LogWaterScreen() {
  const addWater = useMutation(api.water.add);
  const { day } = useLogDay();

  return (
    <LogSheet
      title="Add water"
      showDate
      unit="ml"
      min={1}
      max={5000}
      allowDecimal={false}
      day={day}
      onDatePress={() => router.push('/log-water/date')}
      onSave={async (amountMl) => {
        await addWater({ day, amountMl });
        router.back();
      }}
    />
  );
}
