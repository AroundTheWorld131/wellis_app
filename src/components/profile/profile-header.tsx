import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedButton } from '@/components/animated-button';
import { SettingsColors } from '@/components/profile/settings-card';
import { BrandColor, BrandColorSoft } from '@/constants/theme';

const AVATAR_SIZE = 96;
const BADGE_SIZE = 30;
const BADGE_RING = 2;

// Round profile photo with the user's name centred under it. Tapping the photo
// picks a new one from the library. Without a photo, the name's first letter is
// shown instead.
// TODO: upload and persist the photo once there's a backend. It lives in memory
// for now, so it resets when the app restarts.
export function ProfileHeader({ name }: { name: string }) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const pickPhoto = async () => {
    // allowsEditing crops to a square and returns a copy, so iOS doesn't need to
    // ask for full library access after the pick.
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    setPhotoUri(result.assets[0].uri);
  };

  return (
    <View style={styles.container}>
      <AnimatedButton onPress={pickPhoto} scaleTo={0.95} accessibilityLabel="Change profile photo">
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.avatar} contentFit="cover" transition={150} />
        ) : (
          <View style={[styles.avatar, styles.placeholder]}>
            <Text style={styles.initial}>{name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.badgeRing}>
          <View style={styles.badge}>
            <SymbolView
              name="plus"
              size={13}
              weight="bold"
              tintColor="#ffffff"
              fallback={<Text style={styles.badgeFallback}>+</Text>}
            />
          </View>
        </View>
      </AnimatedButton>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    paddingBottom: 14,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColorSoft,
  },
  initial: {
    fontSize: 38,
    fontWeight: '600',
    color: BrandColor,
  },
  // Plus badge on the avatar's bottom-right edge, ringed in the page colour.
  // The ring is a larger circle behind the badge rather than a borderWidth, since
  // a rounded border leaves a thin halo of the fill showing around its edge.
  badgeRing: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f6',
  },
  badge: {
    width: BADGE_SIZE - BADGE_RING * 2,
    height: BADGE_SIZE - BADGE_RING * 2,
    borderRadius: (BADGE_SIZE - BADGE_RING * 2) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SettingsColors.muted,
  },
  badgeFallback: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: SettingsColors.label,
  },
});
