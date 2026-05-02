import { Type } from '@angular/core';
import { PosComponent } from './pos.component';

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

export const POS_LAYOUTS: readonly PosLayoutOption[] = [
    {
        name: 'default',
        label: 'Default',
        description: 'Standard POS sale screen with cart panel and product search.',
        component: PosComponent,
    },
    // Add more entries as new layouts ship. Example:
    // { name: 'compact', label: 'Compact', description: 'Tablet-friendly with bigger buttons.', component: PosCompactComponent },
];

export const DEFAULT_POS_LAYOUT_NAME = 'default';

export function resolvePosLayoutComponent(name: string | null | undefined): Type<unknown> {
    const match = POS_LAYOUTS.find(l => l.name === (name ?? DEFAULT_POS_LAYOUT_NAME));
    return (match ?? POS_LAYOUTS[0]).component;
}
