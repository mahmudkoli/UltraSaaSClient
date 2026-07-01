import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TenantDto } from '../../../core/tenants/tenants.types';
import { TenantsService } from '../../../core/tenants/tenants.service';
import { FeaturesService } from '../../../core/features/features.service';
import { InstitutesService } from '../../../core/institutes/institutes.service';
import { InstituteDto } from '../../../core/institutes/institutes.types';

/**
 * Read-only consolidated overview for one tenant (audit feature #28 + UX-14).
 * Composes existing endpoints on the FE — there is no aggregate backend endpoint.
 * Each source degrades independently so one failing call doesn't blank the page.
 */
@Component({
    selector: 'tenant-overview',
    templateUrl: './tenant-overview.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatProgressBarModule,
        MatTooltipModule,
    ],
})
export class TenantOverviewComponent implements OnInit {
    tenantId: string | null = null;
    loading = false;

    tenant: TenantDto | null = null;
    enabledFeatures = 0;
    totalFeatures = 0;
    permissionCount = 0;
    institute: InstituteDto | null = null;

    constructor(
        private _tenantsService: TenantsService,
        private _featuresService: FeaturesService,
        private _institutesService: InstitutesService,
        private _route: ActivatedRoute,
        private _router: Router
    ) {}

    ngOnInit(): void {
        this.tenantId = this._route.snapshot.paramMap.get('id');
        if (!this.tenantId) return;
        this.load();
    }

    private load(): void {
        const id = this.tenantId!;
        this.loading = true;
        forkJoin({
            tenant: this._tenantsService.getById(id).pipe(catchError(() => of(null))),
            features: this._featuresService.getTenantFeatureManagement(id).pipe(catchError(() => of(null))),
            permissions: this._tenantsService.getWithPermissions(id).pipe(catchError(() => of(null))),
            institutes: this._institutesService.getAll({ TenantId: id }).pipe(catchError(() => of([] as InstituteDto[]))),
        }).subscribe((res) => {
            this.tenant = res.tenant;
            if (res.features) {
                this.totalFeatures = res.features.features.length;
                this.enabledFeatures = res.features.features.filter(f => f.isEnabled).length;
            }
            this.permissionCount = res.permissions?.permissions?.length ?? 0;
            this.institute = (res.institutes && res.institutes.length > 0) ? res.institutes[0] : null;
            this.loading = false;
        });
    }

    /** Theme split into [theme, scheme, layout] parts for chips; ['Default'] when none. */
    getThemeParts(tenant: TenantDto | null): string[] {
        if (!tenant?.themeConfig) return ['Default'];
        try {
            const config = JSON.parse(tenant.themeConfig);
            const theme = (config.theme || 'default').replace('theme-', '');
            return [theme, config.scheme || 'light', config.layout || 'classy'];
        } catch {
            return ['Default'];
        }
    }

    /** Tailwind chip classes for the lifecycle status badge. */
    statusChipClass(): string {
        const state = (this.tenant?.lifecycleState || '').toLowerCase();
        if (state === 'active') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
        if (state === 'trial') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
        if (state === 'graceperiod') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
        if (state === 'suspended') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }

    // ----- navigation into existing sub-pages -----
    back(): void { this._router.navigate(['/tenant']); }
    editTenant(): void { this._router.navigate([`/tenant/${this.tenantId}/edit`]); }
    manageFeatures(): void { this._router.navigate([`/tenant/${this.tenantId}/features`]); }
    managePermissions(): void { this._router.navigate([`/tenant/${this.tenantId}/permissions`]); }
    manageTheme(): void { this._router.navigate([`/tenant/${this.tenantId}/theme-settings`]); }
    manageBilling(): void { this._router.navigate([`/tenant/${this.tenantId}/billing`]); }
    viewInstitute(): void { if (this.institute) this._router.navigate([`/institute/${this.institute.id}/edit`]); }
    viewAudit(): void { this._router.navigate([`/tenant/${this.tenantId}/audit`]); }
    cloneSettings(): void { this._router.navigate([`/tenant/${this.tenantId}/clone`]); }
}
