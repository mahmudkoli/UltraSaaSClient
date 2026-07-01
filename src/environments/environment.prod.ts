export const environment = {
  production: true,
  apiUrl: 'https://edu-api.mkcorex.com',
  appName: 'Ultra Edu by MKCoreX',
  version: '1.0.0',
  tenantStrategy: 'subdomain' as 'subdomain' | 'manual',
  baseDomain: 'mkcorex.com',
  subdomainPrefix: 'edu-',
  // The Edu prod deploy IS the demo site (demo-seed on) — show the quick-fill
  // dropdown. Flip to false when onboarding real schools with real data.
  demoLogins: true,
};
