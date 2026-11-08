import { DatePicker, Host } from '@expo/ui/swift-ui';
import { datePickerStyle, tint } from '@expo/ui/swift-ui/modifiers';
import { useMutation } from 'convex/react';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedButton } from '@/components/animated-button';
import { dayToDate, formatLogDay, useLogDay } from '@/components/log-day';
import { PillButton } from '@/components/pill-button';
import { FormRow, FormSection, MenuRow, useShotDraft } from '@/components/shot-form';
import { dosesFor, formatDose, INJECTION_SITES, MEDICATION_NAMES } from '@/constants/shots';
import { BrandColor } from '@/constants/theme';
import { api } from '../../../convex/_generated/api';

// Sheet for logging a shot: when, which medication and strength, where, and a note.
// Each row pushes its own screen inside the sheet; Save writes the shot to Convex.
export default function LogShotScreen() {
  const { day } = useLogDay();
  const insets = useSafeAreaInsets();
  const { draft, update } = useShotDraft();
  const logShot = useMutation(api.shots.log);
  const [saving, setSaving] = useState(false);
  const { medication, doseMg, site } = draft;
  const canSave = doseMg !== null && site !== null && !saving;

  const handleSave = async () => {
    if (doseMg === null || site === null) return;
    // The picked day at the picked time of day.
    const takenAt = dayToDate(day);
    takenAt.setHours(draft.time.getHours(), draft.time.getMinutes(), 0, 0);
    if (takenAt.getTime() > Date.now()) {
      Alert.alert("That time hasn't happened yet", 'Pick an earlier time for today.');
      return;
    }

    setSaving(true);
    try {
      await logShot({ takenAt: takenAt.getTime(), day, medication, doseMg, site, note: draft.note });
      router.back();
    } catch (error) {
      setSaving(false);
      Alert.alert("Couldn't save", error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AnimatedButton onPress={() => router.back()} scaleTo={0.95} style={styles.closeButton}>
          <SymbolView
            name="xmark"
            size={18}
            weight="medium"
            tintColor="#000"
            fallback={<Text style={styles.closeFallback}>×</Text>}
          />
        </AnimatedButton>
        {/* Absolutely centered so the X on the left doesn't push it off center. */}
        <Text style={styles.headerTitle} numberOfLines={1} pointerEvents="none">
          Add shot
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormSection title="When">
          <FormRow label="Date" value={formatLogDay(day)} onPress={() => router.push('/log-shot/date')} />
          <FormRow
            label="Time"
            trailing={
              <Host matchContents>
                <DatePicker
                  selection={draft.time}
                  displayedComponents={['hourAndMinute']}
                  onDateChange={(time) => update({ time })}
                  modifiers={[datePickerStyle('compact'), tint(BrandColor)]}
                />
              </Host>
            }
          />
        </FormSection>

        <FormSection title="Details">
          <MenuRow
            label="Medication"
            options={MEDICATION_NAMES.map((name) => ({ label: name, value: name }))}
            selected={medication}
            onSelect={(next) =>
              // Switching keeps the dose only if the other medication comes in it.
              update({ medication: next, doseMg: doseMg !== null && dosesFor(next).includes(doseMg) ? doseMg : null })
            }
            placeholder="Choose"
          />
          <MenuRow
            label="Strength"
            options={dosesFor(medication).map((dose) => ({ label: formatDose(dose), value: dose }))}
            selected={doseMg}
            onSelect={(dose) => update({ doseMg: dose })}
            placeholder="Choose"
          />
          <MenuRow
            label="Injection site"
            options={INJECTION_SITES.map((option) => ({ label: option, value: option }))}
            selected={site}
            onSelect={(option) => update({ site: option })}
            placeholder="Choose"
          />
        </FormSection>

        <FormSection title="Notes">
          <FormRow
            label="Notes"
            // The first line, so a long note doesn't stretch the row.
            value={draft.note.trim().split('\n')[0]}
            placeholder="Add notes"
            onPress={() => router.push('/log-shot/notes')}
          />
        </FormSection>
      </ScrollView>

      {/* Pinned to the bottom, same pill as the other log sheets' Save button. */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <PillButton label="Save" onPress={handleSave} disabled={!canSave} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Profile's light grey, so the white cards stand out like they do there.
  container: {
    flex: 1,
    backgroundColor: '#f6f6f9',
  },
  // Same close button as the other log sheets, with the title centered.
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    position: 'absolute',
    left: 80,
    right: 80,
    bottom: 11,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#262626',
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  closeFallback: {
    fontSize: 26,
    lineHeight: 28,
    color: '#000',
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 40,
    gap: 28,
  },
});
