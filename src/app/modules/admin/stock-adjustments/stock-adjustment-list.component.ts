import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { StockAdjustmentsService } from 'app/core/inventory/inventory.service';
import { StockAdjustmentDto } from 'app/core/inventory/inventory.types';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletDto } from 'app/core/outlets/outlets.types';
import { CurrentOutletService } from 'app/core/outlets/current-outlet.service';
import { ProductsService } from 'app/core/catalog/catalog.service';
import { ProductDto } from 'app/core/catalog/catalog.types';

@Component({
    selector: 'app-stock-adjustment-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatSelectModule, MatTableModule, MatTooltipModule],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl shadow-lg"><mat-icon class="text-white">tune</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Stock Adjustments</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Physical counts, damage write-offs, expiry, corrections</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-48">
                    <mat-label>Outlet</mat-label>
                    <mat-select [(ngModel)]="outletFilter" (ngModelChange)="load()">
                        <mat-option [value]="''">All</mat-option>
                        @for (o of outlets(); track o.id) { <mat-option [value]="o.id">{{ o.name }}</mat-option> }
                    </mat-select>
                </mat-form-field>
                <button mat-fab color="primary" routerLink="create" matTooltip="New adjustment"><mat-icon>add</mat-icon></button>
            </div>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="relative overflow-x-auto">
                    <table mat-table [dataSource]="rows()" class="w-full">
                        <ng-container matColumnDef="when"><th mat-header-cell *matHeaderCellDef class="pl-4 sm:pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">When</span></th>
                            <td mat-cell *matCellDef="let r" class="pl-4 sm:pl-6">{{ r.adjustedOn | date:'short' }}</td></ng-container>
                        <ng-container matColumnDef="product"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Product</span></th>
                            <td mat-cell *matCellDef="let r">{{ productName(r.productId) }}</td></ng-container>
                        <ng-container matColumnDef="outlet"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Outlet</span></th>
                            <td mat-cell *matCellDef="let r">{{ outletName(r.outletId) }}</td></ng-container>
                        <ng-container matColumnDef="reason"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</span></th>
                            <td mat-cell *matCellDef="let r">{{ r.reason }}</td></ng-container>
                        <ng-container matColumnDef="old"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">From</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right">{{ r.oldQuantity | number:'1.0-3' }}</td></ng-container>
                        <ng-container matColumnDef="new"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">To</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right">{{ r.newQuantity | number:'1.0-3' }}</td></ng-container>
                        <ng-container matColumnDef="delta"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Δ</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right font-semibold" [class.text-emerald-700]="r.delta >= 0" [class.text-rose-700]="r.delta < 0">
                                {{ r.delta > 0 ? '+' : '' }}{{ r.delta | number:'1.0-3' }}
                            </td></ng-container>
                        <ng-container matColumnDef="notes"><th mat-header-cell *matHeaderCellDef class="pr-4 sm:pr-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</span></th>
                            <td mat-cell *matCellDef="let r" class="pr-4 sm:pr-6 text-xs text-gray-500">{{ r.notes || '—' }}</td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: cols"></tr>
                    </table>
                </div>
                <div *ngIf="rows().length === 0" class="flex flex-col items-center justify-center p-12">
                    <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-lg"><mat-icon class="icon-size-16 text-gray-400">tune</mat-icon></div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">No adjustments yet</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Adjustments correct stock for physical counts, damage, expiry, or data fixes.</p>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class StockAdjustmentListComponent implements OnInit {
    private readonly api = inject(StockAdjustmentsService);
    private readonly outletsApi = inject(OutletsService);
    private readonly productsApi = inject(ProductsService);
    private readonly currentOutlet = inject(CurrentOutletService);

    rows = signal<StockAdjustmentDto[]>([]);
    outlets = signal<OutletDto[]>([]);
    products = signal<ProductDto[]>([]);
    outletFilter = '';
    cols = ['when', 'product', 'outlet', 'reason', 'old', 'new', 'delta', 'notes'];

    outletName(id: string): string { return this.outlets().find(o => o.id === id)?.name ?? '—'; }
    productName(id: string): string { return this.products().find(p => p.id === id)?.name ?? '—'; }

    ngOnInit(): void {
        this.outletsApi.getAll().subscribe(o => {
            this.outlets.set(o);
            const remembered = this.currentOutlet.outletId();
            if (remembered && o.some(x => x.id === remembered)) this.outletFilter = remembered;
            this.load();
        });
        this.productsApi.getAll({ isActive: true }).subscribe(p => this.products.set(p));
    }

    load(): void {
        this.api.search({ outletId: this.outletFilter || undefined, take: 200 }).subscribe(r => this.rows.set(r ?? []));
    }
}
