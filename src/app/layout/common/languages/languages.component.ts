import { NgFor, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AvailableLangs, TranslocoService } from '@ngneat/transloco';
import { LanguageService } from 'app/core/i18n/language.service';

/**
 * Phase 2.58 — top-toolbar language picker (MK Corex POS: en + bn).
 *
 * Lang state is owned by `LanguageService` — this component just
 * renders the flag for the active lang and proxies clicks. The
 * Fuse demo's nav-mutation logic is gone; nav titles are translated
 * by `NavigationService` on `langChanges$`.
 */
@Component({
    selector       : 'languages',
    templateUrl    : './languages.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'languages',
    standalone     : true,
    imports        : [MatButtonModule, MatMenuModule, NgTemplateOutlet, NgFor],
})
export class LanguagesComponent
{
    private readonly _transloco = inject(TranslocoService);
    private readonly _languageService = inject(LanguageService);

    readonly availableLangs: AvailableLangs = this._transloco.getAvailableLangs();
    readonly activeLang = toSignal(this._transloco.langChanges$, {
        initialValue: this._transloco.getActiveLang(),
    });
    readonly flagCodes: Record<string, string> = { en: 'us', bn: 'bd' };

    setActiveLang(lang: string): void
    {
        this._languageService.setActiveLang(lang);
    }

    trackByFn(index: number, item: { id: string }): string | number
    {
        return item.id ?? index;
    }
}
