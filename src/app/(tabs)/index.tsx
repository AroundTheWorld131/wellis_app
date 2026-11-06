import { Image } from 'expo-image';
import { ScrollView, StyleSheet } from 'react-native';

import { CaloriesCard, ShotCard, StepsCard, WaterCard, WeightCard } from '@/components/home/home-cards';
import { StreakBadge } from '@/components/home/streak-badge';
import { UpcomingCallCard } from '@/components/home/upcoming-call-card';
import { WeekStrip } from '@/components/home/week-strip';
import { TabScreen } from '@/components/tab-screen';
import { sampleStreakWeek } from '@/constants/sample-streak';

export default function HomeScreen() {
  return (
    <TabScreen
      backgroundColor="#f2f2f6"
      headerLeft={
        <Image
          source={require('@/assets/images/wellis-logo.svg')}
          style={styles.logo}
          contentFit="contain"
        />
      }
      headerRight={<StreakBadge days={sampleStreakWeek().streak} />}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <WeekStrip style={styles.weekStrip} />
        <UpcomingCallCard />
        <WeightCard />
        <ShotCard />
        <CaloriesCard />
        <WaterCard />
        <StepsCard />
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  // Source SVG is 109×37.
  logo: {
    width: 88,
    height: 30,
  },
  weekStrip: {
    // 40pt above the first card, with the gap below.
    marginBottom: 34,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 120,
    gap: 6,
  },
});
