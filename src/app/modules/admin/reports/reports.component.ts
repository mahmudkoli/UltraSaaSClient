import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ReportsService } from 'app/core/reports/reports.service';
import { ExpiringBatch, InventoryOnHandRow, LowStockAlert, PurchaseSummary, SalesSummary, TopProduct } from 'app/core/reports/reports.types';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTableModule, MatTabsModule],
    template: `
        <div class="p-6">
            <h2 class="text-2xl font-semibold mb-4">Reports</h2>

            <div class="flex items-center gap-3 mb-4">
                <mat-form-field appearance="outline" class="!my-0">
                    <mat-label>From</mat-label>
                    <input matInput type="date" [(ngModel)]="fromDate" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="!my-0">
                    <mat-label>To</mat-label>
                    <input matInput type="date" [(ngModel)]="toDate" />
                </mat-form-field>
                <button mat-raised-button color="primary" (click)="reload()">Apply</button>
            </div>

            <mat-tab-group (selectedIndexChange)="tabChange($event)">
                <mat-tab label="Sales Summary">
                    @if (sales()) {
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                            <mat-card class="!p-3"><div class="text-xs text-gray-500">Orders</div><div class="text-2xl font-bold">{{ sales()!.totalSales }}</div></mat-card>
                            <mat-card class="!p-3"><div class="text-xs text-gray-500">Net Revenue</div><div class="text-2xl font-bold">{{ sales()!.netRevenue | number:'1.2-2' }}</div></mat-card>
                            <mat-card class="!p-3"><div class="text-xs text-gray-500">Avg Basket</div><div class="text-2xl font-bold">{{ sales()!.averageBasketValue | number:'1.2-2' }}</div></mat-card>
                            <mat-card class="!p-3"><div class="text-xs text-gray-500">Voided</div><div class="text-2xl font-bold">{{ sales()!.voidedSales }}</div></mat-card>
                        </div>
                        <h3 class="font-semibold mt-6 mb-2">By Day</h3>
                        <table mat-table [dataSource]="sales()!.byDay" class="w-full">
                            <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let r">{{ r.date | date:'shortDate' }}</td></ng-container>
                            <ng-container matColumnDef="count"><th mat-header-cell *matHeaderCellDef>Orders</th><td mat-cell *matCellDef="let r">{{ r.orderCount }}</td></ng-container>
                            <ng-container matColumnDef="rev"><th mat-header-cell *matHeaderCellDef class="text-right">Revenue</th><td mat-cell *matCellDef="let r" class="text-right">{{ r.revenue | number:'1.2-2' }}</td></ng-container>
                            <tr mat-header-row *matHeaderRowDef="['date','count','rev']"></tr>
                            <tr mat-row *matRowDef="let row; columns: ['date','count','rev']"></tr>
                        </table>
                        <h3 class="font-semibold mt-6 mb-2">By Payment Method</h3>
                        <table mat-table [dataSource]="sales()!.byPaymentMethod" class="w-full">
                            <ng-container matColumnDef="method"><th mat-header-cell *matHeaderCellDef>Method</th><td mat-cell *matCellDef="let r">{{ r.method }}</td></ng-container>
                            <ng-container matColumnDef="count"><th mat-header-cell *matHeaderCellDef>Count</th><td mat-cell *matCellDef="let r">{{ r.count }}</td></ng-container>
                            <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef class="text-right">Total</th><td mat-cell *matCellDef="let r" class="text-right">{{ r.total | number:'1.2-2' }}</td></ng-container>
                            <tr mat-header-row *matHeaderRowDef="['method','count','total']"></tr>
                            <tr mat-row *matRowDef="let row; columns: ['method','count','total']"></tr>
                        </table>
                    }
                </mat-tab>

                <mat-tab label="Top Products">
                    <table mat-table [dataSource]="topProducts()" class="w-full mt-4">
                        <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef>SKU</th><td mat-cell *matCellDef="let r">{{ r.sku }}</td></ng-container>
                        <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Product</th><td mat-cell *matCellDef="let r">{{ r.productName }}</td></ng-container>
                        <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="text-right">Qty Sold</th><td mat-cell *matCellDef="let r" class="text-right">{{ r.quantitySold | number:'1.0-3' }}</td></ng-container>
                        <ng-container matColumnDef="rev"><th mat-header-cell *matHeaderCellDef class="text-right">Revenue</th><td mat-cell *matCellDef="let r" class="text-right">{{ r.revenue | number:'1.2-2' }}</td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="['sku','name','qty','rev']"></tr>
                        <tr mat-row *matRowDef="let row; columns: ['sku','name','qty','rev']"></tr>
                    </table>
                </mat-tab>

                <mat-tab label="Inventory">
                    <table mat-table [dataSource]="inventory()" class="w-full mt-4">
                        <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef>SKU</th><td mat-cell *matCellDef="let r">{{ r.sku }}</td></ng-container>
                        <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Product</th><td mat-cell *matCellDef="let r">{{ r.productName }}</td></ng-container>
                        <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="text-right">On Hand</th><td mat-cell *matCellDef="let r" class="text-right">{{ r.quantity | number:'1.0-3' }}</td></ng-container>
                        <ng-container matColumnDef="cost"><th mat-header-cell *matHeaderCellDef class="text-right">Cost</th><td mat-cell *matCellDef="let r" class="text-right">{{ r.costPrice | number:'1.2-2' }}</td></ng-container>
                        <ng-container matColumnDef="value"><th mat-header-cell *matHeaderCellDef class="text-right">Value at Cost</th><td mat-cell *matCellDef="let r" class="text-right font-semibold">{{ r.inventoryValueAtCost | number:'1.2-2' }}</td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="['sku','name','qty','cost','value']"></tr>
                        <tr mat-row *matRowDef="let row; columns: ['sku','name','qty','cost','value']"></tr>
                    </table>
                </mat-tab>

                <mat-tab label="Low Stock">
                    <table mat-table [dataSource]="lowStock()" class="w-full mt-4">
                        <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef>SKU</th><td mat-cell *matCellDef="let r">{{ r.sku }}</td></ng-container>
                        <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Product</th><td mat-cell *matCellDef="let r">{{ r.productName }}</td></ng-container>
                        <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="text-right">On Hand</th><td mat-cell *matCellDef="let r" class="text-right">{{ r.quantity | number:'1.0-3' }}</td></ng-container>
                        <ng-container matColumnDef="reorder"><th mat-header-cell *matHeaderCellDef class="text-right">Reorder At</th><td mat-cell *matCellDef="let r" class="text-right">{{ r.reorderLevel | number:'1.0-3' }}</td></ng-container>
                        <ng-container matColumnDef="short"><th mat-header-cell *matHeaderCellDef class="text-right">Shortfall</th><td mat-cell *matCellDef="let r" class="text-right text-red-600 font-semibold">{{ r.shortfall | number:'1.0-3' }}</td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="['sku','name','qty','reorder','short']"></tr>
                        <tr mat-row *matRowDef="let row; columns: ['sku','name','qty','reorder','short']"></tr>
                    </table>
                </mat-tab>

                <mat-tab label="Expiring">
                    <table mat-table [dataSource]="expiring()" class="w-full mt-4">
                        <ng-container matColumnDef="batch"><th mat-header-cell *matHeaderCellDef>Batch</th><td mat-cell *matCellDef="let r">{{ r.batchNumber }}</td></ng-container>
                        <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Product</th><td mat-cell *matCellDef="let r">{{ r.productName }}</td></ng-container>
                        <ng-container matColumnDef="exp"><th mat-header-cell *matHeaderCellDef>Expiry</th><td mat-cell *matCellDef="let r">{{ r.expiryDate | date:'shortDate' }}</td></ng-container>
                        <ng-container matColumnDef="days"><th mat-header-cell *matHeaderCellDef class="text-right">Days</th><td mat-cell *matCellDef="let r" class="text-right">{{ r.daysToExpiry }}</td></ng-container>
                        <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="text-right">Qty</th><td mat-cell *matCellDef="let r" class="text-right">{{ r.remainingQuantity | number:'1.0-3' }}</td></ng-container>
                        <ng-container matColumnDef="risk"><th mat-header-cell *matHeaderCellDef class="text-right">At Risk</th><td mat-cell *matCellDef="let r" class="text-right">{{ r.costValueAtRisk | number:'1.2-2' }}</td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="['batch','name','exp','days','qty','risk']"></tr>
                        <tr mat-row *matRowDef="let row; columns: ['batch','name','exp','days','qty','risk']"></tr>
                    </table>
                </mat-tab>

                <mat-tab label="Purchasing">
                    @if (purchases()) {
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                            <mat-card class="!p-3"><div class="text-xs text-gray-500">POs</div><div class="text-2xl font-bold">{{ purchases()!.totalPurchaseOrders }}</div></mat-card>
                            <mat-card class="!p-3"><div class="text-xs text-gray-500">Receipts</div><div class="text-2xl font-bold">{{ purchases()!.totalReceipts }}</div></mat-card>
                            <mat-card class="!p-3"><div class="text-xs text-gray-500">Total Value</div><div class="text-2xl font-bold">{{ purchases()!.totalPurchaseValue | number:'1.2-2' }}</div></mat-card>
                        </div>
                        <h3 class="font-semibold mt-6 mb-2">By Supplier</h3>
                        <table mat-table [dataSource]="purchases()!.bySupplier" class="w-full">
                            <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Supplier</th><td mat-cell *matCellDef="let r">{{ r.supplierName }}</td></ng-container>
                            <ng-container matColumnDef="count"><th mat-header-cell *matHeaderCellDef>Orders</th><td mat-cell *matCellDef="let r">{{ r.orderCount }}</td></ng-container>
                            <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef class="text-right">Total</th><td mat-cell *matCellDef="let r" class="text-right">{{ r.total | number:'1.2-2' }}</td></ng-container>
                            <tr mat-header-row *matHeaderRowDef="['name','count','total']"></tr>
                            <tr mat-row *matRowDef="let row; columns: ['name','count','total']"></tr>
                        </table>
                    }
                </mat-tab>
            </mat-tab-group>
        </div>
    `,
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

    tabChange(_idx: number): void { /* could lazy-load per tab */ }
}
