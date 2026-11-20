import { randomBytes } from 'crypto';

/**
 * Generates a secure API key with 'spk_' prefix
 * Format: spk_<32 random bytes encoded in hex>
 * @returns {string} Secure API key
 */
export function generateSecureApiKey(): string {
  const randomPart = randomBytes(32).toString('hex');
  return `spk_${randomPart}`;
}
