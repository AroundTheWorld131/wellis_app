import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatIcon } from '@/components/icons/chat-icon';
import { DiscoverIcon } from '@/components/icons/discover-icon';
import { HomeIcon } from '@/components/icons/home-icon';
import { ProfileIcon } from '@/components/icons/profile-icon';
import { Colors } from '@/constants/theme';

// The selected tab's icon and label.
const ACTIVE_COLOR = '#000000';
// Extra space above the icons, pushing them lower in the bar.
const TOP_GAP = 4;
// Space between each icon and its label.
const LABEL_GAP = 4;
// The bar's default content height (UIKit's tab bar).
const BAR_HEIGHT = 49;
// Space at each side of the bar, so the tabs sit closer to the middle.
const SIDE_PADDING = 30;

// Classic solid tab bar (JavaScript tabs) instead of the iOS 26 Liquid Glass native one.
export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  // The icons need a plain string color, so pick it from `focused` instead of the bar's ColorValue.
  const iconColor = (focused: boolean) => (focused ? ACTIVE_COLOR : colors.textSecondary);

  // Each icon's strokeWidth below sets its line weight.
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: colors.textSecondary,
        // No hairline along the top of the bar.
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          elevation: 0,
          // Grow the bar by the added gaps so they move things down instead of squeezing them.
          // height: BAR_HEIGHT + TOP_GAP + LABEL_GAP + insets.bottom,
          paddingTop: TOP_GAP,
          // Pull the four tabs in toward the middle.
          paddingHorizontal: SIDE_PADDING,
        },
        tabBarLabelStyle: { marginTop: LABEL_GAP },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, size }) => <HomeIcon size={28} strokeWidth={2.2} color={iconColor(focused)} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ focused, size }) => <DiscoverIcon size={27} color={iconColor(focused)} strokeWidth={2.3} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused, size }) => <ChatIcon size={27} color={iconColor(focused)} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, size }) => <ProfileIcon size={28} color={iconColor(focused)} />,
        }}
      />
    </Tabs>
  );
}
