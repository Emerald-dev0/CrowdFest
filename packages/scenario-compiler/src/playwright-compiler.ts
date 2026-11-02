/**
 * Playwright script generator (spec §6.1).
 * Compiles a browser workflow into a Playwright test script string.
 */

import { CompiledBrowserScript } from './compiler';

export function generatePlaywrightScript(script: CompiledBrowserScript, scenarioName = 'scenario'): string {
  const lines: string[] = [
    `import { test, expect } from '@playwright/test';`,
    ``,
    `test('${scenarioName}', async ({ page }) => {`,
  ];

  lines.push(`  // Think time: ${script.thinkTimeMs.min}ms - ${script.thinkTimeMs.max}ms`);
  lines.push(`  const thinkTime = () => ${script.thinkTimeMs.min} + Math.random() * (${script.thinkTimeMs.max} - ${script.thinkTimeMs.min});`);
  lines.push(``);

  for (const step of script.steps) {
    switch (step.type) {
      case 'navigate':
        lines.push(`  await page.goto('${step.url}');`);
        lines.push(`  await page.waitForLoadState('domcontentloaded');`);
        break;
      case 'click':
        lines.push(`  await page.click('${step.selector}');`);
        break;
      case 'fill':
        lines.push(`  await page.fill('${step.selector}', '${step.value.replace(/'/g, "\\'")}');`);
        break;
      case 'wait':
        if (step.ms) {
          lines.push(`  await page.waitForTimeout(${step.ms});`);
        } else if (step.selector) {
          lines.push(`  await page.waitForSelector('${step.selector}');`);
        }
        break;
      case 'assert':
        if (step.condition === 'visible') {
          lines.push(`  await expect(page.locator('${step.selector}')).toBeVisible();`);
        } else if (step.condition === 'hidden') {
          lines.push(`  await expect(page.locator('${step.selector}')).toBeHidden();`);
        } else if (step.condition === 'text_contains') {
          lines.push(`  await expect(page.locator('${step.selector}')).toContainText('${step.value?.replace(/'/g, "\\'") ?? ''}');`);
        }
        break;
      case 'extract':
        lines.push(`  const extracted = await page.locator('${step.selector}').${step.attribute ? `getAttribute('${step.attribute}')` : 'textContent'}();`);
        break;
      case 'sleep':
        lines.push(`  await page.waitForTimeout(${step.ms});`);
        break;
    }
    lines.push(`  await page.waitForTimeout(thinkTime());`);
  }

  for (const assertion of script.assertions) {
    if (assertion.type === 'element_visible') {
      lines.push(`  await expect(page.locator('${assertion.target}')).toBeVisible();`);
    }
  }

  lines.push(`});`);
  return lines.join('\n');
}
