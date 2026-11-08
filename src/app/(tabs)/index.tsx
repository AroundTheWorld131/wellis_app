import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LastInjectionCard } from '@/components/home/last-injection-card';
import { StepsCard } from '@/components/home/steps-card';
import { UpcomingCallCard } from '@/components/home/upcoming-call-card';
import { WaterCard } from '@/components/home/water-card';
import { WeightGoalCard } from '@/components/home/weight-goal-card';
import { WeightJourneyCard } from '@/components/home/weight-journey-card';
import { SKY_ASPECT_RATIO, SKY_FADE_START, SKY_PAGE_COLOR, SkyBackground } from '@/components/sky-background';

const CARD_GAP = 8;
// The logo row's height: 15 above, the 32pt logo, 12 below.
const HEADER_HEIGHT = 59;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  // The first card starts partway into the sky's fade (20 above that spot), so most of the sky shows above it.
  const cardsTop = (width / SKY_ASPECT_RATIO) * SKY_FADE_START - 20;
  const cardsPadding = Math.max(20, cardsTop - insets.top - HEADER_HEIGHT);

  return (
    <View style={styles.screen}>
      {/* The sky, the logo and the cards all scroll together, starting under the status bar. */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingTop: insets.top }}
        showsVerticalScrollIndicator={false}>
        <SkyBackground />
        <View style={styles.header}>
          <Image source={require('@/assets/images/wellis-logo.svg')} style={styles.logo} contentFit="contain" />
        </View>
        <View style={[styles.content, { paddingTop: cardsPadding }]}>
          <UpcomingCallCard />
          <WeightJourneyCard />
          <WeightGoalCard />
          <LastInjectionCard />
          <Text style={styles.sectionTitle}>Today</Text>
          <StepsCard />
          <WaterCard />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Light grey page under the sky and the cards.
  screen: {
    flex: 1,
    backgroundColor: SKY_PAGE_COLOR,
  },
  body: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    paddingTop: 15,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Source SVG is 109×37.
  logo: {
    width: 94,
    height: 32,
  },
  content: {
    paddingHorizontal: 22,
    // Room so the last cards can scroll clear of the floating tab bar.
    paddingBottom: 120,
    gap: CARD_GAP,
  },
  // Left-aligned heading over the Steps and Water cards, set apart from the cards above.
  sectionTitle: {
    marginTop: 16,
    marginBottom: 2,
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
  },
});
