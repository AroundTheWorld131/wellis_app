import { Caveat_600SemiBold } from '@expo-google-fonts/caveat';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { SessionProvider, useSession } from '@/hooks/use-session';

SplashScreen.preventAutoHideAsync();

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
    <SessionProvider>
      <KeyboardProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          <RootStack />
        </ThemeProvider>
      </KeyboardProvider>
    </SessionProvider>
  );
}

// Signing in flips the guards, and the router moves the user from onboarding to home on its own.
function RootStack() {
  const { isSignedIn } = useSession();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn} redirectTo="/onboarding/welcome">
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="metrics/[metric]" />
        <Stack.Screen name="log-weight" options={{ presentation: 'modal' }} />
        <Stack.Screen name="streak" options={{ presentation: 'fullScreenModal' }} />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn} redirectTo="/">
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
    </Stack>
  );
}
