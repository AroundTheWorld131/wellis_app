import { Image, type ImageSource } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedButton } from '@/components/animated-button';

export const SettingsColors = {
  label: '#262626',
  muted: '#a3a3a3',
  divider: '#ececf1',
};

// White card with a grey section title and rows split by hairline dividers.
export function SettingsCard({ title, children }: { title: string; children: ReactNode }) {
  const rows = Children.toArray(children);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {rows.map((row, index) => (
        <Fragment key={index}>
          {index > 0 ? <View style={styles.divider} /> : null}
          {row}
        </Fragment>
      ))}
    </View>
  );
}

type SettingsRowProps = {
  label: string;
  /** Small icon before the label, like the Home cards' title icons. */
  icon?: ImageSource | number;
  value?: string;
  showChevron?: boolean;
  onPress?: () => void;
};

// Dark label on the left, grey value and a chevron on the right.
export function SettingsRow({ label, icon, value, showChevron = true, onPress }: SettingsRowProps) {
  return (
    <AnimatedButton onPress={onPress} scaleTo={0.98} style={styles.row}>
      <View style={styles.rowMain}>
        <View style={styles.rowLeading}>
          {icon ? <Image source={icon} style={styles.rowIcon} contentFit="contain" /> : null}
          <Text style={styles.rowLabel}>{label}</Text>
        </View>
        <View style={styles.rowTrailing}>
          {value ? (
            <Text style={styles.rowValue} numberOfLines={1}>
              {value}
            </Text>
          ) : null}
          {showChevron ? (
            <SymbolView
              name="chevron.right"
              size={13}
              weight="semibold"
              tintColor={SettingsColors.muted}
              fallback={<Text style={styles.rowValue}>›</Text>}
            />
          ) : null}
        </View>
      </View>
    </AnimatedButton>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 40,
    borderCurve: 'continuous',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: SettingsColors.muted,
    marginBottom: 4,
  },
  row: {
    paddingVertical: 18,
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowIcon: {
    width: 20,
    height: 20,
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: SettingsColors.label,
  },
  rowTrailing: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowValue: {
    flexShrink: 1,
    fontSize: 17,
    fontWeight: '500',
    color: SettingsColors.muted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: SettingsColors.divider,
  },
});
