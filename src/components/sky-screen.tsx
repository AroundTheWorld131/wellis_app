import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SKY_ASPECT_RATIO, SKY_FADE_START, SKY_PAGE_COLOR, SkyBackground } from '@/components/sky-background';

type SkyScreenProps = {
  /** Padding and gaps for the screen's content, which starts where the sky fades. */
  contentStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
  /** The page under the sky. Defaults to the light grey Home uses. */
  pageColor?: string;
};

// The logo row's height, like Home's: 15 above, the 32pt logo, 12 below.
const HEADER_HEIGHT = 59;

// A tab page like Home: the sky over the light grey page and the Wellis logo at the top, both
// scrolling with the content, which starts where Home's cards do, partway into the sky's fade.
export function SkyScreen({ contentStyle, children, pageColor = SKY_PAGE_COLOR }: SkyScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  // 20 above Home's first-card spot, but never closer than 20 under the logo.
  const contentPadding = Math.max(20, (width / SKY_ASPECT_RATIO) * SKY_FADE_START - insets.top - HEADER_HEIGHT - 20);

  return (
    <View style={[styles.screen, { backgroundColor: pageColor }]}>
      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}>
        <SkyBackground pageColor={pageColor} />
        <View style={{ height: insets.top }} />
        <View style={styles.header}>
          <Image source={require('@/assets/images/wellis-logo.svg')} style={styles.logo} contentFit="contain" />
        </View>
        {/* Its own view, so the content's gaps don't land between the logo rows above. */}
        <View style={[{ paddingTop: contentPadding }, contentStyle]}>{children}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Same light grey page as Home, under the sky.
  screen: {
    flex: 1,
    backgroundColor: SKY_PAGE_COLOR,
  },
  body: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    paddingTop: 15,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Source SVG is 109×37.
  logo: {
    width: 94,
    height: 32,
  },
});
