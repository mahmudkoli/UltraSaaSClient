import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from 'environments/environment';

/**
 * Cache of the feature codes enabled for the current tenant. Loaded once at
 * app init alongside permissions; cleared on logout. Use <c>has(code)</c> in
 * components to gate UI for plan-tier features (e.g., 'CUSTOM_BRAND',
 * 'AI_ASSIST'). Server-side, the same gates are enforced via the
 * RequireTenantFeature attribute — this is the UI-visibility companion.
 */
@Injectable({ providedIn: 'root' })
export class FeaturesService {
    private readonly http = inject(HttpClient);

    private readonly _features = signal<string[] | null>(null);
    readonly features = this._features.asReadonly();

    load(): Observable<string[]> {
        return this.http
            .get<string[]>(`${environment.apiUrl}/api/personal/features`)
            .pipe(
                tap(list => this._features.set(list ?? [])),
                catchError(() => {
                    this._features.set([]);
                    return of<string[]>([]);
                }),
            );
    }

    has(code: string): boolean {
        const f = this._features();
        return !!f && f.includes(code);
    }

    clear(): void {
        this._features.set(null);
    }
}
