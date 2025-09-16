/**
 * Environment variables validation and configuration
 */

interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_APP_URL?: string;
  NEXT_PUBLIC_APP_NAME?: string;
}

function validateEnv(): EnvConfig {
  const config: EnvConfig = {
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  };

  // Optional environment variables
  if (process.env.NEXT_PUBLIC_APP_URL) {
    config.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.NEXT_PUBLIC_APP_NAME) {
    config.NEXT_PUBLIC_APP_NAME = process.env.NEXT_PUBLIC_APP_NAME;
  }

  return config;
}

export const env = validateEnv();

// Environment checks
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
