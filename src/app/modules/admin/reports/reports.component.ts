import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReportsService } from 'app/core/reports/reports.service';
import {
    ExpiringBatch, InventoryOnHandRow, LowStockAlert, PurchaseSummary, SalesSummary, TopProduct,
} from 'app/core/reports/reports.types';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatSelectModule, MatTableModule, MatTabsModule, MatTooltipModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-fuchsia-500 to-pink-600 rounded-xl shadow-lg"><mat-icon class="text-white">analytics</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Reports</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Sales, inventory, expiring batches, and purchasing</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <mat-form-field class="w-full sm:w-auto sm:min-w-44" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>From</mat-label>
                    <input matInput type="date" [(ngModel)]="fromDate">
                </mat-form-field>
                <mat-form-field class="w-full sm:w-auto sm:min-w-44" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>To</mat-label>
                    <input matInput type="date" [(ngModel)]="toDate">
                </mat-form-field>
                <button mat-flat-button color="primary" class="h-12 px-6 rounded-lg" (click)="reload()" matTooltip="Apply date range">
                    <mat-icon class="icon-size-5 mr-2">refresh</mat-icon><span>Apply</span>
                </button>
            </div>
        </div>

        <!-- Content -->
        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <mat-tab-group mat-stretch-tabs="false" mat-align-tabs="start" class="reports-tabs">

                    <!-- Sales Summary -->
                    <mat-tab>
                        <ng-template mat-tab-label><mat-icon class="icon-size-5 mr-2">trending_up</mat-icon>Sales Summary</ng-template>
                        @if (sales(); as s) {
                            <div class="p-6">
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/40">
                                        <div class="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 text-sm font-medium"><mat-icon class="icon-size-5">receipt_long</mat-icon><span>Orders</span></div>
                                        <div class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{{ s.totalSales }}</div>
                                    </div>
                                    <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40">
                                        <div class="flex items-center space-x-2 text-blue-700 dark:text-blue-300 text-sm font-medium"><mat-icon class="icon-size-5">payments</mat-icon><span>Net Revenue</span></div>
                                        <div class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{{ s.netRevenue | number:'1.2-2' }}</div>
                                    </div>
                                    <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-900/40">
                                        <div class="flex items-center space-x-2 text-violet-700 dark:text-violet-300 text-sm font-medium"><mat-icon class="icon-size-5">shopping_basket</mat-icon><span>Avg Basket</span></div>
                                        <div class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{{ s.averageBasketValue | number:'1.2-2' }}</div>
                                    </div>
                                    <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/40">
                                        <div class="flex items-center space-x-2 text-red-700 dark:text-red-300 text-sm font-medium"><mat-icon class="icon-size-5">cancel</mat-icon><span>Voided</span></div>
                                        <div class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{{ s.voidedSales }}</div>
                                    </div>
                                </div>

                                <h3 class="font-semibold mb-2 flex items-center space-x-2 text-gray-900 dark:text-white"><mat-icon class="icon-size-5 text-gray-500">date_range</mat-icon><span>By Day</span></h3>
                                <div class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                                    <table mat-table [dataSource]="s.byDay" class="w-full">
                                        <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef class="pl-4"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</span></th><td mat-cell *matCellDef="let r" class="pl-4">{{ r.date | date:'shortDate' }}</td></ng-container>
                                        <ng-container matColumnDef="count"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</span></th><td mat-cell *matCellDef="let r">{{ r.orderCount }}</td></ng-container>
                                        <ng-container matColumnDef="rev"><th mat-header-cell *matHeaderCellDef class="pr-4 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</span></th><td mat-cell *matCellDef="let r" class="pr-4 !text-right font-medium">{{ r.revenue | number:'1.2-2' }}</td></ng-container>
                                        <tr mat-header-row *matHeaderRowDef="['date','count','rev']" class="bg-gray-50 dark:bg-gray-700"></tr>
                                        <tr mat-row *matRowDef="let row; columns: ['date','count','rev']"></tr>
                                    </table>
                                </div>

                                <h3 class="font-semibold mb-2 flex items-center space-x-2 text-gray-900 dark:text-white"><mat-icon class="icon-size-5 text-gray-500">credit_card</mat-icon><span>By Payment Method</span></h3>
                                <div class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <table mat-table [dataSource]="s.byPaymentMethod" class="w-full">
                                        <ng-container matColumnDef="method"><th mat-header-cell *matHeaderCellDef class="pl-4"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Method</span></th><td mat-cell *matCellDef="let r" class="pl-4">{{ r.method }}</td></ng-container>
                                        <ng-container matColumnDef="count"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Count</span></th><td mat-cell *matCellDef="let r">{{ r.count }}</td></ng-container>
                                        <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef class="pr-4 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</span></th><td mat-cell *matCellDef="let r" class="pr-4 !text-right font-medium">{{ r.total | number:'1.2-2' }}</td></ng-container>
                                        <tr mat-header-row *matHeaderRowDef="['method','count','total']" class="bg-gray-50 dark:bg-gray-700"></tr>
                                        <tr mat-row *matRowDef="let row; columns: ['method','count','total']"></tr>
                                    </table>
                                </div>
                            </div>
                        }
                    </mat-tab>

                    <!-- Top Products -->
                    <mat-tab>
                        <ng-template mat-tab-label><mat-icon class="icon-size-5 mr-2">star</mat-icon>Top Products</ng-template>
                        <div class="p-6">
                            <div class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <table mat-table [dataSource]="topProducts()" class="w-full">
                                    <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef class="pl-4"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</span></th><td mat-cell *matCellDef="let r" class="pl-4 font-mono text-xs">{{ r.sku }}</td></ng-container>
                                    <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Product</span></th><td mat-cell *matCellDef="let r" class="font-medium">{{ r.productName }}</td></ng-container>
                                    <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Sold</span></th><td mat-cell *matCellDef="let r" class="!text-right">{{ r.quantitySold | number:'1.0-3' }}</td></ng-container>
                                    <ng-container matColumnDef="rev"><th mat-header-cell *matHeaderCellDef class="pr-4 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</span></th><td mat-cell *matCellDef="let r" class="pr-4 !text-right font-semibold">{{ r.revenue | number:'1.2-2' }}</td></ng-container>
                                    <tr mat-header-row *matHeaderRowDef="['sku','name','qty','rev']" class="bg-gray-50 dark:bg-gray-700"></tr>
                                    <tr mat-row *matRowDef="let row; columns: ['sku','name','qty','rev']"></tr>
                                </table>
                                <div *ngIf="topProducts().length === 0" class="p-8 text-center text-gray-500">No sales in this date range.</div>
                            </div>
                        </div>
                    </mat-tab>

                    <!-- Inventory On-Hand -->
                    <mat-tab>
                        <ng-template mat-tab-label><mat-icon class="icon-size-5 mr-2">inventory_2</mat-icon>Inventory</ng-template>
                        <div class="p-6">
                            <div class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <table mat-table [dataSource]="inventory()" class="w-full">
                                    <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef class="pl-4"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</span></th><td mat-cell *matCellDef="let r" class="pl-4 font-mono text-xs">{{ r.sku }}</td></ng-container>
                                    <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Product</span></th><td mat-cell *matCellDef="let r" class="font-medium">{{ r.productName }}</td></ng-container>
                                    <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">On Hand</span></th><td mat-cell *matCellDef="let r" class="!text-right">{{ r.quantity | number:'1.0-3' }}</td></ng-container>
                                    <ng-container matColumnDef="cost"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</span></th><td mat-cell *matCellDef="let r" class="!text-right">{{ r.costPrice | number:'1.2-2' }}</td></ng-container>
                                    <ng-container matColumnDef="value"><th mat-header-cell *matHeaderCellDef class="pr-4 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Value at Cost</span></th><td mat-cell *matCellDef="let r" class="pr-4 !text-right font-semibold">{{ r.inventoryValueAtCost | number:'1.2-2' }}</td></ng-container>
                                    <tr mat-header-row *matHeaderRowDef="['sku','name','qty','cost','value']" class="bg-gray-50 dark:bg-gray-700"></tr>
                                    <tr mat-row *matRowDef="let row; columns: ['sku','name','qty','cost','value']"></tr>
                                </table>
                                <div *ngIf="inventory().length === 0" class="p-8 text-center text-gray-500">No inventory.</div>
                            </div>
                        </div>
                    </mat-tab>

                    <!-- Low Stock -->
                    <mat-tab>
                        <ng-template mat-tab-label><mat-icon class="icon-size-5 mr-2">warning</mat-icon>Low Stock</ng-template>
                        <div class="p-6">
                            <div class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <table mat-table [dataSource]="lowStock()" class="w-full">
                                    <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef class="pl-4"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</span></th><td mat-cell *matCellDef="let r" class="pl-4 font-mono text-xs">{{ r.sku }}</td></ng-container>
                                    <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Product</span></th><td mat-cell *matCellDef="let r" class="font-medium">{{ r.productName }}</td></ng-container>
                                    <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">On Hand</span></th><td mat-cell *matCellDef="let r" class="!text-right">{{ r.quantity | number:'1.0-3' }}</td></ng-container>
                                    <ng-container matColumnDef="reorder"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder At</span></th><td mat-cell *matCellDef="let r" class="!text-right">{{ r.reorderLevel | number:'1.0-3' }}</td></ng-container>
                                    <ng-container matColumnDef="short"><th mat-header-cell *matHeaderCellDef class="pr-4 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Shortfall</span></th><td mat-cell *matCellDef="let r" class="pr-4 !text-right">
                                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">{{ r.shortfall | number:'1.0-3' }}</span>
                                    </td></ng-container>
                                    <tr mat-header-row *matHeaderRowDef="['sku','name','qty','reorder','short']" class="bg-gray-50 dark:bg-gray-700"></tr>
                                    <tr mat-row *matRowDef="let row; columns: ['sku','name','qty','reorder','short']"></tr>
                                </table>
                                <div *ngIf="lowStock().length === 0" class="p-8 text-center text-gray-500">All products are above their reorder level.</div>
                            </div>
                        </div>
                    </mat-tab>

                    <!-- Expiring -->
                    <mat-tab>
                        <ng-template mat-tab-label><mat-icon class="icon-size-5 mr-2">event_busy</mat-icon>Expiring</ng-template>
                        <div class="p-6">
                            <div class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <table mat-table [dataSource]="expiring()" class="w-full">
                                    <ng-container matColumnDef="batch"><th mat-header-cell *matHeaderCellDef class="pl-4"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</span></th><td mat-cell *matCellDef="let r" class="pl-4 font-mono text-xs">{{ r.batchNumber }}</td></ng-container>
                                    <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Product</span></th><td mat-cell *matCellDef="let r" class="font-medium">{{ r.productName }}</td></ng-container>
                                    <ng-container matColumnDef="exp"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</span></th><td mat-cell *matCellDef="let r">{{ r.expiryDate | date:'shortDate' }}</td></ng-container>
                                    <ng-container matColumnDef="days"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Days</span></th><td mat-cell *matCellDef="let r" class="!text-right">
                                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" [ngClass]="r.daysToExpiry < 30 ? 'bg-red-100 text-red-800' : (r.daysToExpiry < 90 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800')">{{ r.daysToExpiry }}d</span>
                                    </td></ng-container>
                                    <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</span></th><td mat-cell *matCellDef="let r" class="!text-right">{{ r.remainingQuantity | number:'1.0-3' }}</td></ng-container>
                                    <ng-container matColumnDef="risk"><th mat-header-cell *matHeaderCellDef class="pr-4 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">At Risk</span></th><td mat-cell *matCellDef="let r" class="pr-4 !text-right font-semibold">{{ r.costValueAtRisk | number:'1.2-2' }}</td></ng-container>
                                    <tr mat-header-row *matHeaderRowDef="['batch','name','exp','days','qty','risk']" class="bg-gray-50 dark:bg-gray-700"></tr>
                                    <tr mat-row *matRowDef="let row; columns: ['batch','name','exp','days','qty','risk']"></tr>
                                </table>
                                <div *ngIf="expiring().length === 0" class="p-8 text-center text-gray-500">No batches expiring in the selected window.</div>
                            </div>
                        </div>
                    </mat-tab>

                    <!-- Purchasing -->
                    <mat-tab>
                        <ng-template mat-tab-label><mat-icon class="icon-size-5 mr-2">local_shipping</mat-icon>Purchasing</ng-template>
                        @if (purchases(); as p) {
                            <div class="p-6">
                                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/40">
                                        <div class="flex items-center space-x-2 text-orange-700 dark:text-orange-300 text-sm font-medium"><mat-icon class="icon-size-5">description</mat-icon><span>POs</span></div>
                                        <div class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{{ p.totalPurchaseOrders }}</div>
                                    </div>
                                    <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-900/40">
                                        <div class="flex items-center space-x-2 text-cyan-700 dark:text-cyan-300 text-sm font-medium"><mat-icon class="icon-size-5">inventory</mat-icon><span>Receipts</span></div>
                                        <div class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{{ p.totalReceipts }}</div>
                                    </div>
                                    <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40">
                                        <div class="flex items-center space-x-2 text-blue-700 dark:text-blue-300 text-sm font-medium"><mat-icon class="icon-size-5">attach_money</mat-icon><span>Total Value</span></div>
                                        <div class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{{ p.totalPurchaseValue | number:'1.2-2' }}</div>
                                    </div>
                                </div>

                                <h3 class="font-semibold mb-2 flex items-center space-x-2 text-gray-900 dark:text-white"><mat-icon class="icon-size-5 text-gray-500">store</mat-icon><span>By Supplier</span></h3>
                                <div class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <table mat-table [dataSource]="p.bySupplier" class="w-full">
                                        <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef class="pl-4"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</span></th><td mat-cell *matCellDef="let r" class="pl-4 font-medium">{{ r.supplierName }}</td></ng-container>
                                        <ng-container matColumnDef="count"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</span></th><td mat-cell *matCellDef="let r">{{ r.orderCount }}</td></ng-container>
                                        <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef class="pr-4 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</span></th><td mat-cell *matCellDef="let r" class="pr-4 !text-right font-semibold">{{ r.total | number:'1.2-2' }}</td></ng-container>
                                        <tr mat-header-row *matHeaderRowDef="['name','count','total']" class="bg-gray-50 dark:bg-gray-700"></tr>
                                        <tr mat-row *matRowDef="let row; columns: ['name','count','total']"></tr>
                                    </table>
                                </div>
                            </div>
                        }
                    </mat-tab>

                </mat-tab-group>
            </div>
        </div>
    </div>
</div>
    `,
    styles: [`
        .reports-tabs ::ng-deep .mat-mdc-tab-header { padding: 0 1rem; border-bottom: 1px solid rgba(0,0,0,0.06); }
    `],
})
export class ReportsComponent implements OnInit {
    private readonly api = inject(ReportsService);
    fromDate = '';
    toDate = '';
    sales = signal<SalesSummary | null>(null);
    topProducts = signal<TopProduct[]>([]);
    inventory = signal<InventoryOnHandRow[]>([]);
    lowStock = signal<LowStockAlert[]>([]);
    expiring = signal<ExpiringBatch[]>([]);
    purchases = signal<PurchaseSummary | null>(null);

    ngOnInit(): void {
        const today = new Date();
        const past = new Date(today);
        past.setDate(today.getDate() - 30);
        this.fromDate = past.toISOString().slice(0, 10);
        this.toDate = today.toISOString().slice(0, 10);
        this.reload();
    }

    reload(): void {
        const params = { fromDate: this.fromDate, toDate: this.toDate };
        this.api.salesSummary(params).subscribe(d => this.sales.set(d));
        this.api.topProducts({ ...params, take: 20 }).subscribe(d => this.topProducts.set(d));
        this.api.inventoryOnHand({ onlyInStock: true, take: 200 }).subscribe(d => this.inventory.set(d));
        this.api.lowStock({ take: 100 }).subscribe(d => this.lowStock.set(d));
        this.api.expiringBatches({ withinDays: 365, take: 100 }).subscribe(d => this.expiring.set(d));
        this.api.purchaseSummary(params).subscribe(d => this.purchases.set(d));
    }
}
