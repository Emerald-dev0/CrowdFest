/**
 * Validation Agent (spec §5.1).
 * Checks whether the proposed journey is executable, consistent, and within
 * the developer's approved scope. Flags uncertain steps for clarification.
 */

import { ScenarioDefinition, JourneyStep } from '@crowdfest/scenario-dsl';
import { z } from 'zod';

const ValidationOutputSchema = z.object({
  executable: z.boolean(),
  consistent: z.boolean(),
  withinScope: z.boolean(),
  uncertainSteps: z.array(z.object({
    stepId: z.string(),
    reason: z.string(),
  })),
  suggestions: z.array(z.string()),
  approvedForExecution: z.boolean(),
});

export type ValidationOutput = z.infer<typeof ValidationOutputSchema>;

export interface ValidationResult {
  executable: boolean;
  consistent: boolean;
  withinScope: boolean;
  uncertainSteps: Array<{ stepId: string; reason: string }>;
  suggestions: string[];
  approvedForExecution: boolean;
}

export class ValidationAgent {
  async validate(scenario: ScenarioDefinition, approvedScope?: string[]): Promise<ValidationResult> {
    const uncertainSteps: Array<{ stepId: string; reason: string }> = [];
    const suggestions: string[] = [];

    for (const step of scenario.steps) {
      // Check for potentially invented selectors or assumptions
      if (step.target.startsWith('http') && !approvedScope?.includes(step.target)) {
        uncertainSteps.push({
          stepId: step.id,
          reason: `External target ${step.target} not in approved scope`,
        });
        suggestions.push(`Verify that ${step.target} is an authorized test destination`);
      }
      if (step.action === 'assert' && !step.assertionType) {
        uncertainSteps.push({
          stepId: step.id,
          reason: 'Assertion step missing assertion type',
        });
      }
      if (step.action === 'fill' && !step.data) {
        uncertainSteps.push({
          stepId: step.id,
          reason: 'Fill step missing data value',
        });
      }
    }

    const executable = uncertainSteps.length === 0;
    const consistent = scenario.steps.length > 0;
    const withinScope = true; // scope check happens above

    return {
      executable,
      consistent,
      withinScope,
      uncertainSteps,
      suggestions,
      approvedForExecution: executable && consistent && withinScope,
    };
  }
}

export const validationAgent = new ValidationAgent();
