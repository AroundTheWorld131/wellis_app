import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { ClipPath, Defs, Line, Path, Rect } from 'react-native-svg';

import { AnimatedButton } from '@/components/animated-button';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

// Drawn in a 40×56 box and scaled to whatever width the grid gives each glass.
const VIEW_WIDTH = 40;
const VIEW_HEIGHT = 56;
// Water stops a little below the rim when the glass is full.
const WATER_TOP = 10;

// Tapered cup: wide rim at the top, narrower rounded base.
const CUP_PATH =
  'M2 0 H38 Q40 0 39.8 2 L35 50 Q34.4 56 28.5 56 H11.5 Q5.6 56 5 50 L0.2 2 Q0 0 2 0 Z';
// The inside of the cup, inset from the outline, which the water is clipped to.
const WATER_PATH = 'M4.6 4 H35.4 L31.4 47 Q31 51.5 26.5 51.5 H13.5 Q9 51.5 8.6 47 Z';

const COLORS = {
  cup: '#e8effc',
  water: '#4f8bec',
  shine: '#ffffff',
};

type WaterGlassProps = {
  width: number;
  filled: boolean;
  /** The next glass to fill shows a plus. */
  showPlus: boolean;
  onPress: () => void;
};

export function WaterGlass({ width, filled, showPlus, onPress }: WaterGlassProps) {
  const level = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    level.value = withTiming(filled ? 1 : 0, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
  }, [filled, level]);

  // Grow the water rect upward from the base as `level` goes from 0 to 1.
  const waterProps = useAnimatedProps(() => {
    const height = (VIEW_HEIGHT - WATER_TOP) * level.value;
    return { y: VIEW_HEIGHT - height, height };
  });

  const height = (width / VIEW_WIDTH) * VIEW_HEIGHT;

  return (
    <AnimatedButton onPress={onPress} scaleTo={0.9} style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}>
        <Defs>
          <ClipPath id="water">
            <Path d={WATER_PATH} />
          </ClipPath>
        </Defs>
        <Path d={CUP_PATH} fill={COLORS.cup} />
        <AnimatedRect
          x={0}
          width={VIEW_WIDTH}
          fill={COLORS.water}
          clipPath="url(#water)"
          animatedProps={waterProps}
        />
        {/* Shine streak down the left side. */}
        <Line
          x1={12.5}
          y1={14}
          x2={14.5}
          y2={40}
          stroke={COLORS.shine}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeOpacity={0.6}
        />
      </Svg>

      {showPlus ? (
        <SymbolView
          name="plus"
          size={16}
          weight="bold"
          tintColor="#262626"
          style={styles.plus}
          fallback={<Text style={[styles.plus, styles.plusFallback]}>+</Text>}
        />
      ) : null}
    </AnimatedButton>
  );
}

const styles = StyleSheet.create({
  plus: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
  },
  plusFallback: {
    fontSize: 20,
    fontWeight: '700',
    color: '#262626',
  },
});
