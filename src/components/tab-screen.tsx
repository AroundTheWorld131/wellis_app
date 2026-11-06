import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StreakBadge } from '@/components/home/streak-badge';
import { sampleStreakWeek } from '@/constants/sample-streak';

// Light grey page behind the white cards.
const PAGE_COLOR = '#f2f2f6';

type TabScreenProps = {
  /** Overrides the light grey page color. */
  backgroundColor?: string;
  /** Shown at the left of the header. Defaults to the Wellis logo. */
  headerLeft?: ReactNode;
  /** Shown at the right of the header. Defaults to the streak badge. */
  headerRight?: ReactNode;
  children?: ReactNode;
};

// Light grey page with the logo and streak in the header, shared by every tab.
export function TabScreen({
  backgroundColor,
  headerLeft = <HeaderLogo />,
  headerRight = <StreakBadge days={sampleStreakWeek().streak} />,
  children,
}: TabScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }, backgroundColor ? { backgroundColor } : null]}>
      <View style={styles.header}>
        {headerLeft ? <View style={styles.headerLeft}>{headerLeft}</View> : null}
        {headerRight ? <View style={styles.headerRight}>{headerRight}</View> : null}
      </View>
      {children}
    </View>
  );
}

function HeaderLogo() {
  return (
    <Image source={require('@/assets/images/wellis-logo.svg')} style={styles.logo} contentFit="contain" />
  );
}

const styles = StyleSheet.create({
  // Source SVG is 109×37.
  logo: {
    width: 76,
    height: 26,
  },
  container: {
    flex: 1,
    backgroundColor: PAGE_COLOR,
  },
  // Fixed height, since both sides are positioned absolutely.
  header: {
    minHeight: 44,
    justifyContent: 'center',
  },
  headerLeft: {
    position: 'absolute',
    left: 20,
  },
  headerRight: {
    position: 'absolute',
    right: 16,
  },
});
