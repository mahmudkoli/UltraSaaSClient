export const environment = {
  production: false,
  apiUrl: 'https://localhost:5001',
  appName: 'MK Corex POS',
  version: '1.0.0',
  // 'subdomain' = auto-detect from URL (prod), 'manual' = show tenant field (dev)
  tenantStrategy: 'manual' as 'subdomain' | 'manual',
  // Base domain for subdomain extraction (e.g., 'ultrasaas.com' extracts 'acme' from 'acme.ultrasaas.com')
  baseDomain: 'localhost',
  // Show the demo-tenant quick-fill dropdown on sign-in. Never enable in prod.
  demoLogins: true,
};