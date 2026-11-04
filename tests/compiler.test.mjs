import test from 'node:test';
import assert from 'node:assert/strict';
import { compileScenario } from '../packages/scenario-compiler/dist/index.js';

test('compiles http scenario', () => {
  const scenario = {
    scenario: 't',
    steps: [{ action: 'request', target: '/api', data: undefined }],
    assertions: [],
    executionType: 'http',
  };
  const out = compileScenario(scenario, { baseUrl: 'https://example.com' });
  assert.ok(out.httpScript);
  assert.equal(out.httpScript.baseUrl, 'https://example.com');
});
