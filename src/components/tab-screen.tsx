import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColorSoft } from '@/constants/theme';

type TabScreenProps = {
  /** Centered header title. Leave out for a header with only side content, like Home. */
  title?: string;
  /** Overrides the soft brand page color. */
  backgroundColor?: string;
  /** Shown at the left of the header, like Home's logo. */
  headerLeft?: ReactNode;
  /** Shown at the right of the header, like Home's streak. */
  headerRight?: ReactNode;
  children?: ReactNode;
};

// Soft brand-colored page with a big condensed title, shared by every tab.
export function TabScreen({ title, backgroundColor, headerLeft, headerRight, children }: TabScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }, backgroundColor ? { backgroundColor } : null]}>
      <View style={styles.header}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {/* Pinned to the sides so the centered title doesn't shift. */}
        {headerLeft ? <View style={styles.headerLeft}>{headerLeft}</View> : null}
        {headerRight ? <View style={styles.headerRight}>{headerRight}</View> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColorSoft,
  },
  // Keeps the same height with or without a title.
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
  title: {
    paddingHorizontal: 20,
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 32,
    color: '#262626',
    textAlign: 'center',
  },
});
