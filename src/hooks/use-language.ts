import * as SecureStore from 'expo-secure-store';
import { useSyncExternalStore } from 'react';

export const LANGUAGES = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
] as const;

export type Language = (typeof LANGUAGES)[number]['value'];

const STORAGE_KEY = 'language';
const isLanguage = (value: string | null): value is Language =>
  LANGUAGES.some((language) => language.value === value);

// One shared value for the whole app, saved on the device so it survives restarts.
// The app's text is still English only; this only remembers the choice for now.
let current: Language = 'en';
const listeners = new Set<() => void>();

const setCurrent = (language: Language) => {
  current = language;
  listeners.forEach((listener) => listener());
};

SecureStore.getItemAsync(STORAGE_KEY)
  .then((saved) => {
    if (isLanguage(saved)) setCurrent(saved);
  })
  .catch(() => {});

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useLanguage() {
  const language = useSyncExternalStore(subscribe, () => current);

  const setLanguage = (next: Language) => {
    setCurrent(next);
    SecureStore.setItemAsync(STORAGE_KEY, next).catch(() => {});
  };

  const { label, flag } = LANGUAGES.find((option) => option.value === language)!;

  return { language, label, flag, setLanguage };
}
