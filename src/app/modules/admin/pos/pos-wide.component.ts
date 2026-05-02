import { Component, ViewEncapsulation } from '@angular/core';
import { PosComponent } from './pos.component';

/**
 * Wide POS layout — more product-grid real estate, slimmer cart panel.
 * Useful for stores with large catalogs where cashiers want to see many
 * SKUs at a glance instead of relying on search. Same logic as default.
 *
 * Flips the 50/50 lg split to roughly 65/35 and bumps the product grid
 * from 2-3 columns to 4-5 columns.
 */
@Component({
    selector: 'app-pos-wide',
    standalone: true,
    imports: [PosComponent],
    encapsulation: ViewEncapsulation.None,
    host: { class: 'flex-1 flex flex-col min-h-0' },
    template: `<div class="pos-layout-wide flex-1 flex flex-col min-h-0"><app-pos></app-pos></div>`,
    styles: [`
        /* 65/35 split — products take more horizontal space. */
        @media (min-width: 1024px) {
            .pos-layout-wide app-pos > div > .lg\\:w-1\\/2:first-child { width: 65% !important; flex-basis: 65% !important; }
            .pos-layout-wide app-pos > div > .lg\\:w-1\\/2:last-child  { width: 35% !important; flex-basis: 35% !important; }
        }
        /* Product grid: 3 cols on small screens, 4 cols on lg+ — more
           than Default (2/3) but readable. 5 was too dense for product
           names + SKU + price stacked together. */
        .pos-layout-wide .grid.grid-cols-2 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        @media (min-width: 1024px) {
            .pos-layout-wide .grid.md\\:grid-cols-3 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
        }
        /* Product card padding scales with the wider grid. */
        .pos-layout-wide .grid > button { padding: 0.875rem !important; }
    `],
})
export class PosWideComponent {}
