import { LogStack } from '@/components/log-day';
import { ShotDraftProvider } from '@/components/shot-form';

// The Add Shot sheet and the screens it pushes, stacked inside the modal so each choice
// slides in from the right. They share the day (LogStack) and the rest of the draft.
export default function Layout() {
  return (
    <ShotDraftProvider>
      <LogStack />
    </ShotDraftProvider>
  );
}
