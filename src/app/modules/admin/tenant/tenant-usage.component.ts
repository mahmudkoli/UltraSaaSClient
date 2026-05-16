import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@ngneat/transloco';
import { TenantDto, TenantUsageDto } from '../../../core/tenants/tenants.types';
import { TenantsService } from '../../../core/tenants/tenants.service';

/**
 * Phase 2.51 — simplified usage page. Pre-cleanup it showed API-calls and
 * storage charts, both backed by counters nobody populated. Now only the two
 * enforced quotas are reported: outlets + active users.
 */
@Component({
    selector: 'tenant-usage',
    templateUrl: './tenant-usage.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        TranslocoModule,
    ],
})
export class TenantUsageComponent implements OnInit {
    tenant?: TenantDto;
    tenantUsage?: TenantUsageDto;
    tenantId: string;
    loading: boolean = false;

    constructor(
        private _tenantsService: TenantsService,
        private _router: Router,
        private _route: ActivatedRoute,
    ) {
        this.tenantId = this._route.snapshot.paramMap.get('id')!;
    }

    ngOnInit(): void {
        this.reload();
    }

    reload(): void {
        this.loading = true;
        this._tenantsService.getById(this.tenantId).subscribe({
            next: (tenant) => { this.tenant = tenant; },
            error: (err) => console.error('Error loading tenant:', err),
        });

        this._tenantsService.getUsage(this.tenantId).subscribe({
            next: (usage) => {
                this.tenantUsage = usage;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading usage:', err);
                this.loading = false;
            },
        });
    }

    goBack(): void {
        this._router.navigate(['/tenant']);
    }

    manageBilling(): void {
        this._router.navigate(['/tenant', this.tenantId, 'billing']);
    }

    /** Plan changes ride the tenant edit form (Phase 2.50 cascade). */
    upgradeSubscription(): void {
        this._router.navigate(['/tenant', this.tenantId, 'edit']);
    }

    /** Severity tag for a percentage — same thresholds the dashboard uses. */
    severityFor(percent: number): 'critical' | 'warning' | 'ok' {
        if (percent >= 90) return 'critical';
        if (percent >= 70) return 'warning';
        return 'ok';
    }
}
