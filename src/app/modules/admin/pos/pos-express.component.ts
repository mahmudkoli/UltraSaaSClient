import { Component, ViewEncapsulation } from '@angular/core';
import { PosComponent } from './pos.component';

/**
 * Express POS layout — strips the customer / loyalty / promo controls so
 * the cashier rings up walk-ins as fast as possible. Cart panel takes the
 * lion's share of the screen and the Finalize button is emphasized.
 *
 * Used by high-volume convenience stores or coffee shops where most sales
 * are anonymous walk-ins. Same backend logic — finalize still works the
 * same way, just no UI for customer linking, loyalty redemption, or promo
 * codes. Power users who do need those switch to a fuller layout.
 */
@Component({
    selector: 'app-pos-express',
    standalone: true,
    imports: [PosComponent],
    encapsulation: ViewEncapsulation.None,
    host: { class: 'flex-1 flex flex-col min-h-0' },
    template: `<div class="pos-layout-express flex-1 flex flex-col min-h-0"><app-pos></app-pos></div>`,
    styles: [`
        /* 40/60 split — small product picker, big cart with payment focus */
        @media (min-width: 1024px) {
            .pos-layout-express app-pos > div > .lg\\:w-1\\/2:first-child { width: 40% !important; flex-basis: 40% !important; }
            .pos-layout-express app-pos > div > .lg\\:w-1\\/2:last-child  { width: 60% !important; flex-basis: 60% !important; }
        }

        /* Hide the entire Customer mat-card on the right column. It's the
           first mat-card under the right pane (with an h3 reading "Customer").
           No semantic id available, so we target by structural position. */
        .pos-layout-express app-pos > div > .lg\\:w-1\\/2:last-child > mat-card:first-of-type:has(h3) {
            display: none !important;
        }

        /* Cart card sits flush at the top now that the customer card is gone. */
        .pos-layout-express app-pos > div > .lg\\:w-1\\/2:last-child > mat-card.flex-1 {
            margin-top: 0 !important;
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
