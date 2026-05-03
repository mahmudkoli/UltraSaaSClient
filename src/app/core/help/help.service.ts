import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { HELP_CONTENT } from './help-content';
import { HelpFeature, Language } from './help.types';

/**
 * Coordinates the help drawer's open/close state, the current language, and
 * which feature should auto-expand based on the active route. Lives at the
 * root injector so the toolbar button and drawer host share the same state.
 */
@Injectable({ providedIn: 'root' })
export class HelpService {
    private readonly router = inject(Router);

    /** Drawer open/close — bound to the slide-in panel in HelpDrawerComponent. */
    readonly open = signal(false);

    /** Current display language. Persisted to localStorage so it sticks across reloads. */
    readonly language = signal<Language>(this.readStoredLanguage());

    /** Live URL signal — emits on initial load and every NavigationEnd. */
    private readonly url = toSignal(
        this.router.events.pipe(
            filter((e): e is NavigationEnd => e instanceof NavigationEnd),
            map(e => e.urlAfterRedirects),
            startWith(this.router.url),
        ),
        { initialValue: this.router.url },
    );

    /** Catalogue of features used by the drawer. Keep stable order; the user reads top-down. */
    readonly features = signal<HelpFeature[]>(HELP_CONTENT);

    /**
     * The feature whose `routePrefix` matches the current URL. Falls back to
     * `null` for routes outside the registered set (e.g. /profile) — the drawer
     * still opens, just without an auto-expanded section.
     */
    readonly activeFeature = computed<HelpFeature | null>(() => {
        const u = this.url();
        return this.features().find(f => f.routePrefix && u.startsWith(f.routePrefix)) ?? null;
    });

    toggle(): void { this.open.update(v => !v); }
    close(): void { this.open.set(false); }
    show(): void { this.open.set(true); }

    setLanguage(lang: Language): void {
        this.language.set(lang);
        try { localStorage.setItem('ultrapos.helpLang', lang); } catch { /* storage may be disabled */ }
    }

    private readStoredLanguage(): Language {
        try {
            const v = localStorage.getItem('ultrapos.helpLang');
            return v === 'bn' ? 'bn' : 'en';
        } catch { return 'en'; }
    }
}
