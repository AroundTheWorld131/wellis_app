import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { BrandColor } from '@/constants/theme';

const PHOTO_SIZE = 48;

// Compact card in the brand color for the next scheduled call, with a photo on the left.
// TODO: show the real booking.
export function UpcomingCallCard() {
  return (
    <View style={styles.card}>
      <Image
        source={require('@/assets/images/upcoming-call.jpg')}
        style={styles.photo}
        contentFit="cover"
      />
      <View style={styles.text}>
        <Text style={styles.title}>Upcoming intake call</Text>
        <Text style={styles.subtitle}>Mon, Nov 9 at 10:00</Text>
      </View>
      <SymbolView
        name="chevron.right"
        size={16}
        weight="semibold"
        tintColor="rgba(255, 255, 255, 0.7)"
        fallback={<Text style={styles.subtitle}>›</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Same corners as the other Home cards, but shorter.
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: BrandColor,
    borderRadius: 32,
    borderCurve: 'continuous',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 24,
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 14,
    borderCurve: 'continuous',
  },
});
