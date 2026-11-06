import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, View } from 'react-native';

type ChatAvatarProps = {
  source: ImageSource | number;
  size?: number;
};

// A photo or icon, cropped to a circle.
export function ChatAvatar({ source, size = 48 }: ChatAvatarProps) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Image source={source} style={styles.image} contentFit="cover" contentPosition="top" />
    </View>
  );
}

const styles = StyleSheet.create({
  // Light grey outline so photos with white backgrounds don't blend into white cards.
  circle: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    backgroundColor: '#f2f2f6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
