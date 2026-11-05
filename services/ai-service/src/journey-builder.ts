/**
 * Journey Builder (spec §5.1).
 * Converts planned journeys into structured steps, assertions, and data
 * requirements (the ScenarioDefinition intermediate representation).
 */

import { ScenarioDefinition, JourneyStep } from '@crowdfest/scenario-dsl';
import { z } from 'zod';

const BuilderOutputSchema = z.object({
  scenario: z.string(),
  steps: z.array(z.object({
    id: z.string(),
    action: z.enum(['navigate', 'click', 'fill', 'wait', 'assert', 'extract', 'request', 'check', 'sleep']),
    target: z.string(),
    data: z.string().optional(),
    assertionType: z.enum(['element_visible', 'element_hidden', 'text_contains', 'url_matches', 'status_equals']).optional(),
  })),
  assertions: z.array(z.object({
    type: z.enum(['element_visible', 'element_hidden', 'text_contains', 'url_matches', 'status_equals']),
    target: z.string(),
  })),
  executionType: z.enum(['browser', 'http', 'browser+http']),
  successCondition: z.string().optional(),
});

export type BuilderOutput = z.infer<typeof BuilderOutputSchema>;

export class JourneyBuilder {
  async build(journey: {
    name: string;
    description: string;
    executionType: string;
    steps: string[];
    assertions: string[];
  }): Promise<ScenarioDefinition> {
    const systemPrompt = `You are a journey builder for an AI crowd simulation platform.
Convert a planned user journey into a structured, executable scenario definition.

Return ONLY valid JSON matching this schema:
{
  "scenario": "string",
  "steps": [
    { "id": "string", "action": "navigate"|"click"|"fill"|"wait"|"assert"|"extract", "target": "string", "data": "string?", "assertionType": "element_visible"|"element_hidden"|"text_contains"|"url_matches"|"status_equals"? }
  ],
  "assertions": [
    { "type": "element_visible"|"element_hidden"|"text_contains"|"url_matches"|"status_equals", "target": "string" }
  ],
  "executionType": "browser"|"http"|"browser+http",
  "successCondition": "string?"
}

Guidelines:
- The AI must not invent selectors, assume an endpoint exists, or silently change the intended workflow.
- It should flag uncertain steps and ask for clarification (mark them with a comment-like target).
- Each step maps to an executable browser or HTTP action.
- Keep step IDs unique and stable.`;

    let data: any;
    try {
      const res = await fetch('http://localhost:3002/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          userPrompt: `Journey: ${journey.name}\nDescription: ${journey.description}\nExecution type: ${journey.executionType}\nSteps: ${journey.steps.join(', ')}\nAssertions: ${journey.assertions.join(', ')}`,
        }),
      });
      data = await res.json();
    } catch {
      // If no AI server, generate locally
      return this.localBuild(journey);
    }

    try {
      const parsed = BuilderOutputSchema.parse(data);
      const steps = parsed.steps.map((s, i) => ({
        id: s.id || `step_${i}`,
        action: s.action,
        target: s.target,
        data: s.data,
        assertionType: s.assertionType,
      }));
      if ((parsed.executionType === 'http' || parsed.executionType === 'browser+http') && !steps.some((st: any) => st.action === 'request' || st.action === 'check')) {
        steps.push({ id: 'http_load', action: 'request', target: '/', data: undefined, assertionType: undefined } as any);
      }
      return {
        scenario: parsed.scenario,
        steps,
        assertions: parsed.assertions,
        executionType: parsed.executionType as any,
        successCondition: parsed.successCondition,
      };
    } catch {
      return this.localBuild(journey);
    }
  }

  private localBuild(journey: {
    name: string;
    description: string;
    executionType: string;
    steps: string[];
    assertions: string[];
  }): ScenarioDefinition {
    const js: JourneyStep[] = journey.steps.map((step, i) => {
      const lower = step.toLowerCase();
      let action: JourneyStep['action'] = 'navigate';
      let target = '/';
      if (lower.includes('click') || lower.includes('submit')) action = 'click';
      if (lower.includes('fill') || lower.includes('enter')) action = 'fill';
      if (lower.includes('wait')) action = 'wait';
      if (lower.includes('verify') || lower.includes('check')) action = 'assert';
      if (lower.includes('registration') || lower.includes('register')) target = '/register';
      if (lower.includes('login')) target = '/login';
      if (lower.includes('dashboard')) target = '/dashboard';
      return { id: `step_${i}`, action, target };
    });

    const steps = [...js];
    if (((journey.executionType as string) === 'http' || (journey.executionType as string) === 'browser+http' || !journey.executionType) && !steps.some((st: any) => st.action === 'request' || st.action === 'check')) {
      steps.push({ id: 'http_load', action: 'request', target: '/', data: undefined, assertionType: undefined } as any);
    }
    return {
      scenario: journey.name,
      steps,
      assertions: journey.assertions.map((a) => ({ type: 'element_visible' as const, target: a })),
      executionType: (journey.executionType as any) || 'browser+http',
      successCondition: journey.description,
    };
  }
}

export const journeyBuilder = new JourneyBuilder();
