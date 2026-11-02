import { z } from 'zod';

export const JourneyStepSchema = z.object({
  action: z.enum([
    'navigate',
    'click',
    'fill',
    'wait',
    'assert',
    'extract',
  ]),
  target: z.string(),
  data: z.string().optional(),
  assertionType: z
    .enum(['element_visible', 'element_hidden', 'text_contains', 'url_matches', 'status_equals'])
    .optional(),
});

export type JourneyStep = z.infer<typeof JourneyStepSchema>;

export const ScenarioDefinitionSchema = z.object({
  scenario: z.string(),
  steps: z.array(JourneyStepSchema),
  assertions: z.array(
    z.object({
      type: z.enum([
        'element_visible',
        'element_hidden',
        'text_contains',
        'url_matches',
        'status_equals',
      ]),
      target: z.string(),
    })
  ),
  executionType: z.enum(['browser', 'http', 'browser+http']).default('browser+http'),
  successCondition: z.string().optional(),
  testAccounts: z.array(z.string()).optional(),
});

export type ScenarioDefinition = z.infer<typeof ScenarioDefinitionSchema>;

export const PersonaSchema = z.object({
  id: z.string(),
  name: z.string(),
  behaviour: z.string(),
  distribution: z.number().min(0).max(100),
});

export type Persona = z.infer<typeof PersonaSchema>;
