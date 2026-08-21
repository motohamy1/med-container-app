/**
 * notificationService.test.js
 * Lightweight smoke tests for the notification service.
 * Run with: node backend/services/notificationService.test.js
 *
 * Strategy:
 *  - sendPush tests: set SUPABASE_URL/SUPABASE_KEY before require so the
 *    Supabase client initialises without error, then override global.fetch to
 *    stub the Expo push HTTP call.
 *  - sendToUser is integration-grade: it needs a live Supabase + Expo endpoint,
 *    so we skip direct unit tests for it and instead validate the module shape
 *    and the HTTP-path logic that sendPush covers.
 */

const assert = require('assert');

// ---------------------------------------------------------------------------
// 1. Set env before the module's top-level Supabase client is created.
// ---------------------------------------------------------------------------

const ORIGINAL_SUPABASE_URL = process.env.SUPABASE_URL;
const ORIGINAL_SUPABASE_KEY = process.env.SUPABASE_KEY;

process.env.SUPABASE_URL = 'https://fake.supabase.co';
process.env.SUPABASE_KEY = 'fake-service-role-key';

// ---------------------------------------------------------------------------
// 2. Require the module under test (Supabase client will be created with the
//    fake env above and will not crash — it only fails on first query).
// ---------------------------------------------------------------------------

const raw = require('./notificationService');

// Restore real env so that any accidental real DB calls fail loud rather than
// silently hitting the fake URL.
process.env.SUPABASE_URL = ORIGINAL_SUPABASE_URL;
process.env.SUPABASE_KEY = ORIGINAL_SUPABASE_KEY;

// ---------------------------------------------------------------------------
// 3. Tests
// ---------------------------------------------------------------------------

async function run() {
  console.log('notificationService smoke tests\n' + '-'.repeat(42));

  // ---- 3.1 Module shape ----
  assert(raw.sendPush, 'expected sendPush export');
  assert(raw.sendToUser, 'expected sendToUser export');
  assert(raw.notifySubscribers, 'expected notifySubscribers export');
  console.log('[pass] module exports present');

  // ---- 3.2 sendPush with no tokens returns skipped ----
  const skipped = await raw.sendPush([], 't', 'b');
  assert(skipped && skipped.skipped === true, 'expected skipped=true for empty tokens');
  console.log('[pass] sendPush([]) → skipped');

  // ---- 3.3 sendPush delegates to Expo push API via global.fetch ----
  const originalFetch = global.fetch;

  let lastFetchBody = null;
  global.fetch = async (url, opts) => {
    if (typeof opts?.body === 'string') {
      lastFetchBody = JSON.parse(opts.body);
    }
    return {
      ok: true,
      json: async () => [
        { status: 'ok', id: 'push-1' },
        { status: 'ok', id: 'push-2' },
      ],
    };
  };

  const results = await raw.sendPush(
    ['token-a', 'token-b'],
    'Test Title',
    'Test Body',
    { screen: '/(tabs)/pearls', pearlId: 'p-42' }
  );

  assert(Array.isArray(results), 'expected results array');
  assert(results.length === 2, 'expected two push results');
  assert(results[0].id === 'push-1', 'unexpected first result id');
  assert(results[1].id === 'push-2', 'unexpected second result id');
  assert(lastFetchBody, 'expected fetch to have been called');
  assert(lastFetchBody.to, 'expected push payload to contain "to"');
  assert(Array.isArray(lastFetchBody.to), 'expected "to" to be an array');
  assert(lastFetchBody.title === 'Test Title', 'unexpected title');
  assert(lastFetchBody.body === 'Test Body', 'unexpected body');
  assert(lastFetchBody.data.screen === '/(tabs)/pearls', 'unexpected deep-link screen');
  assert(lastFetchBody.data.pearlId === 'p-42', 'unexpected custom data');
  console.log('[pass] sendPush delegates to Expo push API with correct payload');

  global.fetch = originalFetch;
  console.log('-'.repeat(42));
  console.log('All smoke tests passed.');
}

run().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
