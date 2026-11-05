import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';

type TabScreenProps = {
  title: string;
  children?: ReactNode;
};

// Grey page with a big condensed title in the top-left, shared by every tab.
export function TabScreen({ title, children }: TabScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.two }]}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f6',
  },
  title: {
    paddingHorizontal: 20,
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 34,
    color: '#262626',
  },
});
