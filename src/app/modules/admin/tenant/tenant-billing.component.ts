import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@ngneat/transloco';
import { TenantDto } from '../../../core/tenants/tenants.types';
import { TenantsService } from '../../../core/tenants/tenants.service';
import { PlansService, TenantPaymentsService } from '../../../core/billing/billing.service';
import { PlanDto, TenantPaymentDto } from '../../../core/billing/billing.types';
import { RecordPaymentDialogComponent } from './record-payment-dialog.component';

/**
 * Phase 2.50 — read-only billing tab. The legacy "edit plan inline" + "extend
 * validity" forms are gone; plan changes happen on the tenant form (with the
 * quota pre-flight + force flow), and validity extension happens through the
 * RecordPaymentDialog. This component shows current state + payment history.
 */
@Component({
    selector: 'tenant-billing',
    templateUrl: './tenant-billing.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatDialogModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatTooltipModule,
        TranslocoModule,
    ],
})
export class TenantBillingComponent implements OnInit {
    tenant?: TenantDto;
    tenantId: string;
    plan?: PlanDto;
    payments: TenantPaymentDto[] = [];
    loading: boolean = false;

    paymentColumns = ['paidOn', 'amount', 'method', 'reference', 'periodStart', 'periodEnd'];

    constructor(
        private _tenantsService: TenantsService,
        private _plansService: PlansService,
        private _paymentsService: TenantPaymentsService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _dialog: MatDialog,
    ) {
        this.tenantId = this._route.snapshot.paramMap.get('id')!;
    }

    ngOnInit(): void {
        this.reload();
    }

    reload(): void {
        this.loading = true;
        this._tenantsService.getById(this.tenantId).subscribe({
            next: (tenant) => {
                this.tenant = tenant;
                if (tenant.planId) {
                    this._plansService.get(tenant.planId).subscribe({
                        next: (plan) => { this.plan = plan; },
                        error: () => { /* plan missing — show "Not set" */ },
                    });
                } else {
                    this.plan = undefined;
                }
            },
            error: (err) => console.error('Error loading tenant:', err),
        });

        this._paymentsService.getByTenant(this.tenantId).subscribe({
            next: (rows) => {
                this.payments = rows;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading payments:', err);
                this.loading = false;
            },
        });
    }

    openRecordPayment(): void {
        if (!this.tenant) return;
        const ref = this._dialog.open(RecordPaymentDialogComponent, {
            data: {
                tenantId: this.tenant.id,
                tenantName: this.tenant.systemName ?? this.tenant.systemName ?? this.tenant.id,
                currentValidUpto: this.tenant.validUpto,
            },
        });
        ref.afterClosed().subscribe((recorded) => {
            if (recorded) this.reload();
        });
    }

    /** Severity tag for ValidUpto — matches the in-app expiry banner. */
    validitySeverity(): 'expired' | 'urgent' | 'warning' | 'ok' | 'none' {
        if (!this.tenant?.validUpto) return 'none';
        const days = Math.floor((new Date(this.tenant.validUpto).getTime() - Date.now()) / 86400000);
        if (days < 0) return 'expired';
        if (days <= 1) return 'urgent';
        if (days <= 7) return 'warning';
        return 'ok';
    }

    goBack(): void {
        this._router.navigate(['/tenant']);
    }

    editTenantPlan(): void {
        this._router.navigate([`/tenant/${this.tenantId}/edit`]);
    }
}
