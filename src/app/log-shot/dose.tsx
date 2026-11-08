import { ChoiceScreen, useShotDraft } from '@/components/shot-form';
import { dosesFor, formatDose } from '@/constants/shots';

// Pushed from the Strength row: the picked medication's dose steps.
export default function ShotDoseScreen() {
  const { draft, update } = useShotDraft();

  return (
    <ChoiceScreen
      title="Strength"
      options={dosesFor(draft.medication).map((doseMg) => ({ label: formatDose(doseMg), value: doseMg }))}
      selected={draft.doseMg}
      onSelect={(doseMg) => update({ doseMg })}
      emptyText="Pick a medication first."
    />
  );
}
