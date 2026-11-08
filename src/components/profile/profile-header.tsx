import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedButton } from '@/components/animated-button';

const AVATAR_SIZE = 96;

// Round profile photo, centered, with the name under it. Tapping the photo picks a new one
// from the library. Until then it shows the same photo as the header.
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
        {/* A picked photo, else the same photo as the header's profile button. */}
        <Image
          source={photoUri ? { uri: photoUri } : require('@/assets/images/avatar.jpg')}
          style={styles.avatar}
          contentFit="cover"
          transition={150}
          accessibilityLabel={`${name}'s profile photo`}
        />
      </AnimatedButton>
      <Text style={styles.name}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Centered. The screen's 30 gap separates the name from the invite card below.
  container: {
    alignItems: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  name: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '600',
    color: '#262626',
  },
});
