import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { MyDashboardService } from 'app/core/dashboard/my-dashboard.service';
import { MyDashboardDto } from 'app/core/dashboard/my-dashboard.types';
import { TranslocoModule } from '@ngneat/transloco';

/**
 * Phase 2.49 — tenant-side "Home" page. Gated to Subscription-tier owners
 * (Dashboards.View on the Admin role only). Single API call to /api/mydashboard
 * returns everything the page needs; layout stays fixed (no per-user widget
 * customisation per the locked decisions in Plan-Tenant-Dashboard.md).
 */
@Component({
    selector: 'app-my-dashboard',
    standalone: true,
    imports: [
        CommonModule, RouterModule,
        MatButtonModule, MatIconModule, MatTableModule, MatTooltipModule,
        TranslocoModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
    <div class="p-4 sm:p-6">
        <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <mat-icon class="text-white">storefront</mat-icon>
            </div>
            <div>
                <h1 class="text-3xl font-bold tracking-tight">{{ 'ADMIN.HOME.TITLE' | transloco }}</h1>
                <p class="text-sm text-gray-500">{{ 'ADMIN.HOME.SUBTITLE' | transloco }}</p>
            </div>
        </div>

        @if (dash(); as d) {
            <!-- Row 1: KPI cards -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700 col-span-2">
                    <div class="text-xs uppercase tracking-wider text-gray-500">{{ 'ADMIN.HOME.TODAY_REVENUE' | transloco }}</div>
                    <div class="text-2xl font-bold mt-1">{{ d.todayRevenue | number:'1.0-2' }}</div>
                    <div class="text-xs mt-1">
                        @if (d.todayRevenueDeltaPct != null) {
                            <span [class.text-emerald-600]="d.todayRevenueDeltaPct >= 0" [class.text-rose-600]="d.todayRevenueDeltaPct < 0">
                                {{ 'ADMIN.HOME.VS_YESTERDAY' | transloco:{ sign: d.todayRevenueDeltaPct >= 0 ? '+' : '', pct: d.todayRevenueDeltaPct } }}
                            </span>
                        } @else {
                            <span class="text-gray-400">{{ 'ADMIN.HOME.NO_COMPARE' | transloco }}</span>
                        }
                    </div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
                    <div class="text-xs uppercase tracking-wider text-gray-500">{{ 'ADMIN.HOME.SALES_TODAY' | transloco }}</div>
                    <div class="text-2xl font-bold mt-1">{{ d.todaySaleCount }}</div>
                    <div class="text-xs text-gray-400 mt-1">{{ 'ADMIN.HOME.FINALIZED_INVOICES' | transloco }}</div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
                    <div class="text-xs uppercase tracking-wider text-gray-500">{{ 'ADMIN.HOME.TOP_PRODUCT' | transloco }}</div>
                    @if (d.topProductToday; as t) {
                        <div class="text-sm font-semibold mt-1 line-clamp-1" [matTooltip]="t.productName">{{ t.productName }}</div>
                        <div class="text-xs text-gray-500 mt-1">{{ 'ADMIN.HOME.QTY_SOLD' | transloco:{ qty: (t.quantitySold | number:'1.0-3') } }}</div>
                    } @else {
                        <div class="text-sm text-gray-400 mt-1">{{ 'ADMIN.HOME.NO_SALES_YET' | transloco }}</div>
                    }
                </div>
                <a [routerLink]="['/inventory']" class="block bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition no-underline">
                    <div class="text-xs uppercase tracking-wider text-gray-500">{{ 'ADMIN.HOME.LOW_STOCK' | transloco }}</div>
                    <div class="text-2xl font-bold mt-1" [class.text-amber-600]="d.lowStockCount > 0">{{ d.lowStockCount }}</div>
                    <div class="text-xs text-gray-400 mt-1">{{ 'ADMIN.HOME.BELOW_REORDER' | transloco }}</div>
                </a>
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
                    <div class="text-xs uppercase tracking-wider text-gray-500">{{ 'ADMIN.HOME.OPEN_SHIFT' | transloco }}</div>
                    @if (d.openShift; as s) {
                        <a [routerLink]="['/shifts', s.shiftId, 'report']" class="block">
                            <div class="text-sm font-semibold mt-1 text-emerald-600">{{ 'ADMIN.HOME.SHIFT_OPEN' | transloco }}</div>
                            <div class="text-xs text-gray-500 mt-1">{{ 'ADMIN.HOME.SHIFT_SINCE' | transloco:{ time: (s.openedAt | date:'shortTime') } }}</div>
                        </a>
                    } @else {
                        <div class="text-sm text-amber-600 font-semibold mt-1">{{ 'ADMIN.HOME.SHIFT_NONE' | transloco }}</div>
                        <a routerLink="/shifts" class="text-xs underline">{{ 'ADMIN.HOME.OPEN_ONE' | transloco }}</a>
                    }
                </div>
            </div>

            <!-- Row 2: Recent sales + outlet snapshot -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700">
                    <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                        <mat-icon class="text-violet-600">receipt_long</mat-icon>
                        <h3 class="text-lg font-semibold">{{ 'ADMIN.HOME.RECENT_SALES' | transloco }}</h3>
                    </div>
                    @if (d.recentSales.length === 0) {
                        <div class="p-6 text-center text-gray-500 text-sm">{{ 'ADMIN.HOME.NO_SALES_FINALIZED' | transloco }}</div>
                    } @else {
                        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                            @for (s of d.recentSales; track s.id) {
                                <li class="px-5 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <div>
                                        <a [routerLink]="['/sales', s.id]" class="font-medium text-indigo-600 hover:underline">{{ s.invoiceNumber }}</a>
                                        <div class="text-xs text-gray-500">{{ s.customerName || ('ADMIN.HOME.WALK_IN' | transloco) }} · {{ s.saleDate | date:'shortTime' }}</div>
                                    </div>
                                    <div class="text-lg font-semibold">{{ 'ADMIN.PLAN.LIST.FEE_FORMAT' | transloco:{ fee: (s.total | number:'1.0-2') } }}</div>
                                </li>
                            }
                        </ul>
                    }
                </div>

                @if (d.outlets.length > 0) {
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700">
                        <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                            <mat-icon class="text-blue-600">store</mat-icon>
                            <h3 class="text-lg font-semibold">{{ 'ADMIN.HOME.BY_OUTLET_TODAY' | transloco }}</h3>
                        </div>
                        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                            @for (o of d.outlets; track o.outletId) {
                                <li class="px-5 py-3 flex items-center justify-between">
                                    <div>
                                        <div class="font-medium">{{ o.outletName }}</div>
                                        <div class="text-xs text-gray-500">{{ 'ADMIN.HOME.SALE_COUNT' | transloco:{ count: o.todaySaleCount } }}</div>
                                    </div>
                                    <div class="text-sm font-semibold">{{ 'ADMIN.PLAN.LIST.FEE_FORMAT' | transloco:{ fee: (o.todayRevenue | number:'1.0-2') } }}</div>
                                </li>
                            }
                        </ul>
                    </div>
                }
            </div>

            <!-- Row 3: Action items (only when non-empty) -->
            @if (d.actionItems.length > 0) {
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700">
                    <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                        <mat-icon class="text-amber-600">priority_high</mat-icon>
                        <h3 class="text-lg font-semibold">{{ 'ADMIN.HOME.ACTION_ITEMS' | transloco }}</h3>
                    </div>
                    <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                        @for (a of d.actionItems; track a.kind) {
                            <li class="px-5 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <div class="flex items-center gap-3">
                                    <mat-icon class="text-amber-500">{{ iconFor(a.kind) }}</mat-icon>
                                    <span>{{ a.label }}</span>
                                </div>
                                <a [routerLink]="a.linkUrl" class="text-sm text-indigo-600 hover:underline">{{ 'ADMIN.HOME.VIEW_LINK' | transloco }}</a>
                            </li>
                        }
                    </ul>
                </div>
            }
        } @else if (loading()) {
            <div class="flex items-center gap-3 text-gray-500"><mat-icon class="icon-size-5 animate-spin">progress_activity</mat-icon><span>{{ 'ADMIN.HOME.LOADING' | transloco }}</span></div>
        } @else if (errorMsg()) {
            <div class="bg-rose-50 dark:bg-rose-900/30 border-l-4 border-rose-500 p-4 text-rose-800 dark:text-rose-200">{{ errorMsg() }}</div>
        }
    </div>
</div>
    `,
})
export class MyDashboardComponent implements OnInit {
    private readonly api = inject(MyDashboardService);

    dash = signal<MyDashboardDto | null>(null);
    loading = signal<boolean>(true);
    errorMsg = signal<string | null>(null);

    ngOnInit(): void {
        this.api.get().subscribe({
            next: d => { this.dash.set(d); this.loading.set(false); },
            error: err => {
                this.loading.set(false);
                this.errorMsg.set(err?.error?.exception ?? err?.error?.title ?? 'Failed to load dashboard.');
            },
        });
    }

    iconFor(kind: string): string {
        switch (kind) {
            case 'lowStock': return 'inventory_2';
            case 'noShift': return 'event_busy';
            case 'subscriptionExpiring': return 'credit_card';
            case 'expiringBatches': return 'event';
            default: return 'info';
        }
    }
}
