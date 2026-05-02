import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { TenantInfoService } from 'app/core/auth/tenant-info.service';
import { resolvePosLayoutComponent } from './pos-layout-registry';

/**
 * Thin dispatcher at the `/pos` route. Reads the current tenant's
 * `posLayout` from `TenantInfoService` and renders the matching component
 * from `POS_LAYOUTS`. Unknown / null layout names fall back to the default.
 *
 * Keeps `pos.routes.ts` agnostic of which actual layout component is in
 * play — the registry owns that mapping.
 */
@Component({
    selector: 'app-pos-layout-dispatcher',
    standalone: true,
    imports: [CommonModule],
    template: `<ng-container *ngComponentOutlet="layout()"></ng-container>`,
})
export class PosLayoutDispatcherComponent {
    private readonly tenantInfo = inject(TenantInfoService);

    readonly layout = computed(() => resolvePosLayoutComponent(this.tenantInfo.posLayout()));
}
