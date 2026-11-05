import { BlurView } from 'expo-blur';
import { useRef, type ComponentRef } from 'react';
import { StyleSheet, View, type TextStyle } from 'react-native';

import { BrandColor } from '@/constants/theme';

// Big salad emojis that sit under the blur and show through as soft color blobs.
const SALADS: TextStyle[] = [
  { left: 40, top: '60%', fontSize: 90, transform: [{ rotate: '-18deg' }],icon: '🥗' },
  { right: -80, bottom: -40, fontSize: 150, transform: [{ rotate: '22deg' }],icon: '🥣' },
];

export function WelcomeBackground() {
  // Android only blurs what's inside a BlurTargetView; iOS blurs whatever is behind the BlurView.
  const blurTargetRef = useRef<ComponentRef<typeof View>>(null);

  return (
    <View style={styles.container}>
      {/* <BlurTargetView ref={blurTargetRef} style={styles.blurTarget}>
        {SALADS.map((style, index) => (
          <Text key={index} style={[styles.salad, style]}>
            {style.icon}
          </Text>
        ))}
      </BlurTargetView> */}

      <BlurView
        blurTarget={blurTargetRef}
        blurMethod="dimezisBlurViewSdk31Plus"
        intensity={50}
        tint="light"
        style={StyleSheet.absoluteFill}
      />

      {/* Sits above the blur so the blur's tint doesn't wash out the blue. */}
      <View style={styles.gradient} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    pointerEvents: 'none',
  },
  blurTarget: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#ffffff',
  },
  salad: {
    position: 'absolute',
  },
  // Peeks in from the right edge beside the headline.
  rightSteps: {
    right: -12,
    top: '38%',
  },
  gradient: {
    ...StyleSheet.absoluteFill,
    // 8-digit hex: the last two digits are the alpha (26 ≈ 15%, 00 = transparent).
    // Extra stops ease the fade out so it has no visible edge.
    backgroundImage: `linear-gradient(to bottom, ${BrandColor}26 0%, ${BrandColor}17 25%, ${BrandColor}0A 45%, ${BrandColor}00 70%)`,
  },
});
