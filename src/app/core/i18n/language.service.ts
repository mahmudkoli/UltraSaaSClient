import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { catchError, of, tap } from 'rxjs';
import { environment } from 'environments/environment';

export type SupportedLang = 'en' | 'bn';
const STORAGE_KEY = 'lang';
const DEFAULT: SupportedLang = 'en';

/**
 * Phase 2.58 — UI-language resolution + persistence.
 *
 * Bootstrap (APP_INITIALIZER, pre-auth): `resolveBootLang()` reads
 * localStorage so the user's last choice survives a refresh without a
 * flash of English.
 *
 * Post-auth (`initialDataResolver`): `applyFromServer(userPref, tenantDefault)`
 * picks user.preferredLanguage > tenant.defaultLanguage > 'en' and swaps
 * the active language if it differs from the boot guess. Server wins on
 * conflict so a user signing in on a fresh device adopts their saved
 * preference.
 *
 * User toggle (top-right picker): `setActiveLang(lang)` switches transloco,
 * caches in localStorage, and PATCHes /api/personal/profile so the choice
 * follows the user across devices. Fire-and-forget — UI does not block
 * on the round-trip.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
    private readonly _transloco = inject(TranslocoService);
    private readonly _http = inject(HttpClient);

    private readonly _active = signal<SupportedLang>(DEFAULT);
    readonly active = this._active.asReadonly();
    readonly isBangla = computed(() => this._active() === 'bn');

    /** Pre-auth boot — synchronous, safe to call in APP_INITIALIZER. */
    resolveBootLang(): SupportedLang {
        return this.coerce(safeReadLocalStorage(STORAGE_KEY)) ?? DEFAULT;
    }

    /**
     * Post-auth — apply the server-side preference. Called once per login
     * from `initialDataResolver` after the profile + tenant-info fetches
     * resolve. Idempotent.
     */
    applyFromServer(userPreferred: string | null | undefined, tenantDefault: string | null | undefined): void {
        const chosen = this.coerce(userPreferred) ?? this.coerce(tenantDefault) ?? DEFAULT;
        this.apply(chosen, /* persistServer */ false);
    }

    /**
     * User clicked the top-right picker. Updates transloco, localStorage,
     * and (best-effort) the server so other devices pick it up next sign-in.
     */
    setActiveLang(lang: string): void {
        const coerced = this.coerce(lang) ?? DEFAULT;
        this.apply(coerced, /* persistServer */ true);
    }

    // ---------------------------------------------------------------------

    private apply(lang: SupportedLang, persistServer: boolean): void {
        if (this._active() !== lang) {
            this._active.set(lang);
        }
        if (this._transloco.getActiveLang() !== lang) {
            this._transloco.setActiveLang(lang);
        }
        safeWriteLocalStorage(STORAGE_KEY, lang);
        if (persistServer) {
            this.persistToServer(lang).subscribe();
        }
    }

    private persistToServer(lang: SupportedLang) {
        // PATCH-via-PUT: send only what the profile endpoint needs to round-trip
        // the preference. Other fields are merged server-side from existing state.
        return this._http
            .get<{ id: string; firstName?: string; lastName?: string; email?: string; phoneNumber?: string }>(
                `${environment.apiUrl}/api/personal/profile`,
            )
            .pipe(
                tap(profile => {
                    this._http
                        .put(`${environment.apiUrl}/api/personal/profile`, {
                            id: profile.id,
                            firstName: profile.firstName,
                            lastName: profile.lastName,
                            email: profile.email,
                            phoneNumber: profile.phoneNumber,
                            preferredLanguage: lang,
                        })
                        .pipe(catchError(() => of(null)))
                        .subscribe();
                }),
                catchError(() => of(null)),
            );
    }

    /** Whitelist filter — anything outside ('en',''bn') collapses to null. */
    private coerce(raw: string | null | undefined): SupportedLang | null {
        const v = raw?.trim().toLowerCase();
        return v === 'en' || v === 'bn' ? v : null;
    }
}

function safeReadLocalStorage(key: string): string | null {
    try {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    } catch {
        return null;
    }
}

function safeWriteLocalStorage(key: string, value: string): void {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(key, value);
        }
    } catch {
        /* SSR / private mode — swallow. */
    }
}
