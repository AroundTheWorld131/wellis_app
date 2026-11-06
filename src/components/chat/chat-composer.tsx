import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';

import { AnimatedButton } from '@/components/animated-button';
import type { ChatImage } from '@/constants/sample-chats';
import { BrandColor } from '@/constants/theme';

const BUTTON_SIZE = 44;
// Grows with the text up to about six lines, then scrolls.
const MAX_INPUT_HEIGHT = 140;

type ChatComposerProps = {
  onSend: (text: string) => void;
  onSendPhoto: (image: ChatImage) => void;
  /** Space under the field for the home indicator while the keyboard is closed. */
  bottomInset: number;
};

// Photo button, growing text field and send button.
export function ChatComposer({ onSend, onSendPhoto, bottomInset }: ChatComposerProps) {
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
  };

  // The system photo picker needs no permission prompt on iOS. A picked photo sends right away.
  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled) return;
    const { uri, width, height } = result.assets[0];
    onSendPhoto({ uri, width, height });
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomInset + 8 }]}>
      <View style={styles.bar}>
        <AnimatedButton onPress={handlePickPhoto} scaleTo={0.9} style={styles.photoButton}>
          <SymbolView
            name="photo"
            size={19}
            weight="medium"
            tintColor="#262626"
            fallback={<Text style={styles.fallback}>+</Text>}
          />
        </AnimatedButton>

        <View style={styles.field}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Write a message"
            placeholderTextColor="#a3a3a3"
            multiline
            cursorColor={BrandColor}
            selectionColor={BrandColor}
            style={styles.input}
          />
        </View>

        {canSend ? (
          <Animated.View entering={ZoomIn.springify().damping(16)} exiting={FadeOut.duration(120)}>
            <AnimatedButton onPress={handleSend} scaleTo={0.9} hapticStyle="medium" style={styles.sendButton}>
              <SymbolView
                name="arrow.up"
                size={18}
                weight="bold"
                tintColor="#ffffff"
                fallback={<Text style={[styles.fallback, styles.sendFallback]}>↑</Text>}
              />
            </AnimatedButton>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#ffffff',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  photoButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f6',
  },
  // Pill that turns into a rounded box as the text wraps.
  field: {
    flex: 1,
    minHeight: BUTTON_SIZE,
    justifyContent: 'center',
    backgroundColor: '#f2f2f6',
    borderRadius: BUTTON_SIZE / 2,
    borderCurve: 'continuous',
    paddingHorizontal: 18,
  },
  input: {
    maxHeight: MAX_INPUT_HEIGHT,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: 17,
    lineHeight: 22,
    color: '#262626',
  },
  sendButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BrandColor,
  },
  fallback: {
    fontSize: 24,
    lineHeight: 26,
    color: '#262626',
  },
  sendFallback: {
    color: '#ffffff',
  },
});
