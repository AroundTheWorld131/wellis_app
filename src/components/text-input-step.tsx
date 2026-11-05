import type { Ref } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputInstance,
  type TextInputProps,
} from 'react-native';

// Ported from the Balm app's TextInputStep: one full-width page of a stepped
// form, with a big title, a grey subtitle and a borderless input under them.

type TextInputStepProps = TextInputProps & {
  inputRef?: Ref<TextInputInstance>;
  width: number;
  title: string;
  subtitle?: string;
};

export function TextInputStep({ inputRef, width, title, subtitle, style, ...inputProps }: TextInputStepProps) {
  return (
    <View style={[styles.page, { width }]}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <TextInput
        ref={inputRef}
        style={[styles.input, style]}
        placeholderTextColor="rgba(0,0,0,0.2)"
        cursorColor="#000"
        selectionColor="#000"
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  titleContainer: {
    paddingTop: 30,
    paddingBottom: 15,
    paddingHorizontal: 36,
    gap: 7,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    fontSize: 20,
    color: '#908EA2',
  },
  input: {
    marginTop: 40,
    paddingHorizontal: 40,
    fontSize: 24,
    fontWeight: '500',
    color: '#000',
  },
});
