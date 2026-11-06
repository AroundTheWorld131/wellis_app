import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

// Flame with the number of days in a row the user has kept up with their plan.
export function StreakBadge({ days }: { days: number }) {
  return (
    <View style={styles.badge} accessibilityLabel={`${days} day streak`}>
      <Image
        source={require('@/assets/images/cardIcons/streak.png')}
        style={styles.flame}
        contentFit="contain"
      />
      <Text style={styles.count}>{days}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#ffffff',
  },
  flame: {
    width: 20,
    height: 20,
  },
  count: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 20,
    color: '#262626',
  },
});
