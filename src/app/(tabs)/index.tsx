import { ScrollView, StyleSheet } from 'react-native';

import { CaloriesCard, ShotCard, StepsCard, WaterCard, WeightCard } from '@/components/home/home-cards';
import { UpcomingCallCard } from '@/components/home/upcoming-call-card';
import { WeekStrip } from '@/components/home/week-strip';
import { TabScreen } from '@/components/tab-screen';

export default function HomeScreen() {
  return (
    <TabScreen>
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
