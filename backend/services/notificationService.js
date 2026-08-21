/**
 * notificationService.js
 *
 * Sends Expo push notifications to one or more device tokens.
 * Uses the public Expo push API (no credentials required).
 *
 * Invoked by your existing Express backend routes/services when an event
 * warrants a push (e.g. new clinical pearl, chat reply, knowledge update).
 *
 * Prerequisites:
 *  - Backend .env must define SUPABASE_URL and SUPABASE_KEY (already done).
 *  - Device tokens should already be stored in the Supabase `devices` table
 *    by the RN app (see usePushToken.ts).
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[notificationService] SUPABASE_URL or SUPABASE_KEY is missing — ' +
      'push notifications will be skipped.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Expo push endpoint — no auth required.
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// ---------------------------------------------------------------------------
// sendPush(tokens, title, body, data?)
// ---------------------------------------------------------------------------

async function sendPush(tokens, title, body, data = {}) {
  if (!tokens || tokens.length === 0) return { skipped: true };

  const bodyPayload = JSON.stringify({
    to: tokens,
    title,
    body,
    data: {
      // Deep-link target — Expo Router will route on notification tap.
      // Adjust screen paths to match your app's route structure.
      screen: data.screen || '/',
      ...data,
    },
  });

  // The Expo push API accepts both a single token string and an array.
  const payload = Array.isArray(tokens) ? { to: tokens } : { to: tokens };

  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        title,
        body,
        data: { screen: data.screen || '/', ...data },
      }),
    });

    const json = await res.json();

    // Expo returns an array when `to` is an array, a single object otherwise.
    return Array.isArray(json) ? json : [json];
  } catch (err) {
    console.error('[notificationService] Expo push request failed:', err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

// ---------------------------------------------------------------------------
// sendToUser(userId, title, body, data?)
// Looks up all active device tokens for a given Supabase user and sends one
// batched push request.  Logs each notification into user_notifications.
// ---------------------------------------------------------------------------

async function sendToUser(userId, title, body, data = {}) {
  const { data: devices, error } = await supabase
    .from('devices')
    .select('token')
    .eq('user_id', userId)
    .eq('active', true);

  if (error) {
    console.error('[notificationService] Failed to fetch devices:', error);
    return { error };
  }

  const tokens = devices?.map((d) => d.token) ?? [];
  if (tokens.length === 0) return { skipped: true, reason: 'no devices' };

  const results = await sendPush(tokens, title, body, data);

  // Log notifications for the user's notification center.
  const now = new Date().toISOString();
  const logEntries = tokens.map((token) => ({
    user_id: userId,
    title,
    body,
    data: data,
    read: false,
    created_at: now,
  }));

  // Suppress bulk-insert errors — delivery is the priority.
  if (logEntries.length > 0) {
    const { error: logError } = await supabase
      .from('user_notifications')
      .insert(logEntries);
    if (logError) console.warn('[notificationService] Notification log insert failed:', logError);
  }

  return { results, devicesCount: tokens.length };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

module.exports = {
  sendPush,
  sendToUser,

  /**
   * Example helper you can call from any route/service when a new daily pearl
   * is published.  Replace the query with whatever criteria identify your
   * subscribers in your actual schema.
   */
  notifySubscribers: async function notifySubscribers({
    pearlId,
    pearlTitle,
    subscriberQuery = {}, // override for testing
  } = {}) {
    // Fetch user IDs that should receive this notification.
    // Replace with your real subscription/segment table when ready.
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(500); // safety cap

    if (error || !users?.length) {
      console.warn('[notificationService] notifySubscribers: no users found');
      return { skipped: true };
    }

    const userIdList = users.map((u) => u.id);
    const results = [];

    for (const userId of userIdList) {
      const res = await sendToUser(userId, 'New Clinical Pearl', pearlTitle, {
        screen: '/(tabs)/pearls',
        pearlId,
      });
      results.push({ userId, ...res });
    }

    return { results };
  },
};
