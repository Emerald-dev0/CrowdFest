/**
 * SSRF prevention (spec §10.2).
 * Network isolation rules for execution workers.
 */

export const BLOCKED_HOST_PATTERNS: RegExp[] = [
  // Loopback
  /^(localhost|127\.\d{1,3}\.\d{1,3}\.\d{1,3}|0\.0\.0\.0|\[::1\])$/i,
  // Private networks (RFC 1918)
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/,
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  // Link-local
  /^169\.254\.\d{1,3}\.\d{1,3}$/,
  // Cloud metadata
  /^169\.254\.169\.254$/,
  /^metadata\.google\.internal$/,
  /^169\.254\.170\.2$/,
];

export const BLOCKED_PATH_PATTERNS: RegExp[] = [
  /\/meta-data\//,
  /\/user-data\//,
  /\/dynamic\//,
];

export function isBlockedHost(hostname: string): boolean {
  return BLOCKED_HOST_PATTERNS.some((re) => re.test(hostname));
}

export function isBlockedPath(pathname: string): boolean {
  return BLOCKED_PATH_PATTERNS.some((re) => re.test(pathname));
}

export function validateDestination(url: string): { valid: boolean; reason?: string } {
  try {
    const parsed = new URL(url);
    if (isBlockedHost(parsed.hostname)) {
      return { valid: false, reason: 'Destination host is blocked' };
    }
    if (isBlockedPath(parsed.pathname)) {
      return { valid: false, reason: 'Destination path is blocked' };
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, reason: 'Only http/https protocols allowed' };
    }
    return { valid: true };
  } catch {
    return { valid: false, reason: 'Invalid URL' };
  }
}
