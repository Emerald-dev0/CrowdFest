export * from './users';
export * from './organizations';
export * from './projects';
export * from './environments';
export * from './scenarios';
export * from './simulations';
export * from './execution-groups';
export * from './simulation-events';
export * from './metric-aggregates';
export * from './simulation-reports';
export * from './usage-records';

import { users } from './users';
import { organizations, organizationMembers } from './organizations';
import { projects } from './projects';
import { environments, targetVerifications } from './environments';
import { scenarios, scenarioVersions } from './scenarios';
import { simulations } from './simulations';
import { executionGroups, workerAssignments } from './execution-groups';
import { simulationEvents } from './simulation-events';
import { metricAggregates } from './metric-aggregates';
import { simulationReports } from './simulation-reports';
import { usageRecords } from './usage-records';

export const tables = {
  users,
  organizations,
  organizationMembers,
  projects,
  environments,
  targetVerifications,
  scenarios,
  scenarioVersions,
  simulations,
  executionGroups,
  workerAssignments,
  simulationEvents,
  metricAggregates,
  simulationReports,
  usageRecords,
} as const;
