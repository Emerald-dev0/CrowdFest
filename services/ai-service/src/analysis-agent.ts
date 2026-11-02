/**
 * Analysis Agent (spec §5.1, §11.2).
 * Examines completed test results and generates explanations, likely
 * bottlenecks, and recommendations. Distinguishes measured facts from hypotheses.
 */

export interface AnalysisResult {
  observations: Array<{
    type: 'fact' | 'hypothesis';
    description: string;
    evidence: string[];
  }>;
  likelyBottlenecks: Array<{
    area: string;
    confidence: 'low' | 'medium' | 'high';
    description: string;
  }>;
  recommendations: string[];
}

export class AnalysisAgent {
  analyze(result: any): AnalysisResult {
    const observations: AnalysisResult['observations'] = [];
    const likelyBottlenecks: AnalysisResult['likelyBottlenecks'] = [];
    const recommendations: AnalysisResult['recommendations'] = [];

    // Measured facts
    if (result.latency) {
      observations.push({
        type: 'fact',
        description: `P95 latency was ${result.latency.p95Ms?.toFixed(0) ?? 'N/A'}ms`,
        evidence: [`p95_latency_ms: ${result.latency.p95Ms}`],
      });
    }
    if (result.errors) {
      observations.push({
        type: 'fact',
        description: `Error rate was ${(result.errors.rate * 100).toFixed(2)}%`,
        evidence: [`error_rate: ${result.errors.rate}`],
      });
    }

    // Hypotheses - clearly distinguished from facts (spec §11.2)
    if (result.latency && result.latency.p95Ms && result.latency.p95Ms > 500) {
      likelyBottlenecks.push({
        area: 'database',
        confidence: 'medium',
        description: 'Dashboard database queries may be slow under load',
      });
      recommendations.push('Examine dashboard database queries, connection pool saturation, and downstream service latency');
    }

    if (result.errors && result.errors.rate > 0.05) {
      likelyBottlenecks.push({
        area: 'authentication',
        confidence: 'medium',
        description: 'Authentication may be a bottleneck under concurrent load',
      });
      recommendations.push('Review login endpoint throughput and session handling');
    }

    // Distinguish: observation is not proof of root cause (spec §11.2)
    observations.push({
      type: 'hypothesis',
      description: 'The latency increase may be caused by database connection pool saturation',
      evidence: ['P95 latency increased during later workload stage'],
    });

    return { observations, likelyBottlenecks, recommendations };
  }
}

export const analysisAgent = new AnalysisAgent();
