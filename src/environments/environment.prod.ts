export const environment = {
  production: true,
  apiUrl: 'https://pos-api.mkcorex.com',
  appName: 'MK Corex POS',
  version: '1.0.0',
  tenantStrategy: 'subdomain' as 'subdomain' | 'manual',
  baseDomain: 'mkcorex.com',
  // Stripped from the subdomain before tenant lookup.
  // pos-electroplus.mkcorex.com → 'pos-electroplus' → strip 'pos-' → 'electroplus'
  // pos-root.mkcorex.com → 'pos-root' → strip 'pos-' → 'root' (the admin tenant)
  subdomainPrefix: 'pos-',
  // This deploy IS a public demo, so the quick-fill dropdown is intentional.
  // Disable when shipping real customer data.
  demoLogins: true,
};
