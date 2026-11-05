import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CaloriesCard, ShotCard, WaterCard, WeightCard } from '@/components/home/home-cards';
import { TabScreen } from '@/components/tab-screen';

export default function HomeScreen() {
  return (
    <TabScreen title="Home">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>Welcome back, Mark</Text>
          <Text style={styles.greetingSubtitle}>Upcoming intake call</Text>
        </View>
        <WeightCard />
        <ShotCard />
        <CaloriesCard />
        <WaterCard />
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 120,
    gap: 6,
  },
  // Lines up with the cards' inner padding, with extra room before the first card.
  greeting: {
    paddingHorizontal: 4,
    marginBottom: 10,
    gap: 2,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#262626',
  },
  greetingSubtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#a3a3a3',
  },
});
