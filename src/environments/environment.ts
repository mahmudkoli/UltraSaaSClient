export const environment = {
  production: false,
  apiUrl: 'https://localhost:5001',
  appName: 'Ultra Edu by MKCoreX',
  version: '1.0.0',
  // 'subdomain' = auto-detect from URL (prod), 'manual' = show tenant field (dev)
  tenantStrategy: 'manual' as 'subdomain' | 'manual',
  // Base domain for subdomain extraction (e.g., 'mkcorex.com' extracts 'greenwood' from 'edu-greenwood.mkcorex.com')
  baseDomain: 'localhost',
  // Show the demo-login quick-fill dropdown on the sign-in page (demo deploys only).
  demoLogins: true,
}; 