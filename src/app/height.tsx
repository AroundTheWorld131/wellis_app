import { useMutation } from 'convex/react';
import { router } from 'expo-router';

import { LogSheet } from '@/components/log-sheet';
import { api } from '../../convex/_generated/api';

// Sheet for the user's height in whole centimetres. Saves it to their body details in Convex.
export default function HeightScreen() {
  const updateBody = useMutation(api.body.update);

  return (
    <LogSheet
      unit="cm"
      min={100}
      max={250}
      allowDecimal={false}
      title="Height"
      onSave={async (heightCm) => {
        await updateBody({ heightCm });
        router.back();
      }}
    />
  );
}
