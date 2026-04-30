import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'current_outlet_id';

/**
 * Session-wide current-outlet selection. Backed by localStorage so picking an
 * outlet on the POS screen survives page reloads and is shared across every
 * screen with an outlet picker (Sales filter, PO create, GR create, etc.).
 *
 * Empty string means "not yet picked" — consumers should fall back to the
 * first outlet from OutletsService.getAll() when this is empty.
 */
@Injectable({ providedIn: 'root' })
export class CurrentOutletService {
    private readonly _outletId = signal<string>(this.read());
    readonly outletId = this._outletId.asReadonly();

    set(id: string | null | undefined): void {
        const next = id ?? '';
        this._outletId.set(next);
        if (next) localStorage.setItem(STORAGE_KEY, next);
        else localStorage.removeItem(STORAGE_KEY);
    }

    clear(): void { this.set(''); }

    private read(): string {
        try { return localStorage.getItem(STORAGE_KEY) ?? ''; }
        catch { return ''; }
    }
}
