import { Image } from 'expo-image';
import { ScrollView, StyleSheet } from 'react-native';

import {
  AccountCard,
  GoalsCard,
  OtherCard,
  PreferencesCard,
  SupportCard,
} from '@/components/profile/profile-cards';
import { TabScreen } from '@/components/tab-screen';

export default function ProfileScreen() {
  return (
    <TabScreen title="Profile">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Image
          source={require('@/assets/images/wellis-logo.svg')}
          style={styles.logo}
          contentFit="contain"
        />
        <GoalsCard />
        <PreferencesCard />
        <AccountCard />
        <SupportCard />
        <OtherCard />
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  // Same spacing between cards as Home.
  content: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 120,
    gap: 6,
  },
  // Source SVG is 109×37. Extra space under it so it doesn't crowd the first card.
  logo: {
    alignSelf: 'center',
    width: 109,
    height: 37,
    marginBottom: 24,
  },
});
