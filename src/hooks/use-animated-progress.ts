import { useEffect } from 'react';
import { Easing, useSharedValue, withTiming } from 'react-native-reanimated';

const DURATION_MS = 700;

/**
 * Starts at 0 and eases to `progress` (0 to 1), then follows it whenever it changes,
 * so progress bars and rings fill in when a screen opens and slide on every update.
 */
export function useAnimatedProgress(progress: number) {
  const target = Math.min(Math.max(progress, 0), 1);
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withTiming(target, {
      duration: DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [target, value]);

  return value;
}
