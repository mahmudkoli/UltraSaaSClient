import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TenantInfoService } from 'app/core/auth/tenant-info.service';
import { resolvePosLayoutComponent } from './pos-layout-registry';

/**
 * Thin dispatcher at the `/pos` route. Picks which POS layout to render:
 *
 *   1. `?previewLayout=<name>` query param wins if present — used by the
 *      tenant edit form's "Preview" button so root admins can see a layout
 *      before saving the choice. Unknown names still fall back to default
 *      via resolvePosLayoutComponent.
 *   2. Otherwise the current tenant's saved `posLayout` from
 *      TenantInfoService.
 *   3. Otherwise the default registry entry.
 */
@Component({
    selector: 'app-pos-layout-dispatcher',
    standalone: true,
    imports: [CommonModule],
    // host fills the router-outlet's flex slot — without this the dispatcher's
    // host is inline-default and the `h-full` cascade inside PosComponent
    // resolves to 0 (the default layout would render at 0px height).
    host: { class: 'flex-1 flex flex-col min-h-0' },
    template: `<ng-container *ngComponentOutlet="layout()"></ng-container>`,
})
export class PosLayoutDispatcherComponent {
    private readonly tenantInfo = inject(TenantInfoService);
    private readonly route = inject(ActivatedRoute);

    /** Live signal of the `previewLayout` query param. */
    private readonly previewLayout = toSignal(
        this.route.queryParamMap,
        { initialValue: this.route.snapshot.queryParamMap },
    );

    readonly layout = computed(() => {
        const preview = this.previewLayout().get('previewLayout');
        const name = preview ?? this.tenantInfo.posLayout();
        return resolvePosLayoutComponent(name);
    });
}
