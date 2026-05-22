import { Injectable, signal } from '@angular/core';
import { Observable, of, shareReplay, tap } from 'rxjs';
import { BaseApiService } from '../services/base-api.service';

/**
 * Mirrors `Domain.Common.Enums.CurrencyDescriptor` from the backend.
 */
export interface CurrencyDescriptor {
    code: string;
    name: string;
    symbol: string;
    isPrimary: boolean;
}

/**
 * Phase v1-O — single source of truth for "what currencies does the platform
 * support" and "what's the current tenant's currency." Hits /api/currencies
 * (static list, cached for the session) and /api/currencies/current (cheap
 * but tenant-scoped, refreshed lazily). All BDT/৳ hardcoding in templates
 * is meant to be replaced by the `currency` pipe sitting on top of this.
 */
@Injectable({ providedIn: 'root' })
export class CurrencyService extends BaseApiService {
    /** Reactive snapshot of the current tenant's descriptor (or platform primary
     * when no tenant is in scope). Consumed by the `currency` pipe synchronously. */
    readonly current = signal<CurrencyDescriptor | null>(null);

    /** Static registry, cached once per session. */
    readonly all = signal<readonly CurrencyDescriptor[]>([]);

    private _all$?: Observable<CurrencyDescriptor[]>;
    private _current$?: Observable<CurrencyDescriptor>;

    /** Load `/api/currencies` once and share across all callers in this session. */
    list(): Observable<CurrencyDescriptor[]> {
        if (!this._all$) {
            this._all$ = this.get<CurrencyDescriptor[]>('/api/currencies').pipe(
                tap(list => this.all.set(list)),
                shareReplay({ bufferSize: 1, refCount: false }),
            );
        }
        return this._all$;
    }

    /** Load `/api/currencies/current` once per tenant context. Call refresh() after login/tenant switch. */
    loadCurrent(): Observable<CurrencyDescriptor> {
        if (!this._current$) {
            this._current$ = this.get<CurrencyDescriptor>('/api/currencies/current').pipe(
                tap(d => this.current.set(d)),
                shareReplay({ bufferSize: 1, refCount: false }),
            );
        }
        return this._current$;
    }

    /** Invalidate the cached "current" lookup — call from auth-success / tenant-switch hooks. */
    refresh(): void {
        this._current$ = undefined;
        this.current.set(null);
    }

    /** Synchronous helper: format an amount using the tenant's current symbol.
     * Falls back to the bare number when the descriptor hasn't loaded yet (rare;
     * the auth flow primes it before first paint). */
    format(amount: number | null | undefined, opts?: { fractionDigits?: number }): string {
        if (amount == null) return '';
        const d = this.current();
        const digits = opts?.fractionDigits ?? 2;
        const num = amount.toLocaleString(undefined, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
        });
        return d ? `${d.symbol} ${num}` : num;
    }

    /** For places that need to render a price in a specific (non-current) currency,
     * e.g. platform-admin plan-list showing every currency for one plan. */
    formatIn(code: string, amount: number | null | undefined, opts?: { fractionDigits?: number }): string {
        if (amount == null) return '';
        const d = this.all().find(c => c.code === code);
        const digits = opts?.fractionDigits ?? 2;
        const num = amount.toLocaleString(undefined, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
        });
        return d ? `${d.symbol} ${num}` : `${code} ${num}`;
    }

    /** Resolve a descriptor synchronously from the cached registry. */
    descriptor(code: string | null | undefined): CurrencyDescriptor | undefined {
        if (!code) return undefined;
        const up = code.trim().toUpperCase();
        return this.all().find(c => c.code === up);
    }
}
