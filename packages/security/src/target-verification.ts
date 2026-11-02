/**
 * Target verification (spec §10.1).
 * Ensures users can only test targets they control or are authorized to test.
 */

export type VerificationMethod = 'dns_txt' | 'http_challenge' | 'manual';

export interface TargetVerification {
  id: string;
  environmentId: string;
  status: 'pending' | 'verified' | 'failed';
  method: VerificationMethod;
  token?: string;
  verifiedAt?: Date;
  createdAt: Date;
}

export function isTargetVerified(verification: TargetVerification): boolean {
  return verification.status === 'verified';
}

export function generateChallengeToken(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64url');
}

export function buildDnsTxtRecord(token: string): string {
  return `crowdfest-verification=${token}`;
}

export function buildHttpChallengePath(token: string): string {
  return `/.well-known/crowdfest-verification/${token}`;
}
