import * as SecureStore from 'expo-secure-store';

/** Keeps Convex Auth's login tokens in the iOS Keychain / Android Keystore, like the Balm app. */
export const authStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};
