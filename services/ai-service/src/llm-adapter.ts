/**
 * Provider-agnostic LLM adapter (spec §5).
 * Supports OpenAI, Anthropic, or a mock provider for local development.
 */

import { loadConfig } from '@crowdfest/config';

export type Message = { role: 'system' | 'user' | 'assistant'; content: string };

export interface LLMResponse {
  content: string;
  usage?: { promptTokens: number; completionTokens: number };
}

export class LLMAdapter {
  private config: ReturnType<typeof loadConfig>;

  constructor() {
    this.config = loadConfig();
  }

  async complete(messages: Message[], options?: { temperature?: number; maxTokens?: number }): Promise<LLMResponse> {
    if (this.config.aiProvider === 'mock') {
      return this.mockComplete(messages);
    }

    if (this.config.aiProvider === 'openai') {
      return this.openaiComplete(messages, options);
    }

    if (this.config.aiProvider === 'anthropic') {
      return this.anthropicComplete(messages, options);
    }

    return this.mockComplete(messages);
  }

  private async mockComplete(messages: Message[]): Promise<LLMResponse> {
    // Simulate a realistic LLM response for development without an API key
    const lastUser = messages[messages.length - 1];
    const content = this.generateMockScenario(lastUser.content);
    return {
      content,
      usage: { promptTokens: lastUser.content.length / 4, completionTokens: content.length / 4 },
    };
  }

  private async openaiComplete(messages: Message[], options?: { temperature?: number; maxTokens?: number }): Promise<LLMResponse> {
    if (!this.config.aiApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.aiApiKey}`,
      },
      body: JSON.stringify({
        model: this.config.aiModel,
        messages,
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens ?? 2000,
      }),
    });
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    const data = await response.json() as any;
    return {
      content: data.choices[0].message.content,
      usage: data.usage ? { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens } : undefined,
    };
  }

  private async anthropicComplete(messages: Message[], options?: { temperature?: number; maxTokens?: number }): Promise<LLMResponse> {
    if (!this.config.aiApiKey) {
      throw new Error('Anthropic API key not configured');
    }
    const systemMsg = messages.find((m) => m.role === 'system');
    const userMsgs = messages.filter((m) => m.role !== 'system');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.aiApiKey!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.aiModel,
        system: systemMsg?.content,
        messages: userMsgs,
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens ?? 2000,
      }),
    });
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }
    const data = await response.json() as any;
    return {
      content: data.content[0].text,
      usage: { promptTokens: data.usage?.input_tokens ?? 0, completionTokens: data.usage?.output_tokens ?? 0 },
    };
  }

  private generateMockScenario(description: string): string {
    // Generate a plausible structured scenario for local development
    const lower = description.toLowerCase();
    const steps: string[] = [];
    if (lower.includes('register') || lower.includes('signup') || lower.includes('sign up')) {
      steps.push('navigate to registration page', 'fill registration form', 'submit registration', 'wait for welcome message');
    }
    if (lower.includes('login') || lower.includes('sign in')) {
      steps.push('navigate to login page', 'fill login credentials', 'submit login', 'wait for dashboard');
    }
    if (lower.includes('dashboard')) {
      steps.push('view dashboard', 'verify dashboard loads');
    }
    if (lower.includes('cart') || lower.includes('checkout') || lower.includes('store')) {
      steps.push('browse products', 'search for items', 'add to cart', 'proceed to checkout');
    }
    if (steps.length === 0) {
      steps.push('open homepage', 'navigate application', 'verify content appears');
    }

    return JSON.stringify({
      scenario: 'generated_journey',
      steps: steps.map((s, i) => ({
        id: `step_${i + 1}`,
        action: s.includes('navigate') ? 'navigate' : s.includes('fill') ? 'fill' : s.includes('submit') || s.includes('click') ? 'click' : s.includes('wait') || s.includes('verify') ? 'assert' : 'navigate',
        target: s.includes('registration') ? '/register' : s.includes('login') ? '/login' : s.includes('dashboard') ? '/dashboard' : '/',
        data: s.includes('fill') ? 'test_account_details' : undefined,
        assertionType: s.includes('verify') || s.includes('wait') ? 'element_visible' : undefined,
      })),
      assertions: [{ type: 'element_visible', target: 'main_content' }],
      executionType: 'browser+http',
      successCondition: 'All steps complete without errors',
    }, null, 2);
  }
}

export const llmAdapter = new LLMAdapter();
