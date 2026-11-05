import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedButton } from '@/components/animated-button';
import { WelcomeBackground } from '@/components/welcome-background';
import { BrandColor, Spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <WelcomeBackground />

      <View style={[styles.content, { paddingBottom: insets.bottom }]}>
        <View style={{flex:1}}/>
        <View style={styles.hero}>
          {/* Pens render first so they start hidden behind the case, then pop out to each side. */}
          <View style={styles.caseStage}>
            <PoppingPen
              source={require('@/assets/images/pen-wegovy.png')}
              aspectRatio={660 / 955}
              side="left"
              delay={250}
            />
            {/* Stand-in until there's a Zepbound pen photo: same maker and drug (tirzepatide). */}
            <PoppingPen
              source={require('@/assets/images/pen-mounjaro.png')}
              aspectRatio={491 / 953}
              side="right"
              delay={380}
            />
            <Image
              source={require('@/assets/images/wellis-products/product/pen-case-flat-cutout.png')}
              style={styles.penCase}
              contentFit="contain"
            />
          </View>
          {/* Hand-written note whose arrow points at the logo. */}
          <Image
            source={require('@/assets/images/wellis-logo.svg')}
            style={styles.logo}
            contentFit="contain"
          />
          {/* <Text style={styles.headline}>{'Proven weight loss care'}</Text> */}
          <Text style={styles.subtitle}>
            {'Clinically proven weight loss, with personal guidance from doctors and dietitians.'}
            
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.buttons}>
            <AnimatedButton
              navigates
              onPress={() => router.push('/onboarding/signup')}
              style={[styles.button, styles.primaryButton]}>
              <Text style={[styles.buttonText, styles.primaryButtonText]}>Get Started</Text>
            </AnimatedButton>

            <AnimatedButton
              navigates
              onPress={() => router.push('/onboarding/login')}
              style={[styles.button, styles.secondaryButton]}>
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Log In</Text>
            </AnimatedButton>
          </View>

          <Text style={styles.legal}>
            {'By continuing, you agree to our\n'}
            <Text style={styles.legalLink}>Terms of Use</Text>
            {' and '}
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const PEN_HEIGHT = 150;

// Pen photos already lean top-left, so the right pen turns further to lean the other way.
const PEN_POSES = {
  left: { x: -88, y: -28, fromRotate: 0, toRotate: 4 },
  right: { x: 88, y: -28, fromRotate: 30, toRotate: 46 },
} as const;

type PoppingPenProps = {
  source: number;
  aspectRatio: number;
  side: keyof typeof PEN_POSES;
  delay: number;
};

// Slides out from behind the case and eases to a stop, with no overshoot.
function PoppingPen({ source, aspectRatio, side, delay }: PoppingPenProps) {
  const progress = useSharedValue(0);
  const pose = PEN_POSES[side];

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) }),
    );
  }, [delay, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.2], [0, 1], 'clamp'),
    transform: [
      { translateX: pose.x * progress.value },
      { translateY: pose.y * progress.value },
      { rotate: `${interpolate(progress.value, [0, 1], [pose.fromRotate, pose.toRotate])}deg` },
      { scale: interpolate(progress.value, [0, 1], [0.6, 1]) },
    ],
  }));

  return (
    <Animated.View
      style={[styles.pen, { width: PEN_HEIGHT * aspectRatio }, animatedStyle]}>
      <Image source={source} style={StyleSheet.absoluteFill} contentFit="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: 'space-between',
  },
  hero: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.three,
  },
  // Matches the note's width plus its left margin.
  noteSpacer: {
    width: 104,
  },
  // Pens are centered on the case and translate out from there.
  caseStage: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  pen: {
    position: 'absolute',
    height: PEN_HEIGHT,
    pointerEvents: 'none',
  },
  // Source PNG is 480×977.
  penCase: {
    width: 130,
    aspectRatio: 480 / 977,
  },
  // Source SVG is 109×37, scaled down.
  logo: {
    width: 150,
    height: 80,
  },
  // Text sits above the logo; the arrow underneath lands at the logo's middle.
  note: {
    width: 92,
    marginLeft: 12,
    marginTop: -28,
    alignItems: 'flex-start',
    transform: [{ rotate: '-4deg' }],
  },
  // The arrow SVG points right; flip it so it points back at the logo,
  // and pull it left so the head reaches past the note's edge.
  noteArrow: {
    width: 56,
    height: 21,
    marginTop: -2,
    marginLeft: -14,
    transform: [{ scaleX: -1 }],
  },
  noteText: {
    fontFamily: 'Caveat_600SemiBold',
    fontSize: 24,
    color: '#737373',
    marginLeft: 10,
  },
  headline: {
    fontSize: 24,
    color: '#262626',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: Spacing.two,
    fontSize: 18,
    lineHeight: 21,
    letterSpacing: -0.3,
    color: '#262626',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  // Two stacked full-width pills, same layout as the Balm welcome screen.
  buttons: {
    alignSelf: 'stretch',
    marginHorizontal: 26,
    gap: 15,
    marginBottom: 50
  },
  button: {
    height: 52,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 19,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  primaryButton: {
    backgroundColor: BrandColor,
  },
  primaryButtonText: {
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  secondaryButtonText: {
    color: '#262626',
  },
  legal: {
 
    color: '#a3a3a3',
    fontSize: 12,
    textAlign: 'center',
    marginBottom:6
  },
  legalLink: {
    color: '#262626',
  },
});
