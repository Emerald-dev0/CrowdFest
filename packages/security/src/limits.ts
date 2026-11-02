/**
 * Security-focused execution limits re-exported for workers.
 */

export interface ResourceLimits {
  maxDurationSeconds: number;
  maxBrowserSessions: number;
  maxVirtualUsers: number;
  maxRequestsPerSecond: number;
}

export const DEFAULT_RESOURCE_LIMITS: ResourceLimits = {
  maxDurationSeconds: 900,
  maxBrowserSessions: 20,
  maxVirtualUsers: 500,
  maxRequestsPerSecond: 1000,
};
