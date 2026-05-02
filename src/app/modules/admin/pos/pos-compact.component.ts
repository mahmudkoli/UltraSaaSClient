import { Component, ViewEncapsulation } from '@angular/core';
import { PosComponent } from './pos.component';

/**
 * Compact POS layout — same logic as PosComponent, tighter visual treatment.
 * Goal: fit more on screen for mid-size laptops or busy counter setups.
 *
 * Implementation: hosts the standard PosComponent inside a `.pos-layout-compact`
 * wrapper. ViewEncapsulation.None lets the styles below reach into the
 * embedded component's DOM, but every selector is prefixed with the wrapper
 * class so the rules only apply when this layout is in use.
 */
@Component({
    selector: 'app-pos-compact',
    standalone: true,
    imports: [PosComponent],
    encapsulation: ViewEncapsulation.None,
    host: { class: 'flex-1 flex flex-col min-h-0' },
    template: `<div class="pos-layout-compact flex-1 flex flex-col min-h-0"><app-pos></app-pos></div>`,
    styles: [`
        /* Density via spacing + font-size, not just one or the other. The
           goal is a visibly tighter UI where each card feels like it has
           less padding and more content per square inch. */
        .pos-layout-compact { font-size: 12px; }
        .pos-layout-compact .p-4 { padding: 0.5rem !important; }
        .pos-layout-compact .gap-4 { gap: 0.5rem !important; }
        .pos-layout-compact .gap-3 { gap: 0.375rem !important; }
        .pos-layout-compact mat-card { padding: 8px !important; }
        .pos-layout-compact h3 { font-size: 12px; margin-bottom: 4px !important; }
        .pos-layout-compact .text-base { font-size: 12px !important; }
        .pos-layout-compact .text-sm { font-size: 11px !important; }
        .pos-layout-compact .text-xs { font-size: 10px !important; }
        .pos-layout-compact button.mat-mdc-stroked-button,
        .pos-layout-compact button.mat-mdc-raised-button,
        .pos-layout-compact button.mat-mdc-flat-button { min-height: 36px !important; line-height: 32px; }
        .pos-layout-compact .py-2 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
        .pos-layout-compact .py-6 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
        .pos-layout-compact .py-10 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
        .pos-layout-compact .grid { gap: 4px !important; }

        /* Zebra-striped cart rows so dense-mode reads cleanly even when
           there are many line items. */
        .pos-layout-compact table tbody tr:nth-child(even) {
            background: rgba(0, 0, 0, 0.025);
        }
        :host-context(.dark) .pos-layout-compact table tbody tr:nth-child(even),
        .dark .pos-layout-compact table tbody tr:nth-child(even) {
            background: rgba(255, 255, 255, 0.03);
        }
        .pos-layout-compact table tbody tr td { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
    `],
})
export class PosCompactComponent {}
