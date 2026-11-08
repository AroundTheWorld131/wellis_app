import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { ChatListCard, FaqLinkCard, SupportLinkCard } from '@/components/chat/chat-list-card';
import { SkyScreen } from '@/components/sky-screen';

export default function ChatScreen() {
  return (
    // On the Home page's sky, with no header.
    <SkyScreen contentStyle={styles.content}>
        {/* Illustration card with the title and subtitle over a dark fade at the bottom. */}
        <View style={styles.section}>
          <Image
            source={require('@/assets/images/care-team.jpg')}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
          <LinearGradient
            colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.6)']}
            locations={[0, 1]}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.sectionTitle}>Personal care team</Text>
          <Text style={styles.sectionSubtitle}>
            Questions about your treatment, side effects or progress? We’re here to help.
          </Text>
        </View>
        <View style={styles.cards}>
          <ChatListCard chatId="care" />
          <View style={styles.divider} />
          <SupportLinkCard />
          <View style={styles.divider} />
          <FaqLinkCard />
        </View>
    </SkyScreen>
  );
}

const styles = StyleSheet.create({
  // Hairline between the chats, starting under the text so it clears the avatars.
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 63,
    marginRight: 8,
    backgroundColor: '#dcdce2',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  // Photo card, text pinned to the bottom over the gradient.
  section: {
    height: 190,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    backgroundColor: '#e8e2d6',
    borderRadius: 28,
    borderCurve: 'continuous',
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  // Chats sit below the card on the screen background.
  cards: {
    marginTop: 16,
    gap: 6,
  },
  sectionTitle: {
    paddingHorizontal: 8,
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 26,
    color: '#ffffff',
  },
  // Tucked under the title.
  sectionSubtitle: {
    paddingHorizontal: 8,
    marginTop: 1,
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 1)',
  },
});
