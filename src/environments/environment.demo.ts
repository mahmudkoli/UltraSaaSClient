export const environment = {
  production: true,
  apiUrl: 'http://localhost:5000',  // Direct to backend — no IIS proxy needed
  appName: 'MK Corex HRM',
  version: '1.0.0',
  tenantStrategy: 'subdomain' as 'subdomain' | 'manual',
  baseDomain: 'ultrasaas.local',
  demoLogins: true,
};
