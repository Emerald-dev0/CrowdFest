/**
 * k6 script generator (spec §6.2).
 * Compiles an HTTP workflow into a k6 test script string.
 */

import { CompiledHttpScript } from './compiler';

export function generateK6Script(script: CompiledHttpScript, envVar = 'BASE_URL'): string {
  const lines: string[] = [
    `import http from 'k6/http';`,
    `import { check, sleep } from 'k6';`,
    ``,
    `export const options = {`,
    `  thresholds: {`,
    `    http_req_duration: ['p(95) < ${script.thinkTimeMs.max * 10}'],`,
    `    http_req_failed: ['rate < 0.05'],`,
    `  },`,
    `};`,
    ``,
    `export default function () {`,
  ];

  for (const endpoint of script.endpoints) {
    const url = `\${__ENV.${envVar}}${endpoint.path}`;
    lines.push(`  const res = http.${endpoint.method.toLowerCase()}('${url}', ${endpoint.body ? JSON.stringify(endpoint.body) : 'null'}, {`);
    lines.push(`    headers: ${JSON.stringify(endpoint.headers ?? {})},`);
    lines.push(`  });`);
    const statuses = Array.isArray(endpoint.expectStatus) ? endpoint.expectStatus.join(',') : String(endpoint.expectStatus);
    lines.push(`  check(res, { 'status is ${statuses}': (r) => [${statuses}].includes(r.status) });`);
    lines.push(`  sleep(${script.thinkTimeMs.min / 1000} + Math.random() * ${(script.thinkTimeMs.max - script.thinkTimeMs.min) / 1000});`);
    lines.push(``);
  }

  lines.push(`}`);
  return lines.join('\n');
}
