import { useState } from 'react';

// ---------------------------------------------------------------------------
// Global notification handler stub
// (expo-notifications removed to allow seamless Expo Go SDK 53+ execution)
// ---------------------------------------------------------------------------
export function setNotificationHandler() {
  // No-op for Expo Go compatibility
}

// ---------------------------------------------------------------------------
// usePushToken hook stub
// Provides safe, non-blocking fallback for profile & device management.
// ---------------------------------------------------------------------------
export function usePushToken() {
  const [token] = useState<string | null>(null);
  const [error] = useState<string | null>(null);

  return { token, error };
}
