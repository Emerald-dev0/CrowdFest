/**
 * Shared API request/response contracts (spec §9).
 * These are consumed by apps/api (Fastify) and apps/web (Next.js).
 */

import { z } from 'zod';
import { SimulationConfigSchema } from './simulation';
import { ScenarioDefinitionSchema } from './scenario';
import { SimulationEventSchema } from './metric';

export const CreateProjectSchema = z.object({
  name: z.string().min(1),
});

export const CreateEnvironmentSchema = z.object({
  name: z.string().min(1),
  baseUrl: z.string().url(),
});

export const VerifyTargetSchema = z.object({
  environmentId: z.string().uuid(),
});

export const CreateScenarioSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
});

export const GenerateJourneySchema = z.object({
  scenarioId: z.string().uuid(),
  description: z.string().min(1),
});

export const ApproveScenarioSchema = z.object({
  scenarioVersionId: z.string().uuid(),
});

export const CreateSimulationSchema = z.object({
  projectId: z.string().uuid(),
  scenarioVersionId: z.string().uuid(),
  name: z.string().min(1),
  config: SimulationConfigSchema,
});

export const SimulationResponseSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  scenarioVersionId: z.string().uuid(),
  name: z.string(),
  status: z.string(),
  createdAt: z.string().datetime(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type CreateEnvironmentInput = z.infer<typeof CreateEnvironmentSchema>;
export type CreateScenarioInput = z.infer<typeof CreateScenarioSchema>;
export type GenerateJourneyInput = z.infer<typeof GenerateJourneySchema>;
export type ApproveScenarioInput = z.infer<typeof ApproveScenarioSchema>;
export type CreateSimulationInput = z.infer<typeof CreateSimulationSchema>;
export type SimulationResponse = z.infer<typeof SimulationResponseSchema>;
