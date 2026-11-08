import { Button, HStack, Host, Image, Menu, Text as SwiftText } from '@expo/ui/swift-ui';
import { buttonStyle, font, foregroundStyle, menuIndicator, menuStyle } from '@expo/ui/swift-ui/modifiers';
import { useQuery } from 'convex/react';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Children, createContext, Fragment, use, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AnimatedButton } from '@/components/animated-button';
import { PushedScreenHeader } from '@/components/log-day';
import { BrandColor } from '@/constants/theme';
import { DEFAULT_MEDICATION, dosesFor, isMedication, nextSite, type Medication } from '@/constants/shots';
import { api } from '../../convex/_generated/api';

// The Add Shot sheet and the screens it pushes (medication, dose, site, notes) share one
// draft. They're separate routes in the sheet's stack, so the draft lives in context.

export type ShotDraft = {
  /** Always one of the two; starts as the last shot's, or Mounjaro. */
  medication: Medication;
  doseMg: number | null;
  site: string | null;
  note: string;
  /** Time of day the shot was given; the day comes from the date screen. */
  time: Date;
};

type ShotDraftValue = { draft: ShotDraft; update: (changes: Partial<ShotDraft>) => void };

const ShotDraftContext = createContext<ShotDraftValue | null>(null);

export function useShotDraft() {
  const value = use(ShotDraftContext);
  if (value === null) throw new Error('useShotDraft must be used inside a ShotDraftProvider.');
  return value;
}

/**
 * Holds the shot being added. Starts from the last shot's medication and dose, with the
 * next injection site in the rotation, since most people repeat the same shot weekly.
 */
export function ShotDraftProvider({ children }: { children: ReactNode }) {
  // Only what the user changed; everything else falls back to the defaults below. Deriving
  // the defaults while rendering means the last shot can load after the sheet opens.
  const [picks, setPicks] = useState<Partial<ShotDraft>>({});
  const [openedAt] = useState(() => new Date());
  const update = (changes: Partial<ShotDraft>) => setPicks((current) => ({ ...current, ...changes }));

  const last = useQuery(api.shots.recent, { limit: 1 })?.[0];
  const lastMedication = last && isMedication(last.medication) ? last.medication : null;
  const medication = picks.medication ?? lastMedication ?? DEFAULT_MEDICATION;
  // The last dose carries over only while the medication is still the last one's.
  const lastDose = last && medication === lastMedication && dosesFor(medication).includes(last.doseMg) ? last.doseMg : null;
  const draft: ShotDraft = {
    medication,
    doseMg: 'doseMg' in picks ? (picks.doseMg ?? null) : lastDose,
    site: 'site' in picks ? (picks.site ?? null) : last ? nextSite(last.site) : null,
    note: picks.note ?? '',
    time: picks.time ?? openedAt,
  };

  return <ShotDraftContext value={{ draft, update }}>{children}</ShotDraftContext>;
}

/** A grey card of rows with a small grey title above, split by hairlines. */
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  const rows = Children.toArray(children);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
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

type FormRowProps = {
  label: string;
  /** Grey text on the right; `placeholder` shows instead when it's missing. */
  value?: string | null;
  placeholder?: string;
  /** Replaces the value and chevron, like the native time picker. */
  trailing?: ReactNode;
  onPress?: () => void;
};

/** Label on the left, value and chevron on the right. Pushes a screen when pressed. */
export function FormRow({ label, value, placeholder, trailing, onPress }: FormRowProps) {
  const content = (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {trailing ?? (
        <View style={styles.rowTrailing}>
          <Text style={[styles.rowValue, !value && styles.rowPlaceholder]} numberOfLines={1}>
            {value || placeholder}
          </Text>
          <SymbolView
            name="chevron.right"
            size={13}
            weight="semibold"
            tintColor="#a3a3a3"
            fallback={<Text style={styles.rowValue}>›</Text>}
          />
        </View>
      )}
    </View>
  );
  if (!onPress) return content;
  return (
    <AnimatedButton onPress={onPress} disableAnimation>
      {content}
    </AnimatedButton>
  );
}

type MenuRowProps<T extends string | number> = {
  label: string;
  options: { label: string; value: T }[];
  selected: T | null;
  onSelect: (value: T) => void;
  /** Shown in grey until something is picked. */
  placeholder: string;
};

// A form row whose value opens a native dropdown menu in place, with a check on the picked
// option, instead of pushing a choice screen.
export function MenuRow<T extends string | number>({ label, options, selected, onSelect, placeholder }: MenuRowProps<T>) {
  const current = options.find((option) => option.value === selected);

  return (
    <FormRow
      label={label}
      trailing={
        <Host matchContents>
          <Menu
            label={
              <HStack spacing={6}>
                <SwiftText
                  modifiers={[
                    font({ size: 17 }),
                    foregroundStyle(current ? '#8e8e93' : '#a3a3a3'),
                  ]}>
                  {current?.label ?? placeholder}
                </SwiftText>
                <Image systemName="chevron.up.chevron.down" size={13} color="#a3a3a3" />
              </HStack>
            }
            modifiers={[menuStyle('button'), buttonStyle('plain'), menuIndicator('hidden')]}>
            {options.map((option) => (
              <Button
                key={String(option.value)}
                label={option.label}
                systemImage={option.value === selected ? 'checkmark' : undefined}
                onPress={() => onSelect(option.value)}
              />
            ))}
          </Menu>
        </Host>
      }
    />
  );
}

type ChoiceScreenProps<T> = {
  title: string;
  options: { label: string; value: T }[];
  selected: T | null;
  onSelect: (value: T) => void;
  /** Shown when there are no options, like doses before a medication is picked. */
  emptyText?: string;
};

/** A pushed screen listing options with a check on the current one. Picking slides back. */
export function ChoiceScreen<T>({ title, options, selected, onSelect, emptyText }: ChoiceScreenProps<T>) {
  return (
    <View style={styles.screen}>
      <PushedScreenHeader title={title} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {options.length === 0 ? (
          <Text style={styles.empty}>{emptyText}</Text>
        ) : (
          <View style={styles.card}>
            {options.map((option, index) => (
              <Fragment key={option.label}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <AnimatedButton
                  disableAnimation
                  onPress={() => {
                    onSelect(option.value);
                    router.back();
                  }}>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>{option.label}</Text>
                    {option.value === selected ? (
                      <SymbolView
                        name="checkmark"
                        size={16}
                        weight="bold"
                        tintColor={BrandColor}
                        fallback={<Text style={[styles.rowValue, { color: BrandColor }]}>✓</Text>}
                      />
                    ) : null}
                  </View>
                </AnimatedButton>
              </Fragment>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/** The pushed notes screen: a free-text field saved into the draft as you type. */
export function ShotNotesScreen() {
  const { draft, update } = useShotDraft();

  return (
    <View style={styles.screen}>
      <PushedScreenHeader title="Notes" />
      <View style={[styles.card, styles.notesCard]}>
        <TextInput
          autoFocus
          multiline
          value={draft.note}
          onChangeText={(note) => update({ note })}
          placeholder="How did it go? Any side effects?"
          placeholderTextColor="#a3a3a3"
          maxLength={1000}
          style={styles.notesInput}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    gap: 8,
  },
  // Same as the Profile section titles, lined up with the labels inside the card.
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8e8e93',
    paddingHorizontal: 20,
  },
  // White on the grey sheet, like the Profile cards.
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    borderCurve: 'continuous',
    paddingHorizontal: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e2e2e8',
  },
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  // Same as the Profile rows' labels.
  rowLabel: {
    fontSize: 17,
    color: '#1c1c1e',
  },
  rowTrailing: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  // Same as the Profile rows' values.
  rowValue: {
    flexShrink: 1,
    fontSize: 17,
    color: '#8e8e93',
  },
  rowPlaceholder: {
    color: '#a3a3a3',
  },
  empty: {
    marginTop: 20,
    fontSize: 17,
    fontWeight: '600',
    color: '#a3a3a3',
    textAlign: 'center',
  },
  notesCard: {
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
  },
  notesInput: {
    minHeight: 160,
    fontSize: 17,
    color: '#262626',
    textAlignVertical: 'top',
  },
});
