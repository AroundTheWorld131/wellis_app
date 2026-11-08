import { Button, Host, Text } from '@expo/ui/swift-ui';
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  disabled,
  font,
  frame,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import { StyleSheet } from 'react-native';

import { BrandColor } from '@/constants/theme';

type PillButtonProps = {
  label: string;
  onPress: () => void;
  /** Greys the button out the native way and ignores taps. */
  disabled?: boolean;
};

// A full-width SwiftUI capsule button in the brand color, so it gets the system's pill
// shape, press highlight and disabled look. Used for the sheets' Save and the date screen's Done.
export function PillButton({ label, onPress, disabled: isDisabled = false }: PillButtonProps) {
  return (
    <Host matchContents={{ vertical: true }} style={styles.host}>
      <Button
        onPress={onPress}
        modifiers={[
          buttonStyle('borderedProminent'),
          buttonBorderShape('capsule'),
          controlSize('large'),
          tint(BrandColor),
          disabled(isDisabled),
        ]}>
        {/* An infinite max width stretches the capsule across the whole host. */}
        <Text
          modifiers={[
            frame({ maxWidth: Infinity }),
            font({ size: 20, weight: 'semibold' }),
          ]}>
          {label}
        </Text>
      </Button>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    alignSelf: 'stretch',
  },
});
