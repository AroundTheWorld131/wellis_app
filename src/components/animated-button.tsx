import * as Haptics from 'expo-haptics';
import { useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  TouchableOpacity,
  type GestureResponderEvent,
  type StyleProp,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';

// Ported from the Balm app's AnimatedButton. Haptics are always on here, since
// this app has no haptics preference yet.

// How long a navigating button takes to scale back before its screen opens.
const NAVIGATE_RELEASE_MS = 100;

const HAPTIC_IMPACT = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
  soft: Haptics.ImpactFeedbackStyle.Soft,
  rigid: Haptics.ImpactFeedbackStyle.Rigid,
} as const;

type AnimatedButtonProps = Omit<TouchableOpacityProps, 'onPress' | 'style'> & {
  children: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  /** Disables the press scaling animation. */
  disableAnimation?: boolean;
  scaleTo?: number;
  disabledHaptic?: boolean;
  /** Set when onPress opens a screen: onPress waits for the release animation to finish. */
  navigates?: boolean;
  hapticStyle?: keyof typeof HAPTIC_IMPACT;
};

/**
 * The scale uses Animated's native driver rather than Reanimated: native-driver
 * transforms are written straight to the view, while Reanimated pauses its
 * frames whenever React commits, which is exactly when onPress opens a screen.
 */
export function AnimatedButton({
  children,
  onPress,
  style,
  disabled = false,
  disableAnimation = false,
  scaleTo = 0.95,
  activeOpacity = 1,
  disabledHaptic = false,
  hapticStyle = 'light',
  navigates = false,
  ...props
}: AnimatedButtonProps) {
  const [scaleValue] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: scaleTo,
      useNativeDriver: true,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    if (navigates) {
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: NAVIGATE_RELEASE_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
      return;
    }
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (!disabledHaptic) {
      void Haptics.impactAsync(HAPTIC_IMPACT[hapticStyle]);
    }
    if (navigates && !disableAnimation) {
      // Mounting the next screen blocks the main thread the scale animates
      // on, so let the release finish before onPress opens it.
      setTimeout(() => {
        onPress?.(event);
      }, NAVIGATE_RELEASE_MS);
      return;
    }
    // Wait a frame so the spring-back above reaches native before onPress
    // starts heavy JS work like rendering the next screen.
    requestAnimationFrame(() => {
      onPress?.(event);
    });
  };

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={handlePress}
      onPressIn={disableAnimation ? undefined : handlePressIn}
      onPressOut={disableAnimation ? undefined : handlePressOut}
      activeOpacity={activeOpacity}
      style={[style, !disableAnimation && { transform: [{ scale: scaleValue }] }]}
      {...props}>
      {children}
    </TouchableOpacity>
  );
}
