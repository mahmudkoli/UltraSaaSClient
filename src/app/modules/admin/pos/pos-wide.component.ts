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
    template: `<div class="pos-layout-wide"><app-pos></app-pos></div>`,
    styles: [`
        @media (min-width: 1024px) {
            .pos-layout-wide > div > .lg\\:w-1\\/2:first-child { width: 65% !important; flex-basis: 65% !important; }
            .pos-layout-wide > div > .lg\\:w-1\\/2:last-child  { width: 35% !important; flex-basis: 35% !important; }
        }
        .pos-layout-wide .grid.grid-cols-2 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        @media (min-width: 768px) {
            .pos-layout-wide .grid.md\\:grid-cols-3 { grid-template-columns: repeat(5, minmax(0, 1fr)) !important; }
        }
        .pos-layout-wide .grid > button { padding: 0.75rem 0.5rem !important; }
        .pos-layout-wide .grid > button .text-sm { font-size: 12px !important; }
    `],
})
export class PosWideComponent {}
