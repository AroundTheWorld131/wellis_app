import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

type FloatingMealProps = {
  source: ImageSource | number;
  kcal: number;
  size: number;
  style?: ViewStyle;
};

// A bowl photo (transparent PNG) with a tilted calorie pill tucked under it.
export function FloatingMeal({ source, kcal, size, style }: FloatingMealProps) {
  return (
    <View style={[styles.container, style]}>
      <Image source={source} style={{ width: size, height: size }} contentFit="contain" />
      <View style={styles.pill}>
        <Text style={styles.pillText} numberOfLines={1}>
          {kcal} <Text style={styles.pillUnit}>kcal</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
  },
  pill: {
    // Overlap the bottom of the bowl, like a sticker on the plate.
    marginTop: -24,
    marginLeft: 50,
    // Size to its text instead of the bowl's width, so it never wraps.
    flexShrink: 0,
    backgroundColor: '#f5f5f4',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    transform: [{ rotate: '-10deg' }],
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
  },
  pillText: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 18,
    color: '#2f7fd6',
  },
  pillUnit: {
    fontSize: 14,
  },
});
