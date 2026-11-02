/**
 * Scenario Planner (spec §5.1).
 * Understands the developer's natural-language description and identifies
 * the required user journeys.
 */

import { LLMAdapter, llmAdapter } from './llm-adapter';
import { z } from 'zod';

const PlannerOutputSchema = z.object({
  journeys: z.array(z.object({
    name: z.string(),
    description: z.string(),
    executionType: z.enum(['browser', 'http', 'browser+http']),
    steps: z.array(z.string()),
    assertions: z.array(z.string()),
  })),
  personas: z.array(z.object({
    name: z.string(),
    behaviour: z.string(),
    distribution: z.number().min(0).max(100),
  })),
});

export type PlannerOutput = z.infer<typeof PlannerOutputSchema>;

export class ScenarioPlanner {
  private llm: LLMAdapter;

  constructor(llm?: LLMAdapter) {
    this.llm = llm ?? llmAdapter;
  }

  async plan(description: string): Promise<PlannerOutput> {
    const systemPrompt = `You are a scenario planner for an AI crowd simulation platform.
Given a developer's natural-language description of how users interact with their application,
identify the required user journeys, personas, and their distributions.

Return ONLY valid JSON matching this schema:
{
  "journeys": [
    { "name": "string", "description": "string", "executionType": "browser" | "http" | "browser+http", "steps": ["string"], "assertions": ["string"] }
  ],
  "personas": [
    { "name": "string", "behaviour": "string", "distribution": number }
  ]
}

Guidelines:
- AI should make testing easier, not make results less trustworthy.
- Realistic workloads matter more than impressive agent counts.
- Identify 2-5 distinct journeys.
- Persona distributions must sum to 100.
- Do not invent selectors or assume endpoints exist.`;

    const response = await this.llm.complete([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Developer description: "${description}"` },
    ], { temperature: 0.3 });

    try {
      const parsed = PlannerOutputSchema.parse(JSON.parse(response.content));
      return parsed;
    } catch {
      // Fallback: generate a sensible default plan
      return {
        journeys: [
          {
            name: 'User onboarding',
            description: description,
            executionType: 'browser+http',
            steps: ['Open homepage', 'Navigate to registration', 'Enter test account details', 'Submit registration', 'Wait for dashboard', 'Verify welcome message'],
            assertions: ['Dashboard displayed', 'Welcome message visible'],
          },
        ],
        personas: [
          { name: 'New visitor', behaviour: 'Homepage and registration', distribution: 60 },
          { name: 'Returning user', behaviour: 'Login and dashboard', distribution: 40 },
        ],
      };
    }
  }
}

export const scenarioPlanner = new ScenarioPlanner();
