/**
 * Journey step DSL (spec §3.2, §5.2).
 * A structured, executable step that the browser worker or k6 worker can run.
 */

export type JourneyAction =
  | 'navigate'
  | 'click'
  | 'fill'
  | 'wait'
  | 'assert'
  | 'extract'
  | 'sleep'
  | 'request'
  | 'check';

export type JourneyAssertionType =
  | 'element_visible'
  | 'element_hidden'
  | 'text_contains'
  | 'url_matches'
  | 'status_equals'
  | 'status_in_range';

export interface JourneyStep {
  /** Unique step id within the scenario */
  id: string;
  /** Action to perform */
  action: JourneyAction;
  /** Target selector, URL, or field name */
  target: string;
  /** Optional data to fill/submit */
  data?: string;
  /** Optional assertion type for assert actions */
  assertionType?: JourneyAssertionType;
  /** Optional think/sleep ms */
  sleepMs?: number;
  /** Whether this step is required for success */
  critical?: boolean;
}

export interface JourneyStepResult {
  stepId: string;
  action: JourneyAction;
  success: boolean;
  durationMs: number;
  error?: string;
  evidence?: Record<string, unknown>;
}

export function isBrowserAction(action: JourneyAction): boolean {
  return ['navigate', 'click', 'fill', 'wait', 'assert', 'extract', 'sleep'].includes(action);
}

export function isHttpAction(action: JourneyAction): boolean {
  return ['request', 'check', 'sleep'].includes(action);
}
