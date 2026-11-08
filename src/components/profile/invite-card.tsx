import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedButton } from '@/components/animated-button';

const CARD_COLOR = '#1db6ff';
const FRIEND_SIZE = 38;
// Width kept clear on the right for the friend photos, so the text wraps before reaching them.
const FRIENDS_WIDTH = 104;

// Four friend photos in circles on the right, in two staggered columns: two stacked on the
// left, two on the right running off the card's top and bottom edges.
const FRIENDS = [
  { image: require('@/assets/images/invite/friend-3.jpg'), position: { right: 62, top: -8 } },
  { image: require('@/assets/images/invite/friend-4.jpg'), position: { right: 62, bottom: -8 } },
  { image: require('@/assets/images/invite/friend-2.jpg'), position: { right: 16, top: -10 } },
  { image: require('@/assets/images/invite/friend-1.jpg'), position: { right: 16, bottom: -10 } },
];

// Bright blue card under the profile name inviting the user to refer friends: a bold white
// title with an arrow and a softer line under it, with friends' photos on the right.
// TODO: open the referral flow once it exists.
export function InviteCard({ onPress }: { onPress?: () => void }) {
  return (
    <AnimatedButton onPress={onPress} scaleTo={0.97} style={styles.card}>
      {FRIENDS.map((friend, index) => (
        <Image
          key={index}
          source={friend.image}
          style={[styles.friend, friend.position]}
          contentFit="cover"
          // The portrait photos have faces in their upper half.
          contentPosition="top"
          transition={150}
        />
      ))}
      <View style={styles.text}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Invite your friends</Text>
          <SymbolView
            name="arrow.right"
            size={15}
            weight="semibold"
            tintColor="#ffffff"
            fallback={<Text style={styles.title}>→</Text>}
          />
        </View>
        <Text style={styles.subtitle}>Earn rewards by referring friends</Text>
      </View>
    </AnimatedButton>
  );
}

const styles = StyleSheet.create({
  // Clips the photos that run off the top and bottom edges.
  card: {
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    overflow: 'hidden',
    borderRadius: 26,
    borderCurve: 'continuous',
    backgroundColor: CARD_COLOR,
  },
  friend: {
    position: 'absolute',
    width: FRIEND_SIZE,
    height: FRIEND_SIZE,
    borderRadius: FRIEND_SIZE / 2,
  },
  text: {
    marginRight: FRIENDS_WIDTH - 20,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.78)',
  },
});
