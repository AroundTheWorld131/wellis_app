import { SymbolView } from 'expo-symbols';
import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { AnimatedButton } from '@/components/animated-button';
import { SettingsIcon, type SettingsIconName } from '@/components/icons/settings-icons';
import { BrandColor } from '@/constants/theme';

export const SettingsColors = {
  label: '#1c1c1e',
  muted: '#8e8e93',
  chevron: '#c7c7cc',
  divider: '#dcdce2',
  danger: '#e5484d',
};

// Space inside the card on each side, and from the icon to the label.
const ROW_PADDING = 18;
const ICON_SIZE = 23;
const ICON_GAP = 14;

// iOS settings style section: an optional grey title above a white rounded card, with rows
// split by hairlines that start under the labels, clear of the icons.
export function SettingsCard({ title, children }: { title?: string; children: ReactNode }) {
  const rows = Children.toArray(children);

  return (
    <View>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.card}>
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 ? <View style={styles.divider} /> : null}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

type SettingsRowProps = {
  label: string;
  /** Outline icon before the label. */
  icon?: SettingsIconName;
  /** Emoji in the icon's place, like a country flag. */
  emoji?: string;
  /** A check on the right in place of the chevron, for the picked option in a list. */
  checked?: boolean;
  /** Grey text on the right, like the saved goal or the email address. */
  value?: string;
  showChevron?: boolean;
  /** An on/off switch on the right in place of the chevron. Tapping the row flips it too. */
  toggle?: { value: boolean; onValueChange: (value: boolean) => void; disabled?: boolean };
  /** Red icon and label, for actions like logging out. */
  destructive?: boolean;
  onPress?: () => void;
};

// Icon and label on the left, grey value and a light chevron on the right.
export function SettingsRow({
  label,
  icon,
  emoji,
  checked,
  value,
  toggle,
  showChevron = checked === undefined && toggle === undefined,
  destructive = false,
  onPress,
}: SettingsRowProps) {
  const color = destructive ? SettingsColors.danger : SettingsColors.label;
  const handlePress =
    onPress ?? (toggle && !toggle.disabled ? () => toggle.onValueChange(!toggle.value) : undefined);

  return (
    // Fades on press like an iOS list row, rather than shrinking inside the card.
    <AnimatedButton onPress={handlePress} disableAnimation activeOpacity={0.6} style={styles.row}>
      {icon ? <SettingsIcon name={icon} size={ICON_SIZE} color={color} /> : null}
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.trailing}>
        {value ? (
          <Text style={styles.value} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {checked ? (
          <SymbolView
            name="checkmark"
            size={16}
            weight="bold"
            tintColor={BrandColor}
            fallback={<Text style={[styles.chevronFallback, { color: BrandColor }]}>✓</Text>}
          />
        ) : null}
        {toggle ? (
          <Switch
            value={toggle.value}
            onValueChange={toggle.onValueChange}
            disabled={toggle.disabled}
            trackColor={{ true: BrandColor }}
          />
        ) : null}
        {showChevron ? (
          <SymbolView
            name="chevron.right"
            size={14}
            weight="semibold"
            tintColor={SettingsColors.chevron}
            fallback={<Text style={styles.chevronFallback}>›</Text>}
          />
        ) : null}
      </View>
    </AnimatedButton>
  );
}

const styles = StyleSheet.create({
  // Lines up with the icons inside the card.
  sectionTitle: {
    marginLeft: ROW_PADDING,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
    color: SettingsColors.muted,
  },
  card: {
    overflow: 'hidden',
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: '#ffffff',
  },
  row: {
    minHeight: 54,
    paddingHorizontal: ROW_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ICON_GAP,
  },
  // Keeps its full width; a long value is what gets cut off.
  label: {
    flexShrink: 0,
    fontSize: 17,
    color: SettingsColors.label,
  },
  // Takes the rest of the row and pushes the value and chevron to the right.
  trailing: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  value: {
    flexShrink: 1,
    fontSize: 17,
    color: SettingsColors.muted,
  },
  // Same width as an icon so labels line up with the rows above and below.
  emoji: {
    width: ICON_SIZE,
    fontSize: 21,
    textAlign: 'center',
  },
  chevronFallback: {
    fontSize: 20,
    color: SettingsColors.chevron,
  },
  // Starts under the label and stops short of the right edge, like iOS lists.
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: ROW_PADDING + ICON_SIZE + ICON_GAP,
    marginRight: ROW_PADDING,
    backgroundColor: SettingsColors.divider,
  },
});
