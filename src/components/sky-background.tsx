import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

// The light grey page that the sky's bottom fades into, the same as the Home page.
export const SKY_PAGE_COLOR = '#f6f6f9';

// Soft mint sky with a butter-cream glow (the "Mint Dawn" design), baked at @3x for a
// 390x300pt screen.
const SKY = require('@/assets/images/header-sky.jpg');
export const SKY_ASPECT_RATIO = 390 / 300;
// Partway into the sky's fade, as a share of its height (240 of 300pt). Home starts its cards here.
export const SKY_FADE_START = 0.8;

// The sky for the top of a light grey page, behind the status bar and the header. Put it first
// inside the page's scroll view so it scrolls with the page. It stretches with the screen width,
// keeping its shape so the fade ends at the same spot, and never takes touches.
export function SkyBackground() {
  return (
    <View style={styles.container}>
      <View style={styles.sky}>
        {/* Flipped above the top edge, so pulling the page down shows more sky instead of a gap. */}
        <Image source={SKY} style={styles.mirror} contentFit="cover" />
        <Image source={SKY} style={StyleSheet.absoluteFill} contentFit="cover" priority="high" />
        {/* JPEG can't store the page grey exactly, so the sky's last few points blend into it. */}
        <View style={styles.blend} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    pointerEvents: 'none',
  },
  sky: {
    width: '100%',
    aspectRatio: SKY_ASPECT_RATIO,
  },
  mirror: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '-100%',
    height: '100%',
    transform: [{ scaleY: -1 }],
  },
  // The bottom 6% is already flat grey in the image.
  blend: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '6%',
    backgroundImage: `linear-gradient(to bottom, ${SKY_PAGE_COLOR}00, ${SKY_PAGE_COLOR})`,
  },
});
