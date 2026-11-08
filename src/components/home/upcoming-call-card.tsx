import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { BrandColor, BrandColorLight } from '@/constants/theme';


const PHOTO_SIZE = 40;

// Compact card in the brand color for the next scheduled call, with a photo on the left.
// TODO: show the real booking.
export function UpcomingCallCard() {
  return (
    <View style={styles.card}>
      {/* <Image
        source={require('@/assets/images/upcoming-call.jpg')}
        style={styles.photo}
        contentFit="cover"
      /> */}
      <View style={styles.text}>
        {/* The doctor's photo in a circle, centered beside the title and subtitle. */}
        <View style={styles.titleRow}>
          <Image
            source={require('@/assets/images/doctor-diego.jpg')}
            style={styles.doctorPhoto}
            contentFit="cover"
          />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Upcoming intake call</Text>
            <Text style={styles.subtitle}>Tomorrow’s call is a chance to review{'\n'}your progress with your doctor</Text>
          </View>
        </View>
        {/* The date on the left, the chevron level with it on the right. */}
        <View style={styles.dateRow}>
          <View style={{backgroundColor:"rgba(255,255,255,0.9)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8}}>
            <Text style={{color:BrandColor, fontSize: 13, fontWeight: "600"}}>9 November at 10:00</Text>
          </View>
          <SymbolView
            name="chevron.right"
            size={14}
            weight="semibold"
            tintColor="rgba(255, 255, 255, 0.6)"
            fallback={<Text style={styles.chevronFallback}>›</Text>}
          />
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Same corners as the other Home cards, but shorter.
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: BrandColorLight,
    borderRadius: 32,
    borderCurve: 'continuous',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  titleContainer: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chevronFallback: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  // Drs. Diego Keijzer, from getwellis.com.
  doctorPhoto: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  title: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 24,
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
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
