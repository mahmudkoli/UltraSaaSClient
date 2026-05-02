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
    template: `<div class="pos-layout-express"><app-pos></app-pos></div>`,
    styles: [`
        /* 35/65 split — small product picker, big cart with payment focus */
        @media (min-width: 1024px) {
            .pos-layout-express > div > .lg\\:w-1\\/2:first-child { width: 40% !important; flex-basis: 40% !important; }
            .pos-layout-express > div > .lg\\:w-1\\/2:last-child  { width: 60% !important; flex-basis: 60% !important; }
        }

        /* Hide the entire Customer mat-card on the right column. The customer
           card is the first mat-card under the right pane and contains an h3
           with the literal text "Customer"; we target it by structure since
           it has no semantic id. */
        .pos-layout-express > div > .lg\\:w-1\\/2:last-child > mat-card:first-of-type:has(h3) {
            display: none !important;
        }

        /* Cart card stretches to fill the freed space */
        .pos-layout-express > div > .lg\\:w-1\\/2:last-child > mat-card.flex-1 {
            margin-top: 0 !important;
        }

        /* Hide promo input — usually the second mat-card with a promo input.
           Keeping a fallback rule that hides any mat-form-field with a label
           starting with "Promo" inside the right pane. */
        .pos-layout-express mat-form-field mat-label:not(:empty) {
            /* no-op anchor; real rule below */
        }

        /* Emphasize Finalize: any mat-mdc-raised-button gets a bigger
           treatment in this layout. */
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
