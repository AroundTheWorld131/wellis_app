import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AccountCard,
  BodyCard,
  ConnectionsCard,
  GoalsCard,
  LegalCard,
  LogOutCard,
  SubscriptionCard,
  SupportCard,
} from '@/components/profile/profile-cards';
import { InviteCard } from '@/components/profile/invite-card';
import { ProfileHeader } from '@/components/profile/profile-header';

// The last tab, without the shared tab header: the grey page runs up behind the status bar
// and the photo and name lead the screen. The profile photo in the other tabs' headers also
// opens it.
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + TOP_SPACE }]}
      showsVerticalScrollIndicator={false}>
      <ProfileHeader name="Lissa Delft" />
      <InviteCard />
      <BodyCard />
      <GoalsCard />
      <ConnectionsCard />
      <AccountCard />
      <SubscriptionCard />
      <SupportCard />
      <LegalCard />
      <LogOutCard />
    </ScrollView>
  );
}

// Space between the status bar and the photo.
const TOP_SPACE = 70;

const styles = StyleSheet.create({
  // Light grey page under the white cards, like Home.
  scroll: {
    flex: 1,
    backgroundColor: '#f6f6f9',
  },
  content: {
    paddingHorizontal: 16,
    // Room so Log out can scroll clear of the floating tab bar.
    paddingBottom: 120,
    gap: 30,
  },
});
