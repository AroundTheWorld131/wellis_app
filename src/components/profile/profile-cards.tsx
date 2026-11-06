import { SettingsCard, SettingsRow } from '@/components/profile/settings-card';

// UI only: values are placeholders, and the goals match the Home cards.
// TODO: open an editor or screen for each row.

export function GoalsCard() {
  return (
    <SettingsCard title="Goals">
      <SettingsRow label="Weight" icon={require('@/assets/images/cardIcons/weight.png')} value="60 kg" />
      <SettingsRow
        label="Calories"
        icon={require('@/assets/images/cardIcons/calories.png')}
        value="2,036 kcal"
      />
      {/* No macros icon yet, so it shares the calories one. */}
      <SettingsRow
        label="Macros"
        icon={require('@/assets/images/cardIcons/calories.png')}
        value="492–84–150 g"
      />
      <SettingsRow label="Water" icon={require('@/assets/images/cardIcons/water.png')} value="2,500 ml" />
      <SettingsRow label="Steps" icon={require('@/assets/images/cardIcons/steps.png')} value="10,000" />
    </SettingsCard>
  );
}

export function PreferencesCard() {
  return (
    <SettingsCard title="Preferences">
      <SettingsRow label="Units" value="Metric" />
      <SettingsRow label="Notifications" />
    </SettingsCard>
  );
}

export function AccountCard() {
  return (
    <SettingsCard title="Account">
      <SettingsRow label="Name" value="Mark" />
      <SettingsRow label="Email" value="mark@example.com" />
    </SettingsCard>
  );
}

export function SupportCard() {
  return (
    <SettingsCard title="Support">
      <SettingsRow label="Contact us" />
      <SettingsRow label="FAQ" />
    </SettingsCard>
  );
}

export function OtherCard() {
  return (
    <SettingsCard title="Other">
      <SettingsRow label="Terms of Use" />
      <SettingsRow label="Privacy Policy" />
    </SettingsCard>
  );
}
