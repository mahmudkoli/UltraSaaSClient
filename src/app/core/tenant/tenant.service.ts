import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TenantService {
    private readonly STORAGE_KEY = 'tenant_id';

    /**
     * Resolve the current tenant ID based on the configured strategy.
     * - 'subdomain': extracts from URL (e.g., acme.ultrasaas.com → acme)
     * - 'manual': reads from localStorage (user entered on login)
     */
    resolve(): string | null {
        if (environment.tenantStrategy === 'subdomain') {
            return this.fromSubdomain() ?? this.fromStorage();
        }
        return this.fromStorage();
    }

    /**
     * Extract tenant from subdomain.
     * e.g., acme.ultrasaas.com → 'acme'
     * Returns null if on the base domain or localhost without subdomain.
     */
    fromSubdomain(): string | null {
        const hostname = window.location.hostname; // e.g., pos-electroplus.mkcorex.com
        const baseDomain = environment.baseDomain;

        if (!hostname.endsWith(baseDomain) || hostname === baseDomain) {
            return null;
        }

        let subdomain = hostname.slice(0, hostname.length - baseDomain.length - 1);

        const prefix = (environment as { subdomainPrefix?: string }).subdomainPrefix;
        if (prefix && subdomain.startsWith(prefix)) {
            subdomain = subdomain.slice(prefix.length);
        }

        return subdomain || null;
    }

    fromStorage(): string | null {
        return localStorage.getItem(this.STORAGE_KEY);
    }

    save(tenantId: string): void {
        localStorage.setItem(this.STORAGE_KEY, tenantId);
    }

    clear(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    /**
     * Whether the tenant field should be shown on the login page.
     * Hidden when subdomain strategy resolves a tenant automatically.
     */
    get showTenantField(): boolean {
        if (environment.tenantStrategy === 'subdomain') {
            return !this.fromSubdomain();
        }
        // In manual mode, hide if tenant is already saved (return visit)
        return !this.fromStorage();
    }

    /**
     * Whether the user can switch tenant (show "Switch organization" link).
     */
    get canSwitchTenant(): boolean {
        return !this.showTenantField;
    }

    get strategy(): string {
        return environment.tenantStrategy;
    }
}
