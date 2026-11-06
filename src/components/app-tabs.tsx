import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

import { ChatIcon } from '@/components/icons/chat-icon';
import { DiscoverIcon } from '@/components/icons/discover-icon';
import { HomeIcon } from '@/components/icons/home-icon';
import { ProfileIcon } from '@/components/icons/profile-icon';
import { ProgressIcon } from '@/components/icons/progress-icon';
import { Colors } from '@/constants/theme';

// The selected tab's icon and label.
const ACTIVE_COLOR = '#000000';

// Classic solid tab bar (JavaScript tabs) instead of the iOS 26 Liquid Glass native one.
export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  // The icons need a plain string color, so pick it from `focused` instead of the bar's ColorValue.
  const iconColor = (focused: boolean) => (focused ? ACTIVE_COLOR : colors.textSecondary);

  // Each icon's strokeWidth below sets its line weight; Home and Profile are filled
  // shapes, where it adds an outline (0 = as drawn).
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: colors.textSecondary,
        // No hairline along the top of the bar.
        tabBarStyle: { backgroundColor: colors.background, borderTopWidth: 0, elevation: 0 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, size }) => <HomeIcon size={size} color={iconColor(focused)} strokeWidth={0} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused, size }) => <ProgressIcon size={size} color={iconColor(focused)} strokeWidth={1.6} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ focused, size }) => <DiscoverIcon size={size} color={iconColor(focused)} strokeWidth={2.3} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused, size }) => <ChatIcon size={size} color={iconColor(focused)} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, size }) => <ProfileIcon size={size} color={iconColor(focused)} strokeWidth={18} />,
        }}
      />
    </Tabs>
  );
}
