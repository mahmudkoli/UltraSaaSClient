import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MyBillingService } from 'app/core/billing/billing.service';
import { MySubscriptionDto, TenantPaymentDto } from 'app/core/billing/billing.types';
import { TranslocoModule } from '@ngneat/transloco';

/**
 * Tenant-side "My Subscription" page. Admin-role only (gated server-side by
 * Subscription.View). Shows the current plan card + month-range-filterable
 * payment history. Date range default: last 12 months.
 */
@Component({
    selector: 'app-my-subscription',
    standalone: true,
    imports: [
        CommonModule, FormsModule, MatButtonModule, MatDatepickerModule, MatFormFieldModule,
        MatIconModule, MatInputModule, MatNativeDateModule, MatTableModule, MatTooltipModule,
        TranslocoModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 p-4 sm:p-6">
    <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
            <mat-icon class="text-white">card_membership</mat-icon>
        </div>
        <div>
            <h1 class="text-2xl font-bold">{{ 'ADMIN.SUBSCRIPTION.MY.TITLE' | transloco }}</h1>
            <p class="text-sm text-gray-500">{{ 'ADMIN.SUBSCRIPTION.MY.SUBTITLE' | transloco }}</p>
        </div>
    </div>

    @if (sub(); as s) {
        <!-- Plan card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-5 mb-6">
            <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div class="text-xs uppercase tracking-wider text-gray-500">{{ 'ADMIN.SUBSCRIPTION.MY.CURRENT_PLAN' | transloco }}</div>
                    <div class="text-2xl font-bold mt-1">{{ s.plan?.name || s.paymentStatus }}</div>
                    @if (s.plan) {
                        <div class="text-sm text-gray-600 mt-1">{{ 'ADMIN.SUBSCRIPTION.MY.PLAN_LINE' | transloco:{ fee: (s.plan.monthlyFeeBDT | number:'1.0-2'), outlets: s.plan.maxOutlets, users: s.plan.maxUsers } }}</div>
                    }
                </div>
                <div class="text-right">
                    <div class="text-xs uppercase tracking-wider text-gray-500">{{ 'ADMIN.SUBSCRIPTION.MY.VALID_UNTIL' | transloco }}</div>
                    <div class="text-2xl font-bold mt-1" [class.text-rose-600]="s.severity === 'urgent'" [class.text-amber-600]="s.severity === 'warning'">
                        {{ s.validUpto | date:'mediumDate' }}
                    </div>
                    <div class="text-xs mt-1" [class.text-rose-600]="s.daysUntilExpiry < 0" [class.text-amber-600]="s.daysUntilExpiry >= 0 && s.daysUntilExpiry <= 7">
                        {{ (s.daysUntilExpiry < 0 ? 'ADMIN.SUBSCRIPTION.MY.EXPIRED_AGO' : 'ADMIN.SUBSCRIPTION.MY.DAYS_REMAINING') | transloco:{ days: s.daysUntilExpiry < 0 ? -s.daysUntilExpiry : s.daysUntilExpiry } }}
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm">
                <div>
                    <div class="text-xs uppercase tracking-wider text-gray-500">{{ 'ADMIN.SUBSCRIPTION.MY.STATUS' | transloco }}</div>
                    <div class="font-medium mt-1" [class.text-emerald-600]="s.isSystemActive" [class.text-rose-600]="!s.isSystemActive">{{ s.isSystemActive ? s.paymentStatus : ('ADMIN.SUBSCRIPTION.MY.SUSPENDED' | transloco) }}</div>
                </div>
                <div>
                    <div class="text-xs uppercase tracking-wider text-gray-500">{{ 'ADMIN.SUBSCRIPTION.MY.LAST_PAYMENT' | transloco }}</div>
                    <div class="font-medium mt-1">{{ s.lastPaymentDate ? (s.lastPaymentDate | date:'mediumDate') : '—' }}</div>
                </div>
                <div>
                    <div class="text-xs uppercase tracking-wider text-gray-500">{{ 'ADMIN.SUBSCRIPTION.MY.NEXT_RENEWAL' | transloco }}</div>
                    <div class="font-medium mt-1">{{ s.nextBillingDate ? (s.nextBillingDate | date:'mediumDate') : '—' }}</div>
                </div>
                <div>
                    <div class="text-xs uppercase tracking-wider text-gray-500">{{ 'ADMIN.SUBSCRIPTION.MY.TENANT' | transloco }}</div>
                    <div class="font-medium mt-1">{{ s.tenantName }}</div>
                </div>
            </div>
            @if (s.severity !== 'none') {
                <!-- Tailwind's dark: modifier can't be used inside [class.X] bracket
                     notation (Angular parser stumbles on the colon); use [ngClass]
                     with a string instead so the dark-mode variant comes along. -->
                <div class="mt-4 p-3 rounded-lg"
                     [ngClass]="s.severity === 'urgent' ? 'bg-rose-50 dark:bg-rose-900/30' : 'bg-amber-50 dark:bg-amber-900/30'">
                    <p class="text-sm"
                       [ngClass]="s.severity === 'urgent' ? 'text-rose-800 dark:text-rose-200' : 'text-amber-800 dark:text-amber-200'">
                        @if (s.severity === 'urgent') {
                            {{ 'ADMIN.SUBSCRIPTION.MY.WARNING_URGENT' | transloco }}
                        } @else {
                            {{ 'ADMIN.SUBSCRIPTION.MY.WARNING_WARNING' | transloco:{ days: s.daysUntilExpiry } }}
                        }
                    </p>
                </div>
            }
        </div>

        <!-- Payment history -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700">
            <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-3">
                <div class="flex items-center gap-3">
                    <mat-icon class="text-emerald-600">history</mat-icon>
                    <h3 class="text-lg font-semibold">{{ 'ADMIN.SUBSCRIPTION.MY.PAYMENT_HISTORY' | transloco }}</h3>
                    <span class="text-xs text-gray-500">{{ 'ADMIN.SUBSCRIPTION.MY.RECORDS_COUNT' | transloco:{ count: payments().length } }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-44">
                        <mat-label>{{ 'ADMIN.SUBSCRIPTION.MY.FROM_LABEL' | transloco }}</mat-label>
                        <input matInput [matDatepicker]="fromPicker" [(ngModel)]="from" (dateChange)="reloadPayments()">
                        <mat-datepicker-toggle matIconSuffix [for]="fromPicker"></mat-datepicker-toggle>
                        <mat-datepicker #fromPicker></mat-datepicker>
                    </mat-form-field>
                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-44">
                        <mat-label>{{ 'ADMIN.SUBSCRIPTION.MY.TO_LABEL' | transloco }}</mat-label>
                        <input matInput [matDatepicker]="toPicker" [(ngModel)]="to" (dateChange)="reloadPayments()">
                        <mat-datepicker-toggle matIconSuffix [for]="toPicker"></mat-datepicker-toggle>
                        <mat-datepicker #toPicker></mat-datepicker>
                    </mat-form-field>
                </div>
            </div>
            @if (loadingPayments()) {
                <div class="p-5 text-gray-500 text-sm">{{ 'ADMIN.SUBSCRIPTION.MY.LOADING_PAYMENTS' | transloco }}</div>
            } @else if (payments().length === 0) {
                <div class="p-6 text-center text-gray-500 text-sm">{{ 'ADMIN.SUBSCRIPTION.MY.NO_PAYMENTS' | transloco }}</div>
            } @else {
                <table mat-table [dataSource]="payments()" class="w-full">
                    <ng-container matColumnDef="paidOn">
                        <th mat-header-cell *matHeaderCellDef class="pl-5"><span class="text-xs font-medium text-gray-500 uppercase">{{ 'ADMIN.SUBSCRIPTION.MY.COL_PAID_ON' | transloco }}</span></th>
                        <td mat-cell *matCellDef="let p" class="pl-5">{{ p.paidOn | date:'mediumDate' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="period">
                        <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase">{{ 'ADMIN.SUBSCRIPTION.MY.COL_PERIOD' | transloco }}</span></th>
                        <td mat-cell *matCellDef="let p">{{ p.periodStart | date:'shortDate' }} → {{ p.periodEnd | date:'shortDate' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="amount">
                        <th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase">{{ 'ADMIN.SUBSCRIPTION.MY.COL_AMOUNT' | transloco }}</span></th>
                        <td mat-cell *matCellDef="let p" class="!text-right font-semibold">{{ 'ADMIN.PLAN.LIST.FEE_FORMAT' | transloco:{ fee: (p.amount | number:'1.0-2') } }}</td>
                    </ng-container>
                    <ng-container matColumnDef="method">
                        <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase">{{ 'ADMIN.SUBSCRIPTION.MY.COL_METHOD' | transloco }}</span></th>
                        <td mat-cell *matCellDef="let p">{{ p.method }}</td>
                    </ng-container>
                    <ng-container matColumnDef="reference">
                        <th mat-header-cell *matHeaderCellDef class="pr-5"><span class="text-xs font-medium text-gray-500 uppercase">{{ 'ADMIN.SUBSCRIPTION.MY.COL_REFERENCE' | transloco }}</span></th>
                        <td mat-cell *matCellDef="let p" class="pr-5 font-mono text-xs">{{ p.reference || '—' }}</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                    <tr mat-row *matRowDef="let row; columns: cols"></tr>
                </table>
            }
        </div>
    } @else if (loadingSub()) {
        <div class="flex items-center gap-3 text-gray-500"><mat-icon class="icon-size-5 animate-spin">progress_activity</mat-icon><span>{{ 'ADMIN.SUBSCRIPTION.MY.LOADING' | transloco }}</span></div>
    } @else if (errorMsg()) {
        <div class="bg-rose-50 border-l-4 border-rose-500 p-4 text-rose-800">{{ errorMsg() }}</div>
    }
</div>
    `,
})
export class MySubscriptionComponent implements OnInit {
    private readonly api = inject(MyBillingService);

    sub = signal<MySubscriptionDto | null>(null);
    payments = signal<TenantPaymentDto[]>([]);
    loadingSub = signal(true);
    loadingPayments = signal(true);
    errorMsg = signal<string | null>(null);

    cols = ['paidOn', 'period', 'amount', 'method', 'reference'];

    /** Default range: last 12 months. */
    from: Date = (() => { const d = new Date(); d.setMonth(d.getMonth() - 12); return d; })();
    to: Date = new Date();

    ngOnInit(): void {
        this.api.getMySubscription().subscribe({
            next: s => { this.sub.set(s); this.loadingSub.set(false); },
            error: err => {
                this.loadingSub.set(false);
                this.errorMsg.set(err?.error?.exception ?? err?.error?.title ?? 'Failed to load subscription.');
            },
        });
        this.reloadPayments();
    }

    reloadPayments(): void {
        this.loadingPayments.set(true);
        this.api.getMyPayments({
            from: this.from?.toISOString(),
            to: this.to?.toISOString(),
        }).subscribe({
            next: list => { this.payments.set(list ?? []); this.loadingPayments.set(false); },
            error: () => { this.payments.set([]); this.loadingPayments.set(false); },
        });
    }
}
