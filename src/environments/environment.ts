export const environment = {
  production: false,
  apiUrl: 'https://localhost:5001',
  appName: 'UltraSaaS Client',
  version: '1.0.0',
  // 'subdomain' = auto-detect from URL (prod), 'manual' = show tenant field (dev)
  tenantStrategy: 'manual' as 'subdomain' | 'manual',
  // Base domain for subdomain extraction (e.g., 'ultrasaas.com' extracts 'acme' from 'acme.ultrasaas.com')
  baseDomain: 'localhost',
}; 