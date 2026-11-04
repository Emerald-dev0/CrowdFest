/**
 * Shared environment configuration.
 */

export interface AppConfig {
  port: number;
  databaseUrl: string;
  redisUrl: string;
  aiProvider: 'openai' | 'anthropic' | 'mock';
  aiApiKey?: string;
  aiModel: string;
  s3Endpoint?: string;
  s3Bucket?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  environment: 'development' | 'staging' | 'production';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export function loadConfig(): AppConfig {
  return {
    port: Number(process.env.PORT) || 3001,
    databaseUrl: process.env.DATABASE_URL || 'postgresql://crowdfest:crowdfest@localhost:5432/crowdfest',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    aiProvider: (process.env.AI_PROVIDER as AppConfig['aiProvider']) || 'mock',
    aiApiKey: process.env.AI_API_KEY,
    aiModel: process.env.AI_MODEL || 'gpt-4',
    s3Endpoint: process.env.S3_ENDPOINT,
    s3Bucket: process.env.S3_BUCKET,
    s3AccessKey: process.env.S3_ACCESS_KEY,
    s3SecretKey: process.env.S3_SECRET_KEY,
    environment: (process.env.NODE_ENV as AppConfig['environment']) || 'development',
    logLevel: (process.env.LOG_LEVEL as AppConfig['logLevel']) || 'info',
  };
}

export function parseRedisUrl(url: string): { host: string; port: number } {
  try {
    const u = new URL(url);
    return { host: u.hostname || 'localhost', port: Number(u.port) || 6379 };
  } catch {
    return { host: 'localhost', port: 6379 };
  }
}
