import { Component, ViewEncapsulation } from '@angular/core';
import { PosComponent } from './pos.component';

/**
 * Touch / Kiosk POS layout — bigger fonts, taller buttons, more breathing
 * room. Designed for touchscreen terminals where fat-finger taps are
 * common. Same logic as the default POS.
 */
@Component({
    selector: 'app-pos-touch',
    standalone: true,
    imports: [PosComponent],
    encapsulation: ViewEncapsulation.None,
    host: { class: 'flex-1 flex flex-col min-h-0' },
    template: `<div class="pos-layout-touch flex-1 flex flex-col min-h-0"><app-pos></app-pos></div>`,
    styles: [`
        /* Vertical stack on lg+ — products on top, cart below. Each half
           scrolls independently. Finalize is sticky to the bottom of the
           cart column so it stays accessible even with many cart items. */
        @media (min-width: 1024px) {
            .pos-layout-touch app-pos > div {
                flex-direction: column !important;
            }
            .pos-layout-touch app-pos > div > .lg\\:w-1\\/2 {
                width: 100% !important;
                min-height: 0 !important;
                overflow-y: auto;
            }
            /* Cart dominates: products get 32% of vertical height (search
               + a scrollable product strip), cart gets 68% (line items,
               totals, sticky Finalize). The cashier's eye lives on the
               cart 90% of the time during a sale; product browsing is
               intermittent. */
            .pos-layout-touch app-pos > div > .lg\\:w-1\\/2:first-child  { flex: 0 0 32% !important; }
            .pos-layout-touch app-pos > div > .lg\\:w-1\\/2:last-child   { flex: 1 1 0% !important; }

            /* Override the inner cards' flex-1 + overflow-auto so the
               whole column scrolls naturally instead of nested scroll
               boxes (which fight with sticky positioning + look broken
               at vertical orientations). */
            .pos-layout-touch app-pos > div > .lg\\:w-1\\/2 > mat-card.flex-1 {
                flex: 0 0 auto !important;
                overflow: visible !important;
            }

            /* Sticky Finalize: the Payment card is the last mat-card in
               the cart column. It anchors to the bottom of the
               scrollable column so the Finalize button is always
               visible — critical UX for a kiosk. */
            .pos-layout-touch app-pos > div > .lg\\:w-1\\/2:last-child > mat-card:last-of-type {
                position: sticky !important;
                bottom: 0;
                z-index: 5;
                background: var(--fuse-bg-card, white);
                box-shadow: 0 -8px 16px -4px rgba(0, 0, 0, 0.08);
                border-top: 1px solid rgba(99, 102, 241, 0.2);
            }
            :host-context(.dark) .pos-layout-touch app-pos > div > .lg\\:w-1\\/2:last-child > mat-card:last-of-type,
            .dark .pos-layout-touch app-pos > div > .lg\\:w-1\\/2:last-child > mat-card:last-of-type {
                background: var(--fuse-bg-card, #1f2937);
                box-shadow: 0 -8px 16px -4px rgba(0, 0, 0, 0.4);
            }

            /* Visual divider between products section and cart section. */
            .pos-layout-touch app-pos > div > .lg\\:w-1\\/2:last-child {
                border-top: 2px solid rgba(99, 102, 241, 0.18);
                padding-top: 0.5rem;
            }
        }

        /* Sizing — bigger fonts, taller buttons, more breathing room. */
        .pos-layout-touch { font-size: 16px; }
        .pos-layout-touch h3 { font-size: 18px; }
        .pos-layout-touch .text-base { font-size: 17px !important; }
        .pos-layout-touch .text-sm { font-size: 15px !important; }
        .pos-layout-touch .text-xs { font-size: 14px !important; }
        .pos-layout-touch button.mat-mdc-stroked-button,
        .pos-layout-touch button.mat-mdc-raised-button,
        .pos-layout-touch button.mat-mdc-flat-button {
            min-height: 56px !important;
            font-size: 16px !important;
            padding-left: 24px !important;
            padding-right: 24px !important;
        }
        .pos-layout-touch button.mat-mdc-icon-button { width: 48px !important; height: 48px !important; }
        .pos-layout-touch mat-card { padding: 12px !important; }
        /* Inputs use Material defaults — the previous 12px padding bloated
           the in-cart qty/price/serial inputs into oversized boxes. */
        .pos-layout-touch .gap-3 { gap: 1rem !important; }
        .pos-layout-touch .gap-4 { gap: 1.25rem !important; }
        .pos-layout-touch .grid { gap: 1rem !important; }
        .pos-layout-touch .grid > button { padding: 1rem !important; min-height: 96px; }
        .pos-layout-touch .icon-size-4 { font-size: 22px !important; width: 22px !important; height: 22px !important; }
        .pos-layout-touch .icon-size-5 { font-size: 26px !important; width: 26px !important; height: 26px !important; }
    `],
})
export class PosTouchComponent {}
