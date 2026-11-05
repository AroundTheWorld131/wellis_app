import { Caveat_600SemiBold } from '@expo-google-fonts/caveat';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

// TODO: replace with real onboarding state once it's stored somewhere.
const hasOnboarded = false;

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_Condensed800ExtraBold: require('@/assets/fonts/BricolageGrotesque-CondensedExtraBold.ttf'),
    Caveat_600SemiBold,
  });

  // Keep the splash screen up until the font is ready.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <KeyboardProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={hasOnboarded} redirectTo="/onboarding/welcome">
            <Stack.Screen name="(tabs)" />
          </Stack.Protected>
          <Stack.Protected guard={!hasOnboarded} redirectTo="/">
            <Stack.Screen name="onboarding" />
          </Stack.Protected>
        </Stack>
      </ThemeProvider>
    </KeyboardProvider>
  );
}
