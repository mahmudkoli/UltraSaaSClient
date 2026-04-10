import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FuseConfigService } from '@fuse/services/config';
import { TenantService } from './tenant.service';

export interface ThemeConfig {
    scheme: 'light' | 'dark' | 'auto';
    theme: string;
    layout: string;
}

const DEFAULT_THEME: ThemeConfig = {
    scheme: 'light',
    theme: 'theme-default',
    layout: 'classy',
};

@Injectable({ providedIn: 'root' })
export class TenantThemeService {
    private readonly baseUrl = `${environment.apiUrl}/api/tenants`;
    private readonly CACHE_PREFIX = 'tenant_theme_';

    constructor(
        private http: HttpClient,
        private fuseConfigService: FuseConfigService,
        private tenantService: TenantService,
    ) {}

    /**
     * Fetch theme from backend (anonymous, no auth needed).
     */
    fetchTheme(tenantId: string): Observable<ThemeConfig | null> {
        return this.http.get<string>(`${this.baseUrl}/${tenantId}/theme`).pipe(
            tap(json => {
                if (json) {
                    const config = typeof json === 'string' ? JSON.parse(json) : json;
                    this.cacheTheme(tenantId, config);
                }
            }),
            catchError(() => of(null))
        ) as Observable<ThemeConfig | null>;
    }

    /**
     * Save theme to backend (requires auth).
     */
    saveTheme(tenantId: string, config: ThemeConfig): Observable<string> {
        return this.http.put<any>(`${this.baseUrl}/${tenantId}/theme`, config).pipe(
            tap(() => this.cacheTheme(tenantId, config))
        );
    }

    /**
     * Apply theme config to Fuse.
     */
    applyTheme(config: ThemeConfig | null): void {
        if (!config) return;
        this.fuseConfigService.config = {
            scheme: config.scheme,
            theme: config.theme,
            layout: config.layout,
        };
    }

    /**
     * Load and apply theme for current tenant.
     * Uses cache first for instant load, then refreshes from API.
     */
    loadAndApply(): void {
        const tenantId = this.tenantService.resolve();
        if (!tenantId) return;

        // Apply cached theme immediately (no flash)
        const cached = this.getCachedTheme(tenantId);
        if (cached) {
            this.applyTheme(cached);
        }

        // Fetch fresh from API and update
        this.fetchTheme(tenantId).subscribe(result => {
            if (result) {
                const config = typeof result === 'string' ? JSON.parse(result as string) : result;
                this.applyTheme(config);
            }
        });
    }

    /**
     * Get current applied theme (from cache or default).
     */
    getCurrentTheme(): ThemeConfig {
        const tenantId = this.tenantService.resolve();
        if (tenantId) {
            return this.getCachedTheme(tenantId) || DEFAULT_THEME;
        }
        return DEFAULT_THEME;
    }

    private cacheTheme(tenantId: string, config: ThemeConfig): void {
        localStorage.setItem(this.CACHE_PREFIX + tenantId, JSON.stringify(config));
    }

    private getCachedTheme(tenantId: string): ThemeConfig | null {
        const cached = localStorage.getItem(this.CACHE_PREFIX + tenantId);
        return cached ? JSON.parse(cached) : null;
    }
}
