// Seeds realistic demo venues + API keys through the running Speakeasy API.
// Usage (backend must be running):  node scripts/seed-demo.mjs [http://localhost:3000]
// Safe to re-run: venues that already exist (by name) are skipped.

const API = process.argv[2] ?? process.env.API_URL ?? 'http://localhost:3000';

const VENUES = [
  {
    venueName: 'The Velvet Room — Bandra',
    posProvider: 'TOAST',
    apiKeyType: 'OAUTH2_CLIENT_CREDENTIALS',
    apiKey: { clientId: 'velvet-bandra-pos', clientSecret: 'cs_live_8f2a91c7d0e44b3a', tokenUrl: 'https://ws-api.toasttab.com/authentication/v1/authentication/login' },
    keys: [['Bar tablets — production', 'NO_EXPIRE'], ['Inventory sync', 'ONE_MONTH']],
  },
  {
    venueName: 'Copper & Oak Taproom',
    posProvider: 'ORACLE',
    apiKeyType: 'BASIC_AUTH',
    apiKey: { username: 'copperoak-integration', password: 'S3cure!Taproom#2026' },
    keys: [['Front-of-house POS', 'ONE_MONTH'], ['Weekend pop-up bar', 'ONE_DAY']],
  },
  {
    venueName: 'Blind Tiger Speakeasy',
    posProvider: 'UNION',
    apiKeyType: 'API_KEY',
    apiKey: { apiKey: 'un_live_4c9e1b7a2f6d8e03b5a1' },
    keys: [['Main bar terminal', 'NO_EXPIRE']],
  },
  {
    venueName: 'Juniper Social — Koramangala',
    posProvider: 'TOAST',
    apiKeyType: 'BEARER_TOKEN',
    apiKey: { token: 'eyJhbGciOiJIUzI1NiJ9.eyJ2ZW51ZSI6Imp1bmlwZXIifQ.k3Jx9pQ' },
    keys: [['Kitchen display system', 'ONE_WEEK'], ['Staff mobile app', 'ONE_MONTH'], ['QA sandbox', 'ONE_DAY']],
  },
  {
    venueName: 'Midnight Ledger Lounge',
    posProvider: 'ORACLE',
    apiKeyType: 'OAUTH2_REFRESH_TOKEN',
    apiKey: { clientId: 'ledger-lounge', clientSecret: 'cs_9a7d2e1f4b', tokenUrl: 'https://simphony.oracle.example/oauth/token', refreshToken: 'rt_1f8c2b9d7e3a6c40' },
    keys: [['Reservations bridge', 'ONE_MONTH']],
  },
  {
    venueName: 'Prohibition Bar & Kitchen',
    posProvider: 'UNION',
    apiKeyType: 'CUSTOM_HEADERS',
    apiKey: { headers: { 'X-Union-Store': 'PBK-0042', 'X-Union-Secret': 'us_7b3e9d1c5a2f' } },
    keys: [],
  },
  {
    venueName: 'Gin Joint — Indiranagar',
    posProvider: 'TOAST',
    apiKeyType: 'JWT',
    apiKey: { jwtToken: 'eyJhbGciOiJSUzI1NiJ9.eyJzdG9yZSI6Imdpbmpvb' },
    keys: [['Happy-hour pricing service', 'ONE_WEEK']],
  },
];

async function call(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(json.message ?? json)}`);
  return json;
}

const existing = await call('GET', '/admin/venues?take=50');
const names = new Set(existing.list.map((v) => v.venueName));

for (const { keys, ...venue } of VENUES) {
  if (names.has(venue.venueName)) {
    console.log(`• skip   ${venue.venueName} (exists)`);
    continue;
  }
  const v = await call('POST', '/admin/venues', venue);
  for (const [name, expiryOption] of keys) {
    await call('POST', '/admin/venue-api-keys', { name, venueId: v.id, expiryOption });
  }
  console.log(`✓ added  ${venue.venueName} (${venue.posProvider}, ${keys.length} key${keys.length === 1 ? '' : 's'})`);
}
console.log('Done.');
