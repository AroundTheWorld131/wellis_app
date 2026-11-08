import { Image, type ImageSource } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { AnimatedButton } from '@/components/animated-button';
import { useAnimatedProgress } from '@/hooks/use-animated-progress';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const CardColors = {
  label: '#a3a3a3',
  value: '#262626',
  track: '#f2f2f6',
  accent: '#e8986a',
  success: '#63ab64',
};

type MetricCardProps = {
  title: string;
  /** Illustration shown left of the title. */
  icon?: ImageSource;
  /** Shown right after the title, like a small chevron. */
  titleAccessory?: ReactNode;
  value: string;
  unit?: string;
  unitColor?: string;
  /** The ring or button on the right of the value. */
  action: ReactNode;
  /** Where the action sits: centered beside the title and value, or in the top right corner. */
  actionPlacement?: 'center' | 'top';
  /** Makes the whole card tappable, not just its action. */
  onPress?: () => void;
  children?: ReactNode;
};

// White home card: grey title, big number with an optional unit, and an action on the right.
export function MetricCard({
  title,
  icon,
  titleAccessory,
  value,
  unit,
  unitColor = CardColors.label,
  action,
  actionPlacement = 'center',
  onPress,
  children,
}: MetricCardProps) {
  const content = (
    <>
      <View style={[styles.top, actionPlacement === 'top' && styles.topAligned]}>
        <View style={styles.heading}>
          <View style={styles.titleRow}>
            {icon ? <Image source={icon} style={styles.icon} contentFit="contain" /> : null}
            <Text style={styles.title}>{title}</Text>
            {titleAccessory}
          </View>
          <View style={styles.valueRow}>
            <Text style={styles.value}>{value}</Text>
            {unit ? <Text style={[styles.unit, { color: unitColor }]}>{unit}</Text> : null}
          </View>
        </View>
        {action}
      </View>
      {children}
    </>
  );

  if (onPress) {
    return (
      <AnimatedButton onPress={onPress} disableAnimation style={styles.card}>
        {content}
      </AnimatedButton>
    );
  }
  return <View style={styles.card}>{content}</View>;
}

const RING_SIZE = 48;
const RING_STROKE = 5;

type ProgressRingButtonProps = {
  /** 0 to 1. At 0 the ring shows a single dot where progress starts. */
  progress: number;
  color?: string;
  /** What sits in the middle of the ring. Defaults to a plus. */
  icon?: ReactNode;
  /** Width and height of the ring. */
  size?: number;
  onPress?: () => void;
};

// Grey ring that fills clockwise from the top, orange by default, with a plus in the middle.
export function ProgressRingButton({
  progress,
  color = CardColors.accent,
  icon = <PlusIcon />,
  size = RING_SIZE,
  onPress,
}: ProgressRingButtonProps) {
  const radius = (size - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useAnimatedProgress(progress);

  // The arc is one dash whose length grows with progress. A zero-length dash with a
  // round cap draws the starting dot.
  const arcProps = useAnimatedProps(() => ({
    strokeDasharray: [animatedProgress.value * circumference, circumference],
  }));

  const sizeStyle = { width: size, height: size, borderRadius: size / 2 };

  const ring = (
    <>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={CardColors.track}
          strokeWidth={RING_STROKE}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          animatedProps={arcProps}
          fill="none"
          // Start at 12 o'clock instead of 3 o'clock.
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {icon}
    </>
  );

  // Without onPress it's a plain view, so taps reach the card around it.
  if (!onPress) return <View style={[styles.ring, sizeStyle]}>{ring}</View>;
  return (
    <AnimatedButton onPress={onPress} scaleTo={0.92} style={[styles.ring, sizeStyle]}>
      {ring}
    </AnimatedButton>
  );
}

// Same size as the ring, but a solid grey circle, for cards without a daily target.
export function PlusCircleButton({ onPress }: { onPress?: () => void }) {
  if (!onPress) {
    return (
      <View style={[styles.ring, styles.plusCircle]}>
        <PlusIcon />
      </View>
    );
  }
  return (
    <AnimatedButton onPress={onPress} scaleTo={0.92} style={[styles.ring, styles.plusCircle]}>
      <PlusIcon />
    </AnimatedButton>
  );
}

function PlusIcon() {
  return (
    <SymbolView
      name="plus"
      size={20}
      weight="bold"
      tintColor={CardColors.value}
      fallback={<Text style={styles.plusFallback}>+</Text>}
    />
  );
}

// Bottom row: a status on the left and a more button on the right.
export function CardFooter({ children, onMorePress }: { children: ReactNode; onMorePress?: () => void }) {
  return (
    <View style={styles.footer}>
      <View style={styles.footerContent}>{children}</View>
      <AnimatedButton onPress={onMorePress} hitSlop={12} style={styles.more}>
        <SymbolView
          name="ellipsis"
          size={16}
          weight="bold"
          tintColor={CardColors.label}
          fallback={<Text style={styles.moreFallback}>•••</Text>}
        />
      </AnimatedButton>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    borderCurve: 'continuous',
    // Same hairline border and soft shadow as the other Home cards.
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 5,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 28,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Action pinned to the top right instead of centered on the title and value.
  topAligned: {
    alignItems: 'flex-start',
  },
  heading: {
    flex: 1,
    gap: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    width: 18,
    height: 18,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: CardColors.value,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  value: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 40,
    color: CardColors.value,
  },
  unit: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 24,
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  plusCircle: {
    backgroundColor: CardColors.track,
    
  },
  plusFallback: {
    fontSize: 26,
    fontWeight: '700',
    color: CardColors.value,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  more: {
    paddingVertical: 4,
  },
  moreFallback: {
    fontSize: 14,
    color: CardColors.label,
  },
});
