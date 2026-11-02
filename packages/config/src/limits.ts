/**
 * Execution limits (spec §10.3).
 * Conservative defaults - benchmark before increasing.
 */

export interface ExecutionLimits {
  maxDurationSeconds: number;
  maxBrowserSessions: number;
  maxVirtualUsers: number;
  maxRequestsPerSecond: number;
  maxResourceAllocation: {
    cpuCores: number;
    memoryMb: number;
  };
  perOrgBudget: {
    browserSessionHours: number;
    httpUserHours: number;
  };
}

export const DEFAULT_LIMITS: ExecutionLimits = {
  maxDurationSeconds: 900, // 15 minutes
  maxBrowserSessions: 20,
  maxVirtualUsers: 500,
  maxRequestsPerSecond: 1000,
  maxResourceAllocation: {
    cpuCores: 8,
    memoryMb: 16384,
  },
  perOrgBudget: {
    browserSessionHours: 10,
    httpUserHours: 100,
  },
};

export interface SecurityRules {
  allowLoopback: boolean;
  allowPrivateNetworks: boolean;
  blockMetadataEndpoints: boolean;
  allowedHosts: string[];
}

export const DEFAULT_SECURITY_RULES: SecurityRules = {
  allowLoopback: false,
  allowPrivateNetworks: false,
  blockMetadataEndpoints: true,
  allowedHosts: [],
};
