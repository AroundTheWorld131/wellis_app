import { DatePicker, Host } from '@expo/ui/swift-ui';
import { datePickerStyle, tint } from '@expo/ui/swift-ui/modifiers';
import { useMutation } from 'convex/react';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AnimatedButton } from '@/components/animated-button';
import { dayToDate, formatLogDay, useLogDay } from '@/components/log-day';
import { FormRow, FormSection, useShotDraft } from '@/components/shot-form';
import { SwitchPicker } from '@/components/switch-picker';
import { dosesFor, formatDose, MEDICATION_NAMES } from '@/constants/shots';
import { BrandColor } from '@/constants/theme';
import { api } from '../../../convex/_generated/api';

// Sheet for logging a shot: when, which medication and strength, where, and a note.
// Each row pushes its own screen inside the sheet; Save writes the shot to Convex.
export default function LogShotScreen() {
  const { day } = useLogDay();
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
        <Text style={styles.headerTitle}>Add shot</Text>
        <AnimatedButton
          onPress={handleSave}
          disabled={!canSave}
          scaleTo={0.95}
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}>
          <Text style={styles.saveText}>Save</Text>
        </AnimatedButton>
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
          <FormRow
            label="Medication"
            trailing={
              <SwitchPicker
                options={MEDICATION_NAMES}
                selectedIndex={MEDICATION_NAMES.indexOf(medication)}
                onSelect={(index) => {
                  const next = MEDICATION_NAMES[index];
                  // Switching keeps the dose only if the other medication comes in it.
                  update({ medication: next, doseMg: doseMg !== null && dosesFor(next).includes(doseMg) ? doseMg : null });
                }}
                style={styles.medicationSwitch}
              />
            }
          />
          <FormRow
            label="Strength"
            value={doseMg === null ? null : formatDose(doseMg)}
            placeholder="Choose"
            onPress={() => router.push('/log-shot/dose')}
          />
          <FormRow
            label="Injection site"
            value={site}
            placeholder="Choose"
            onPress={() => router.push('/log-shot/site')}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  // Same close and Save buttons as the other log sheets, with a title between them.
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
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
    backgroundColor: '#f6f6f9',
  },
  closeFallback: {
    fontSize: 26,
    lineHeight: 28,
    color: '#000',
  },
  saveButton: {
    height: 42,
    paddingHorizontal: 20,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BrandColor,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Darker than the switch's usual track, so it shows on the grey card.
  medicationSwitch: {
    width: 210,
    backgroundColor: '#e9e9ee',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 40,
    gap: 28,
  },
});
