import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ScrollViewInstance,
  type TextInputInstance,
} from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedButton } from '@/components/animated-button';
import { TextInputStep } from '@/components/text-input-step';
import { BrandColor } from '@/constants/theme';

// The two-page email then password screen that logging in and signing up share,
// same layout as the Balm app's auth screens. UI only for now.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type EmailPasswordScreenProps = {
  passwordTitle: string;
  passwordSubtitle: string;
  isPasswordValid: (password: string) => boolean;
};

export function EmailPasswordScreen({
  passwordTitle,
  passwordSubtitle,
  isPasswordValid,
}: EmailPasswordScreenProps) {
  const insets = useSafeAreaInsets();
  const { width: pageWidth } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollViewInstance>(null);
  const emailInputRef = useRef<TextInputInstance>(null);
  const passwordInputRef = useRef<TextInputInstance>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const emailValid = EMAIL_PATTERN.test(email.trim());
  const passwordValid = isPasswordValid(password);
  const isCurrentStepValid = currentPage === 0 ? emailValid : passwordValid;

  const scrollToPage = (page: number) => {
    scrollViewRef.current?.scrollTo({ x: page * pageWidth, animated: true });
    setCurrentPage(page);
    (page === 0 ? emailInputRef : passwordInputRef).current?.focus();
  };

  // From the password page, back returns to the email page; from the email page it leaves.
  const handleBack = () => {
    if (currentPage === 1) {
      scrollToPage(0);
      return;
    }
    Keyboard.dismiss();
    router.back();
  };

  const handleContinue = () => {
    if (currentPage === 0) {
      scrollToPage(1);
    }
    // TODO: log in or sign up here once there's a backend.
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 4 }]}>
      <View style={styles.header}>
        <AnimatedButton onPress={handleBack} scaleTo={0.95} style={styles.backButton}>
          <SymbolView
            name="chevron.backward"
            size={21}
            weight="medium"
            tintColor="#000"
            fallback={<Text style={styles.backFallback}>‹</Text>}
          />
        </AnimatedButton>
      </View>

      {/* Pages only move with the buttons, never by swiping. */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        style={styles.pages}>
        <TextInputStep
          inputRef={emailInputRef}
          autoFocus
          width={pageWidth}
          title="What's your email?"
          subtitle="Enter your email to continue."
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          // Same trick as Balm: iOS shows no autofill suggestions above the
          // keyboard for one-time-code fields. "off" does the same on Android.
          textContentType="oneTimeCode"
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={() => {
            if (emailValid) handleContinue();
          }}
        />

        <TextInputStep
          inputRef={passwordInputRef}
          width={pageWidth}
          title={passwordTitle}
          subtitle={passwordSubtitle}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="oneTimeCode"
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => {
            if (passwordValid) handleContinue();
          }}
        />
      </ScrollView>

      {/* Rides up with the keyboard frame by frame. When open, it sits 15pt above
          the keyboard instead of the home-indicator inset, same as Balm. */}
      <KeyboardStickyView
        offset={{ closed: 0, opened: Math.max(insets.bottom, 20) - 15 }}
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <AnimatedButton
          onPress={handleContinue}
          disabled={!isCurrentStepValid}
          style={[styles.button, !isCurrentStepValid && styles.buttonDisabled]}>
          <Text style={styles.buttonText}>Continue</Text>
        </AnimatedButton>
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f6f9',
  },
  backFallback: {
    fontSize: 30,
    lineHeight: 32,
    color: '#000',
  },
  pages: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 30,
    paddingTop: 10,
  },
  // Same pill as the welcome screen's Get Started button.
  button: {
    height: 52,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BrandColor,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 19,
    fontWeight: '600',
    letterSpacing: -0.5,
    color: '#ffffff',
  },
});
