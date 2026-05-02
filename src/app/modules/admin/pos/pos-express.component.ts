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
        /* 40/60 split — products picker shrinks, cart claims the rest. */
        @media (min-width: 1024px) {
            .pos-layout-express app-pos > div > .lg\\:w-1\\/2:first-child { width: 40% !important; flex-basis: 40% !important; }
            .pos-layout-express app-pos > div > .lg\\:w-1\\/2:last-child  { width: 60% !important; flex-basis: 60% !important; }
        }

        /* Customer card collapsed to a slim row — every business type
           (Supermarket loyalty, Wholesale credit, Pharmacy prescription)
           still works. Padding tightened, the redundant "Customer" h3
           hidden because the form-field's mat-label says the same thing. */
        .pos-layout-express app-pos > div > .lg\\:w-1\\/2:last-child > mat-card:first-of-type {
            padding: 6px 12px !important;
        }
        .pos-layout-express app-pos > div > .lg\\:w-1\\/2:last-child > mat-card:first-of-type > h3 {
            display: none !important;
        }
        .pos-layout-express app-pos > div > .lg\\:w-1\\/2:last-child > mat-card:first-of-type .mat-mdc-form-field {
            margin-bottom: 0 !important;
        }

        /* Emphasize Finalize: visually distinct accent + larger size so the
           cashier's eye lands on it immediately at end of sale. Targets the
           raised button (typically Finalize) — uses :not() to skip any
           other raised buttons elsewhere on the page. */
        .pos-layout-express button.mat-mdc-raised-button {
            min-height: 64px !important;
            font-size: 18px !important;
            font-weight: 600 !important;
            padding-left: 32px !important;
            padding-right: 32px !important;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25) !important;
            letter-spacing: 0.5px;
        }

        /* Cart-side cards get a bit of top margin between them so the
           dense layout has visual breathing room. */
        .pos-layout-express app-pos > div > .lg\\:w-1\\/2:last-child > mat-card + mat-card {
            margin-top: 0.25rem;
        }

        /* Tighten the product grid to give the cart more vertical space. */
        .pos-layout-express .grid > button { padding: 0.5rem !important; }
        .pos-layout-express .grid > button .text-sm { font-size: 13px !important; }
    `],
})
export class PosExpressComponent {}
