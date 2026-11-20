import { UNIQUE_ID_ENUM } from 'src/keys';

export function getUniqueId(type: UNIQUE_ID_ENUM): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${type}-${timestamp}${randomStr}`.toUpperCase();
}

export function generateRandomString(length: number = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}

export function generateClientId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `CLIENT-${timestamp}-${randomStr}`.toUpperCase();
}
