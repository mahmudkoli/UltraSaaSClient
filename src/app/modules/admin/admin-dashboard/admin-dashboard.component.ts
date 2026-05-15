import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { AdminDashboardService } from 'app/core/billing/billing.service';
import { AdminDashboardDto, DashboardTenantRow } from 'app/core/billing/billing.types';
import { RecordPaymentDialogComponent, RecordPaymentDialogData } from '../tenant/record-payment-dialog.component';

type QueueFilter = 'all' | 'expiring7' | 'expiring14' | 'overdue' | 'suspended';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatButtonModule, MatButtonToggleModule, MatChipsModule, MatDialogModule,
        MatIconModule, MatTableModule, MatTooltipModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
    <div class="p-4 sm:p-6">
        <!-- Title row -->
        <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <mat-icon class="text-white">dashboard</mat-icon>
            </div>
            <div>
                <h1 class="text-3xl font-bold tracking-tight">Platform Dashboard</h1>
                <p class="text-sm text-gray-500">Cross-tenant KPIs, action queue, and recent activity.</p>
            </div>
        </div>

        @if (dash(); as d) {
            <!-- Row 1: KPI cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
                    <div class="text-xs uppercase tracking-wider text-gray-500">MRR (BDT)</div>
                    <div class="text-2xl font-bold mt-1">{{ d.mrr | number:'1.0-0' }}</div>
                    <div class="text-xs text-gray-400 mt-1">Monthly recurring revenue</div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
                    <div class="text-xs uppercase tracking-wider text-gray-500">Active tenants</div>
                    <div class="text-2xl font-bold mt-1 text-emerald-600">{{ d.activeTenants }}</div>
                    <div class="text-xs text-gray-400 mt-1">+{{ d.newTenantsThisMonth }} this month</div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
                    <div class="text-xs uppercase tracking-wider text-gray-500">Expiring 7d</div>
                    <div class="text-2xl font-bold mt-1" [class.text-amber-600]="d.expiringThisWeek > 0">{{ d.expiringThisWeek }}</div>
                    <div class="text-xs text-gray-400 mt-1">Renewal nudges</div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
                    <div class="text-xs uppercase tracking-wider text-gray-500">Overdue / Suspended</div>
                    <div class="text-2xl font-bold mt-1" [class.text-rose-600]="d.overdueOrSuspended > 0">{{ d.overdueOrSuspended }}</div>
                    <div class="text-xs text-gray-400 mt-1">Needs action</div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
                    <div class="text-xs uppercase tracking-wider text-gray-500">Collected (BDT) this month</div>
                    <div class="text-2xl font-bold mt-1">{{ d.collectedThisMonth | number:'1.0-0' }}</div>
                    <div class="text-xs text-gray-400 mt-1">
                        <span *ngIf="deltaPct(d) as pct" [class.text-emerald-600]="pct.value >= 0" [class.text-rose-600]="pct.value < 0">
                            {{ pct.label }} vs last month
                        </span>
                    </div>
                </div>
            </div>

            <!-- Row 2: Action queue -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-3">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                            <mat-icon class="text-amber-600 icon-size-5">flag</mat-icon>
                        </div>
                        <h3 class="text-lg font-semibold">Action queue</h3>
                        <span class="text-xs text-gray-500">({{ filteredQueue().length }} of {{ d.actionQueue.length }})</span>
                    </div>
                    <mat-button-toggle-group [(ngModel)]="queueFilter" hideSingleSelectionIndicator>
                        <mat-button-toggle value="all">All</mat-button-toggle>
                        <mat-button-toggle value="expiring7">≤ 7d</mat-button-toggle>
                        <mat-button-toggle value="expiring14">≤ 14d</mat-button-toggle>
                        <mat-button-toggle value="overdue">Overdue</mat-button-toggle>
                        <mat-button-toggle value="suspended">Suspended</mat-button-toggle>
                    </mat-button-toggle-group>
                </div>
                @if (filteredQueue().length === 0) {
                    <div class="p-6 text-center text-gray-500 text-sm">Nothing in this filter. Quiet day.</div>
                } @else {
                    <table mat-table [dataSource]="filteredQueue()" class="w-full">
                        <ng-container matColumnDef="name">
                            <th mat-header-cell *matHeaderCellDef class="pl-5"><span class="text-xs font-medium text-gray-500 uppercase">Tenant</span></th>
                            <td mat-cell *matCellDef="let r" class="pl-5">
                                <a [routerLink]="['/tenant', r.id]" class="text-indigo-600 hover:underline font-medium">{{ r.name }}</a>
                                <div class="text-xs text-gray-500">{{ r.businessType }}</div>
                            </td>
                        </ng-container>
                        <ng-container matColumnDef="plan">
                            <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase">Plan</span></th>
                            <td mat-cell *matCellDef="let r">
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">{{ r.planCode || '—' }}</span>
                            </td>
                        </ng-container>
                        <ng-container matColumnDef="validUpto">
                            <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase">Valid Upto</span></th>
                            <td mat-cell *matCellDef="let r">
                                <span [class.text-rose-600]="r.daysUntilExpiry < 0" [class.text-amber-600]="r.daysUntilExpiry >= 0 && r.daysUntilExpiry <= 7" [class.font-semibold]="r.daysUntilExpiry <= 7">
                                    {{ r.validUpto | date:'mediumDate' }}
                                    <span class="text-xs text-gray-500">({{ r.daysUntilExpiry }}d)</span>
                                </span>
                            </td>
                        </ng-container>
                        <ng-container matColumnDef="status">
                            <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase">Status</span></th>
                            <td mat-cell *matCellDef="let r">
                                <span *ngIf="!r.isSystemActive" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">Suspended</span>
                                <span *ngIf="r.isSystemActive" class="text-sm text-gray-600">{{ r.paymentStatus }}</span>
                            </td>
                        </ng-container>
                        <ng-container matColumnDef="actions">
                            <th mat-header-cell *matHeaderCellDef class="pr-5 !text-right"><span class="text-xs font-medium text-gray-500 uppercase">Action</span></th>
                            <td mat-cell *matCellDef="let r" class="pr-5 !text-right">
                                <button mat-stroked-button color="primary" (click)="openRecordPayment(r)">
                                    <mat-icon class="icon-size-4 mr-1">payments</mat-icon>Record Payment
                                </button>
                            </td>
                        </ng-container>
                        <tr mat-header-row *matHeaderRowDef="queueColumns" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: queueColumns"></tr>
                    </table>
                }
            </div>

            <!-- Row 3: Two side-by-side panels -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                        <mat-icon class="text-emerald-600">payments</mat-icon>
                        <h3 class="text-lg font-semibold">Recent payments</h3>
                    </div>
                    @if (d.recentPayments.length === 0) {
                        <div class="p-6 text-center text-gray-500 text-sm">No payments recorded yet.</div>
                    } @else {
                        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                            @for (p of d.recentPayments; track p.id) {
                                <li class="px-5 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <div>
                                        <div class="font-medium">{{ p.tenantName || p.tenantId }}</div>
                                        <div class="text-xs text-gray-500">{{ p.method }} · {{ p.paidOn | date:'medium' }}</div>
                                    </div>
                                    <div class="text-lg font-semibold">BDT {{ p.amount | number:'1.0-2' }}</div>
                                </li>
                            }
                        </ul>
                    }
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                        <mat-icon class="text-indigo-600">pie_chart</mat-icon>
                        <h3 class="text-lg font-semibold">Mix</h3>
                    </div>
                    <div class="p-5 space-y-4">
                        <div>
                            <div class="text-xs uppercase tracking-wider text-gray-500 mb-2">By plan</div>
                            <div class="flex flex-wrap gap-2 text-sm">
                                @for (row of d.planMix; track row.label) {
                                    <span class="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">{{ row.label }}: <strong class="ml-1">{{ row.count }}</strong></span>
                                }
                            </div>
                        </div>
                        <div>
                            <div class="text-xs uppercase tracking-wider text-gray-500 mb-2">By vertical</div>
                            <div class="flex flex-wrap gap-2 text-sm">
                                @for (row of d.verticalMix; track row.label) {
                                    <span class="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">{{ row.label }}: <strong class="ml-1">{{ row.count }}</strong></span>
                                }
                            </div>
                        </div>
                        <div class="pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div class="text-xs uppercase tracking-wider text-gray-500 mb-2">Recent signups</div>
                            <ul class="text-sm space-y-1">
                                @for (s of d.recentSignups; track s.id) {
                                    <li class="flex justify-between">
                                        <a [routerLink]="['/tenant', s.id]" class="text-indigo-600 hover:underline">{{ s.name }}</a>
                                        <span class="text-xs text-gray-500">{{ s.createdOn | date:'shortDate' }}</span>
                                    </li>
                                }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        } @else if (loading()) {
            <div class="flex items-center gap-3 text-gray-500 mt-8">
                <mat-icon class="icon-size-5 animate-spin">progress_activity</mat-icon>
                <span>Loading dashboard…</span>
            </div>
        } @else if (errorMsg()) {
            <div class="bg-rose-50 dark:bg-rose-900/30 border-l-4 border-rose-500 p-4 text-rose-800 dark:text-rose-200">
                {{ errorMsg() }}
            </div>
        }
    </div>
</div>
    `,
})
export class AdminDashboardComponent implements OnInit {
    private readonly api = inject(AdminDashboardService);
    private readonly dialog = inject(MatDialog);
    private readonly router = inject(Router);

    dash = signal<AdminDashboardDto | null>(null);
    loading = signal<boolean>(true);
    errorMsg = signal<string | null>(null);
    queueFilter: QueueFilter = 'all';

    queueColumns: string[] = ['name', 'plan', 'validUpto', 'status', 'actions'];

    /** Method (not computed) so the filter chip's plain ngModel change re-runs on
     * the next change-detection pass. Using computed() with a non-signal field
     * would miss the chip toggles — same gotcha that bit other components in
     * Phase 2.30 / 2.36e / etc. */
    filteredQueue(): DashboardTenantRow[] {
        const d = this.dash();
        if (!d) return [];
        switch (this.queueFilter) {
            case 'expiring7': return d.actionQueue.filter(r => r.isSystemActive && r.daysUntilExpiry >= 0 && r.daysUntilExpiry <= 7);
            case 'expiring14': return d.actionQueue.filter(r => r.isSystemActive && r.daysUntilExpiry >= 0 && r.daysUntilExpiry <= 14);
            case 'overdue': return d.actionQueue.filter(r => r.isSystemActive && r.daysUntilExpiry < 0);
            case 'suspended': return d.actionQueue.filter(r => !r.isSystemActive);
            default: return d.actionQueue;
        }
    }

    ngOnInit(): void { this.reload(); }

    reload(): void {
        this.loading.set(true);
        this.errorMsg.set(null);
        this.api.get().subscribe({
            next: d => { this.dash.set(d); this.loading.set(false); },
            error: err => {
                this.loading.set(false);
                this.errorMsg.set(err?.error?.exception ?? err?.error?.title ?? 'Failed to load dashboard.');
            },
        });
    }

    /** Renders the "+15% vs last month" delta when both this and last month have data. */
    deltaPct(d: AdminDashboardDto): { value: number; label: string } | null {
        if (d.collectedLastMonth <= 0) return null;
        const v = ((d.collectedThisMonth - d.collectedLastMonth) / d.collectedLastMonth) * 100;
        const rounded = Math.round(v);
        return { value: rounded, label: `${rounded >= 0 ? '+' : ''}${rounded}%` };
    }

    openRecordPayment(row: DashboardTenantRow): void {
        const data: RecordPaymentDialogData = {
            tenantId: row.id,
            tenantName: row.name,
            currentValidUpto: row.validUpto,
        };
        this.dialog.open(RecordPaymentDialogComponent, { width: '520px', data }).afterClosed().subscribe(ok => {
            if (ok) this.reload();
        });
    }
}
