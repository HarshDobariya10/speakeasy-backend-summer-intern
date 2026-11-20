/**
 * Security helper to filter includes based on whitelisted relations
 * Prevents users from accessing sensitive data through unauthorized relation includes
 */

/**
 * Filters the include array to only allow whitelisted relations
 * Silently ignores unauthorized includes without throwing errors
 *
 * @param includes - Array of include strings from query parameter (or single string)
 * @param whitelist - Array of allowed relation names
 * @returns Filtered array containing only whitelisted includes
 */
export function filterAllowedIncludes(
  includes: string[] | string | undefined,
  whitelist: string[],
): string[] {
  if (!includes) {
    return [];
  }

  // Normalize to array (handle single string case)
  const includesArray = Array.isArray(includes) ? includes : [includes];

  if (includesArray.length === 0) {
    return [];
  }

  // Filter includes to only allow whitelisted relations
  return includesArray.filter((include) => whitelist.includes(include));
}

/**
 * Creates a safe query DTO with only whitelisted includes
 * Preserves all other query parameters (skip, take, orderBy, search, etc.)
 *
 * @param query - Original query DTO from request (BaseQueryCoreDto or CoreIncludesDto)
 * @param whitelist - Array of allowed relation names
 * @returns New query DTO with filtered includes and all other params preserved
 */
export function createSafeIncludesDto(query: any, whitelist: string[]): any {
  if (!query) {
    return {};
  }

  const filteredIncludes = filterAllowedIncludes(query?.include, whitelist);

  // Create a new object with all properties except include
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { include, ...otherParams } = query;

  // Only add include if there are filtered includes
  if (filteredIncludes.length > 0) {
    return {
      ...otherParams,
      include: filteredIncludes,
    };
  }

  // Return without include field if no filtered includes
  return otherParams;
}
