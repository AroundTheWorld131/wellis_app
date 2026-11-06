import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AnimatedButton } from '@/components/animated-button';

// Ported from the Balm app's SwitchPicker: a grey track with a white pill that slides
// to the selected option.

const PADDING = 3;

type SwitchPickerProps = {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  style?: StyleProp<ViewStyle>;
};

export function SwitchPicker({ options, selectedIndex, onSelect, style }: SwitchPickerProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const optionWidth = options.length > 0 ? (trackWidth - PADDING * 2) / options.length : 0;
  // Four or more options get smaller labels so they don't feel cramped.
  const crowded = options.length >= 4;

  const pillPosition = useSharedValue(selectedIndex * optionWidth);
  const lastIndexRef = useRef(selectedIndex);

  useEffect(() => {
    if (!optionWidth) return;
    const target = selectedIndex * optionWidth;
    // Only a change of option slides; the first measurement snaps into place.
    if (lastIndexRef.current === selectedIndex) {
      pillPosition.set(target);
    } else {
      pillPosition.set(withSpring(target, { duration: 350 }));
    }
    lastIndexRef.current = selectedIndex;
  }, [selectedIndex, optionWidth, pillPosition]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillPosition.get() }],
  }));

  return (
    <View style={[styles.track, style]} onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}>
      {/* Hidden until the track is measured, so it never flashes at the wrong width. */}
      {optionWidth > 0 ? <Animated.View style={[styles.pill, { width: optionWidth }, pillStyle]} /> : null}
      {options.map((label, index) => (
        <AnimatedButton key={label} onPress={() => onSelect(index)} style={styles.option}>
          <Text
            style={[styles.label, crowded && styles.crowdedLabel, index === selectedIndex && styles.selectedLabel]}
            numberOfLines={1}>
            {label}
          </Text>
        </AnimatedButton>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 999,
    backgroundColor: '#f6f6f9',
  },
  pill: {
    position: 'absolute',
    top: PADDING,
    left: PADDING,
    height: 44 - PADDING * 2,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  option: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.3)',
  },
  crowdedLabel: {
    fontSize: 14,
  },
  selectedLabel: {
    color: '#000000',
  },
});
