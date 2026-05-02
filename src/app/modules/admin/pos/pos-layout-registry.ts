import { Type } from '@angular/core';
import { PosComponent } from './pos.component';
import { PosCompactComponent } from './pos-compact.component';
import { PosTouchComponent } from './pos-touch.component';
import { PosWideComponent } from './pos-wide.component';
import { PosExpressComponent } from './pos-express.component';

/**
 * Static registry mapping a tenant's `posLayout` name to its component.
 *
 * Adding a new layout is two lines:
 *   1. Drop the component file under `modules/admin/pos/`
 *   2. Register it here under whatever name the tenant config will store
 *
 * No backend change needed — the server stores the layout name as a free
 * string, and the dispatcher falls back to the default if the name doesn't
 * resolve to a registered entry. That makes adding a layout a frontend-only
 * deploy.
 */
export interface PosLayoutOption {
    /** Stable identifier — what gets stored on `FSHTenantInfo.PosLayout`. */
    readonly name: string;
    /** Human label for the tenant edit form dropdown. */
    readonly label: string;
    /** Optional one-liner shown next to the option. */
    readonly description?: string;
    /** The component to render at `/pos`. */
    readonly component: Type<unknown>;
}

// Each layout is a real component that wraps the standard PosComponent and
// applies layout-class-scoped CSS to change visual treatment. Sale logic is
// shared — only the visuals differ.
export const POS_LAYOUTS: readonly PosLayoutOption[] = [
    {
        name: 'default',
        label: 'Default',
        description: 'Balanced 50/50 split. Cart on the right, product search and grid on the left.',
        component: PosComponent,
    },
    {
        name: 'compact',
        label: 'Compact',
        description: 'Tighter spacing, smaller text — fits more on screen for laptops or small terminals.',
        component: PosCompactComponent,
    },
    {
        name: 'touch',
        label: 'Touch / Kiosk',
        description: 'Larger fonts and 56-pixel-tall buttons — friendly to touchscreens and fat fingers.',
        component: PosTouchComponent,
    },
    {
        name: 'wide',
        label: 'Wide',
        description: '65/35 split with a 5-column product grid — see many SKUs at a glance.',
        component: PosWideComponent,
    },
    {
        name: 'express',
        label: 'Express',
        description: '40/60 split, hides the customer card, emphasizes Finalize. Optimized for walk-in volume.',
        component: PosExpressComponent,
    },
];

export const DEFAULT_POS_LAYOUT_NAME = 'default';

export function resolvePosLayoutComponent(name: string | null | undefined): Type<unknown> {
    const match = POS_LAYOUTS.find(l => l.name === (name ?? DEFAULT_POS_LAYOUT_NAME));
    return (match ?? POS_LAYOUTS[0]).component;
}
