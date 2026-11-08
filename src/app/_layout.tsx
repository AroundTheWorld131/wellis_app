import { Caveat_600SemiBold } from '@expo-google-fonts/caveat';
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from '@expo-google-fonts/geist';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ConvexReactClient, useConvexAuth } from 'convex/react';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useOpenChatFromNotification } from '@/hooks/use-push-notifications';
import { authStorage } from '@/lib/auth-storage';

SplashScreen.preventAutoHideAsync();

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_Condensed800ExtraBold: require('@/assets/fonts/BricolageGrotesque-CondensedExtraBold.ttf'),
    Caveat_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  // Keep the splash screen up until the font is ready.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ConvexAuthProvider client={convex} storage={authStorage}>
      <KeyboardProvider>
        <ThemeProvider value={DefaultTheme}>
          <AnimatedSplashOverlay />
          <RootStack />
        </ThemeProvider>
      </KeyboardProvider>
    </ConvexAuthProvider>
  );
}

// Signing in flips the guards, and the router moves the user from onboarding to home on its own.
function RootStack() {
  const { isAuthenticated: isSignedIn, isLoading } = useConvexAuth();

  // Tapping a care team reply notification opens the chat.
  useOpenChatFromNotification();

  // Wait for the saved login to load from the Keychain, so a signed-in user never sees onboarding flash.
  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn} redirectTo="/onboarding/welcome">
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="metrics/[metric]" />
        {/* The tab bar's plus: a sheet sized to its rows, with a grabber. */}
        <Stack.Screen
          name="log-menu"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: 'fitToContents',
            sheetGrabberVisible: true,
            sheetCornerRadius: 32,
            contentStyle: { backgroundColor: '#f6f6f9' },
          }}
        />
        <Stack.Screen name="log-weight" options={{ presentation: 'modal' }} />
        <Stack.Screen name="log-water" options={{ presentation: 'modal' }} />
        <Stack.Screen name="log-shot" options={{ presentation: 'modal' }} />
        <Stack.Screen name="goal-weight" options={{ presentation: 'modal' }} />
        <Stack.Screen name="goal-water" options={{ presentation: 'modal' }} />
        <Stack.Screen name="goal-steps" options={{ presentation: 'modal' }} />
        <Stack.Screen name="starting-weight" options={{ presentation: 'modal' }} />
        <Stack.Screen name="height" options={{ presentation: 'modal' }} />
        <Stack.Screen name="streak" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="language" options={{ contentStyle: { backgroundColor: '#f6f6f9' } }} />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn} redirectTo="/">
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
    </Stack>
  );
}
