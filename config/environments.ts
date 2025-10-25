export interface Environment {
  name: string;
  baseURL: string;
  timeout: number;
  retries: number;
}

export const environments: Record<string, Environment> = {
  dev: {
    name: 'Development',
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 30000,
    retries: 1,
  },
  staging: {
    name: 'Staging',
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 30000,
    retries: 2,
  },
  prod: {
    name: 'Production',
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 30000,
    retries: 2,
  },
};

export function getEnvironment(env: string = 'dev'): Environment {
  const environment = environments[env];
  if (!environment) {
    throw new Error(`Environment "${env}" not found. Available: ${Object.keys(environments).join(', ')}`);
  }
  return environment;
}
