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
  track: '#f3f3f3',
  accent: '#e8986a',
  success: '#63ab64',
};

type MetricCardProps = {
  title: string;
  /** Illustration shown left of the title. */
  icon?: ImageSource;
  /** Shown right after the title, like the calories card's up/down chevron. */
  titleAccessory?: ReactNode;
  value: string;
  unit?: string;
  unitColor?: string;
  /** The ring or button on the right of the value. */
  action: ReactNode;
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
  onPress,
  children,
}: MetricCardProps) {
  const content = (
    <>
      <View style={styles.top}>
        <View style={styles.heading}>
          <View style={styles.titleRow}>
            {icon ? <Image source={icon} style={styles.icon} contentFit="contain" /> : null}
            <Text style={styles.title}>{title}</Text>
            {titleAccessory}
            {/* Tappable cards open a detail screen; the chevron says so. */}
            {onPress ? (
              <SymbolView
                name="chevron.right"
                size={13}
                weight="semibold"
                tintColor={CardColors.label}
                fallback={<Text style={styles.title}>›</Text>}
              />
            ) : null}
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
      <AnimatedButton onPress={onPress} scaleTo={0.98} style={styles.card}>
        {content}
      </AnimatedButton>
    );
  }
  return <View style={styles.card}>{content}</View>;
}

const RING_SIZE = 72;
const RING_STROKE = 8;

type ProgressRingButtonProps = {
  /** 0 to 1. At 0 the ring shows a single dot where progress starts. */
  progress: number;
  color?: string;
  /** What sits in the middle of the ring. Defaults to a plus. */
  icon?: ReactNode;
  onPress?: () => void;
};

// Grey ring that fills clockwise from the top, orange by default, with a plus in the middle.
export function ProgressRingButton({
  progress,
  color = CardColors.accent,
  icon = <PlusIcon />,
  onPress,
}: ProgressRingButtonProps) {
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useAnimatedProgress(progress);

  // The arc is one dash whose length grows with progress. A zero-length dash with a
  // round cap draws the starting dot.
  const arcProps = useAnimatedProps(() => ({
    strokeDasharray: [animatedProgress.value * circumference, circumference],
  }));

  return (
    <AnimatedButton onPress={onPress} scaleTo={0.92} style={styles.ring}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          stroke={CardColors.track}
          strokeWidth={RING_STROKE}
          fill="none"
        />
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          stroke={color}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          animatedProps={arcProps}
          fill="none"
          // Start at 12 o'clock instead of 3 o'clock.
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
      </Svg>
      {icon}
    </AnimatedButton>
  );
}

// Same size as the ring, but a solid grey circle, for cards without a daily target.
export function PlusCircleButton({ onPress }: { onPress?: () => void }) {
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
      size={26}
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
    borderRadius: 40,
    borderCurve: 'continuous',
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 28,
    gap: 28,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heading: {
    flex: 1,
    gap: 6,
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
    color: CardColors.label,
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
    fontSize: 32,
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
