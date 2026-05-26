import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { MyBillingService } from 'app/core/billing/billing.service';
import { MySubscriptionDto } from 'app/core/billing/billing.types';

/**
 * Phase 2.52 — the lockout page tenant-side users land on when their
 * subscription is suspended. Read-only by design: the cashier sees a clear
 * "what happened + who to contact" block, not a generic toast. Sign-out is
 * always available; everything else is gated by `SubscriptionGuard`.
 */
@Component({
    selector: 'app-subscription-expired',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterModule, TranslocoModule],
    template: `
<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50 dark:from-rose-950/40 dark:via-gray-900 dark:to-amber-950/40 p-6">
    <div class="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-rose-200 dark:border-rose-700 overflow-hidden">
        <div class="px-8 pt-8 pb-2 flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                <mat-icon class="text-rose-600 icon-size-8">lock</mat-icon>
            </div>
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ 'SUBSCRIPTION_EXPIRED.TITLE' | transloco }}</h1>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ 'SUBSCRIPTION_EXPIRED.SUBTITLE' | transloco }}</p>
            </div>
        </div>

        <div *ngIf="loading()" class="flex justify-center py-10">
            <mat-spinner diameter="32"></mat-spinner>
        </div>

        <div *ngIf="!loading() && info() as sub" class="px-8 py-6 space-y-5 text-sm text-gray-800 dark:text-gray-100">

            <!-- Tenant + reason -->
            <div class="space-y-1">
                <div class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{{ 'SUBSCRIPTION_EXPIRED.TENANT' | transloco }}</div>
                <div class="font-semibold text-base">{{ sub.tenantName }}</div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <div class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{{ 'SUBSCRIPTION_EXPIRED.STATUS' | transloco }}</div>
                    <div class="font-medium text-rose-700 dark:text-rose-300 capitalize">
                        {{ sub.paymentStatus || ('SUBSCRIPTION_EXPIRED.STATUS_SUSPENDED' | transloco) }}
                    </div>
                </div>
                <div>
                    <div class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{{ 'SUBSCRIPTION_EXPIRED.VALID_UNTIL' | transloco }}</div>
                    <div class="font-medium">
                        {{ sub.validUpto | date:'mediumDate' }}
                        <span *ngIf="sub.daysUntilExpiry < 0" class="text-rose-600 dark:text-rose-400 text-xs ml-1">
                            ({{ 'SUBSCRIPTION_EXPIRED.EXPIRED_AGO' | transloco:{ days: -sub.daysUntilExpiry } }})
                        </span>
                    </div>
                </div>
                <div *ngIf="sub.lastPaymentDate">
                    <div class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{{ 'SUBSCRIPTION_EXPIRED.LAST_PAYMENT' | transloco }}</div>
                    <div class="font-medium">{{ sub.lastPaymentDate | date:'mediumDate' }}</div>
                </div>
                <div *ngIf="sub.plan">
                    <div class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{{ 'SUBSCRIPTION_EXPIRED.PLAN' | transloco }}</div>
                    <div class="font-medium">{{ 'SUBSCRIPTION_EXPIRED.PLAN_PRICE_FORMAT' | transloco:{ name: sub.plan.name, price: sub.plan.monthlyFeeBDT } }}</div>
                </div>
            </div>

            <div *ngIf="sub.suspensionReason" class="p-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200">
                <div class="font-semibold mb-1 flex items-center gap-2">
                    <mat-icon class="icon-size-5">info</mat-icon>
                    {{ 'SUBSCRIPTION_EXPIRED.REASON' | transloco }}
                </div>
                <div class="text-sm">{{ sub.suspensionReason }}</div>
                <div *ngIf="sub.suspendedUntil" class="text-xs mt-1 opacity-80">
                    {{ 'SUBSCRIPTION_EXPIRED.SUSPENDED_UNTIL' | transloco:{ date: (sub.suspendedUntil | date:'mediumDate') } }}
                </div>
            </div>

            <!-- What to do -->
            <div class="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div class="font-semibold text-amber-900 dark:text-amber-100 mb-1.5 flex items-center gap-2">
                    <mat-icon class="icon-size-5">support_agent</mat-icon>
                    {{ 'SUBSCRIPTION_EXPIRED.WHAT_TO_DO' | transloco }}
                </div>
                <ul class="list-disc list-inside text-sm text-amber-900 dark:text-amber-100 space-y-1">
                    <li *ngIf="sub.technicalAdminEmail">
                        {{ 'SUBSCRIPTION_EXPIRED.WTD_TENANT_ADMIN_PREFIX' | transloco }} <a [href]="'mailto:' + sub.technicalAdminEmail" class="underline font-medium">{{ sub.technicalAdminEmail }}</a> {{ 'SUBSCRIPTION_EXPIRED.WTD_TENANT_ADMIN_SUFFIX' | transloco }}
                    </li>
                    <li>{{ 'SUBSCRIPTION_EXPIRED.WTD_CONTACT_PREFIX' | transloco }} <a [href]="'mailto:' + supportEmail" class="underline font-medium">{{ supportEmail }}</a> {{ 'SUBSCRIPTION_EXPIRED.WTD_CONTACT_SUFFIX' | transloco }}</li>
                    <li>{{ 'SUBSCRIPTION_EXPIRED.WTD_AUTO_REFRESH' | transloco }}</li>
                </ul>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 pt-2">
                <button mat-stroked-button color="primary" (click)="refresh()">
                    <mat-icon class="mr-2">refresh</mat-icon>
                    {{ 'SUBSCRIPTION_EXPIRED.BUTTON_CHECK_AGAIN' | transloco }}
                </button>
                <button mat-stroked-button [routerLink]="['/sign-out']">
                    <mat-icon class="mr-2">logout</mat-icon>
                    {{ 'SUBSCRIPTION_EXPIRED.BUTTON_SIGN_OUT' | transloco }}
                </button>
            </div>
        </div>

        <div *ngIf="!loading() && !info()" class="px-8 pb-8 text-sm text-gray-600 dark:text-gray-400">
            {{ 'SUBSCRIPTION_EXPIRED.LOAD_ERROR' | transloco }}
        </div>
    </div>
</div>
    `,
})
export class SubscriptionExpiredComponent implements OnInit {
    private readonly billing = inject(MyBillingService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    readonly loading = signal(true);
    readonly info = signal<MySubscriptionDto | null>(null);

    /** Hardcoded support contact — keep in sync with the company-brand doc. */
    readonly supportEmail = 'support@mkcorex.com';

    ngOnInit(): void {
        this.refresh();
    }

    refresh(): void {
        this.loading.set(true);
        this.billing.getMySubscription().subscribe({
            next: (dto) => {
                this.info.set(dto);
                this.loading.set(false);
                // If the tenant is now active, bounce back to where they came from.
                if (dto.isSystemActive) {
                    const ret = this.route.snapshot.queryParamMap.get('return') ?? '/dashboard';
                    this.router.navigateByUrl(ret);
                }
            },
            error: () => {
                this.loading.set(false);
            },
        });
    }
}
