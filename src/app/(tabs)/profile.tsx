import { ScrollView, StyleSheet } from 'react-native';

import {
  AccountCard,
  GoalsCard,
  OtherCard,
  PreferencesCard,
  SupportCard,
} from '@/components/profile/profile-cards';
import { ProfileHeader } from '@/components/profile/profile-header';
import { TabScreen } from '@/components/tab-screen';

export default function ProfileScreen() {
  return (
    <TabScreen>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <ProfileHeader name="Mark" />
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
    paddingTop: 60,
    paddingBottom: 120,
    gap: 6,
  },
});
