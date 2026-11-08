import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, View } from 'react-native';

type ChatAvatarProps = {
  source: ImageSource | number;
  size?: number;
  /** Space between the circle's edge and the image, for logos that shouldn't touch the rim. */
  inset?: number;
  /** Fills the inset ring; match it to the image's own background so the inset doesn't show. */
  background?: string;
};

// A photo or icon, cropped to a circle.
export function ChatAvatar({ source, size = 48, inset = 0, background }: ChatAvatarProps) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, padding: inset },
        background ? { backgroundColor: background } : null,
      ]}>
      <Image
        source={source}
        style={styles.image}
        contentFit={inset ? 'contain' : 'cover'}
        contentPosition={inset ? 'center' : 'top'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Light grey outline so photos with white backgrounds don't blend into white cards.
  circle: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e5ea',
    backgroundColor: '#f2f2f6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
