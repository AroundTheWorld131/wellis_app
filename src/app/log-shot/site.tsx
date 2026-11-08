import { ChoiceScreen, useShotDraft } from '@/components/shot-form';
import { INJECTION_SITES } from '@/constants/shots';

// Pushed from the Injection site row.
export default function ShotSiteScreen() {
  const { draft, update } = useShotDraft();

  return (
    <ChoiceScreen
      title="Injection site"
      options={INJECTION_SITES.map((site) => ({ label: site, value: site }))}
      selected={draft.site}
      onSelect={(site) => update({ site })}
    />
  );
}
