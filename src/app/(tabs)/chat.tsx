import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChatListCard, SupportLinkCard } from '@/components/chat/chat-list-card';
import { TabScreen } from '@/components/tab-screen';

export default function ChatScreen() {
  return (
    <TabScreen>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Your care team</Text>
          <Text style={styles.sectionSubtitle}>
            Questions about your treatment, side effects or progress? We’re here to help.
          </Text>
          <ChatListCard chatId="care" />
        </View>

        <View>
          <Text style={styles.sectionTitle}>Support</Text>
          <Text style={styles.sectionSubtitle}>
            Help with payments, your plan and medication deliveries.
          </Text>
          <SupportLinkCard />
        </View>
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  // Hairline above the first section that scrolls with it, lined up with the cards' edges.
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 24,
    backgroundColor: '#dcdce2',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 120,
    gap: 44,
  },
  sectionTitle: {
    paddingHorizontal: 8,
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 26,
    color: '#262626',
  },
  // Tucked under the title, with more room before the card.
  sectionSubtitle: {
    paddingHorizontal: 8,
    marginTop: 1,
    marginBottom: 12,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21,
    color: '#a3a3a3',
  },
});
