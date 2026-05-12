export const environment = {
  production: true,
  apiUrl: 'https://pos-api.mahmudkoli.com',
  appName: 'UltraPOS Client',
  version: '1.0.0',
  tenantStrategy: 'subdomain' as 'subdomain' | 'manual',
  baseDomain: 'mahmudkoli.com',
  // Stripped from the subdomain before tenant lookup.
  // pos-electroplus.mahmudkoli.com → 'pos-electroplus' → strip 'pos-' → 'electroplus'
  // pos-root.mahmudkoli.com → 'pos-root' → strip 'pos-' → 'root' (the admin tenant)
  subdomainPrefix: 'pos-',
  // This deploy IS a public demo, so the quick-fill dropdown is intentional.
  // Disable when shipping real customer data.
  demoLogins: true,
};
