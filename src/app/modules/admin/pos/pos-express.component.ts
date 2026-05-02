import { Component, ViewEncapsulation } from '@angular/core';
import { PosComponent } from './pos.component';

/**
 * Express POS layout — cart-dominant 40/60 split with a slim customer
 * row at the top of the cart panel and a visually emphasized Finalize
 * button. Optimized for walk-in volume but keeps every business-type
 * feature reachable: customer linking, loyalty redemption, prescription
 * input, batch picker, etc. all still work — just at a more compact
 * visual density. No business-type compatibility break.
 */
@Component({
    selector: 'app-pos-express',
    standalone: true,
    imports: [PosComponent],
    encapsulation: ViewEncapsulation.None,
    host: { class: 'flex-1 flex flex-col min-h-0' },
    template: `<div class="pos-layout-express flex-1 flex flex-col min-h-0"><app-pos></app-pos></div>`,
    styles: [`
        /* 40/60 split — small product picker, big cart with payment focus. */
        @media (min-width: 1024px) {
            .pos-layout-express app-pos > div > .lg\\:w-1\\/2:first-child { width: 40% !important; flex-basis: 40% !important; }
            .pos-layout-express app-pos > div > .lg\\:w-1\\/2:last-child  { width: 60% !important; flex-basis: 60% !important; }
        }

        /* Customer card is collapsed to a slim row instead of hidden — every
           business type (Supermarket loyalty, Wholesale credit, Pharmacy
           prescription) still works. Padding tightened, the redundant
           "Customer" h3 hidden because the form-field's mat-label says the
           same thing. */
        .pos-layout-express app-pos > div > .lg\\:w-1\\/2:last-child > mat-card:first-of-type {
            padding: 4px 8px !important;
        }
        .pos-layout-express app-pos > div > .lg\\:w-1\\/2:last-child > mat-card:first-of-type > h3 {
            display: none !important;
        }
        .pos-layout-express app-pos > div > .lg\\:w-1\\/2:last-child > mat-card:first-of-type .mat-mdc-form-field {
            margin-bottom: 0 !important;
        }

        /* Emphasize Finalize: any raised button gets a larger treatment. */
        .pos-layout-express button.mat-mdc-raised-button {
            min-height: 64px !important;
            font-size: 18px !important;
            font-weight: 600 !important;
            padding-left: 32px !important;
            padding-right: 32px !important;
        }

        /* Tighten the product grid to give the cart more vertical space. */
        .pos-layout-express .grid > button { padding: 0.5rem !important; }
        .pos-layout-express .grid > button .text-sm { font-size: 13px !important; }
    `],
})
export class PosExpressComponent {}
