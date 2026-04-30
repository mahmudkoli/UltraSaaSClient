import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ProductsService } from 'app/core/catalog/catalog.service';
import { ProductDto } from 'app/core/catalog/catalog.types';
import { StockSerialsService } from 'app/core/inventory/inventory.service';
import { StockSerialDto } from 'app/core/inventory/inventory.types';
import { CurrentOutletService } from 'app/core/outlets/current-outlet.service';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletDto } from 'app/core/outlets/outlets.types';

type SerialStatus = StockSerialDto['status'];

@Component({
    selector: 'app-stock-serial-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatSelectModule, MatTableModule, MatTooltipModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg"><mat-icon class="text-white">qr_code_2</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Stock Serials</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">IMEI / serial number tracking for serial-required products</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <mat-form-field class="w-full sm:w-auto sm:min-w-72" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Search</mat-label>
                    <input matInput [(ngModel)]="search" placeholder="Serial / IMEI">
                    <mat-icon matSuffix class="text-gray-400">search</mat-icon>
                </mat-form-field>
                <mat-form-field class="w-full sm:w-auto sm:min-w-44" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Outlet</mat-label>
                    <mat-select [(ngModel)]="outletFilter" (ngModelChange)="onFilterChange()">
                        <mat-option [value]="''">All outlets</mat-option>
                        @for (o of outlets(); track o.id) { <mat-option [value]="o.id">{{ o.name }}</mat-option> }
                    </mat-select>
                </mat-form-field>
                <mat-form-field class="w-full sm:w-auto sm:min-w-44" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Status</mat-label>
                    <mat-select [(ngModel)]="statusFilter" (ngModelChange)="onFilterChange()">
                        <mat-option value="">All</mat-option>
                        <mat-option value="InStock">In stock</mat-option>
                        <mat-option value="Reserved">Reserved</mat-option>
                        <mat-option value="Sold">Sold</mat-option>
                        <mat-option value="Returned">Returned</mat-option>
                        <mat-option value="UnderRepair">Under repair</mat-option>
                        <mat-option value="WrittenOff">Written off</mat-option>
                        <mat-option value="Transferred">Transferred</mat-option>
                    </mat-select>
                </mat-form-field>
            </div>
        </div>
        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="relative overflow-x-auto">
                    <table mat-table [dataSource]="filtered()" class="w-full">
                        <ng-container matColumnDef="serial"><th mat-header-cell *matHeaderCellDef class="pl-4 sm:pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Serial</span></th>
                            <td mat-cell *matCellDef="let r" class="pl-4 sm:pl-6 font-mono text-sm">{{ r.serialNumber }}</td></ng-container>
                        <ng-container matColumnDef="imei"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">IMEI</span></th>
                            <td mat-cell *matCellDef="let r" class="font-mono text-xs text-gray-600 dark:text-gray-400">{{ r.imei || '—' }}</td></ng-container>
                        <ng-container matColumnDef="product"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Product</span></th>
                            <td mat-cell *matCellDef="let r">{{ productName(r.productId) }}</td></ng-container>
                        <ng-container matColumnDef="outlet"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Outlet</span></th>
                            <td mat-cell *matCellDef="let r">{{ outletName(r.outletId) }}</td></ng-container>
                        <ng-container matColumnDef="cost"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right">{{ r.purchaseCost | number:'1.2-2' }}</td></ng-container>
                        <ng-container matColumnDef="received"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Received</span></th>
                            <td mat-cell *matCellDef="let r" class="text-gray-600 dark:text-gray-400">{{ r.receivedOn | date:'shortDate' }}</td></ng-container>
                        <ng-container matColumnDef="sold"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</span></th>
                            <td mat-cell *matCellDef="let r" class="text-gray-600 dark:text-gray-400">{{ r.soldOn ? (r.soldOn | date:'shortDate') : '—' }}</td></ng-container>
                        <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef class="pr-4 sm:pr-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span></th>
                            <td mat-cell *matCellDef="let r" class="pr-4 sm:pr-6">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" [ngClass]="badgeClass(r.status)">
                                    <mat-icon class="icon-size-4 mr-1">{{ statusIcon(r.status) }}</mat-icon>{{ r.status }}
                                </span>
                            </td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: cols" class="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"></tr>
                    </table>
                </div>
                <div *ngIf="!loading() && filtered().length === 0" class="flex flex-col items-center justify-center p-12">
                    <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-6 shadow-lg"><mat-icon class="icon-size-16 text-gray-400">qr_code_2</mat-icon></div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">No serials</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Serials are auto-created when goods receipts include serial-tracked products.</p>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class StockSerialListComponent implements OnInit {
    private readonly api = inject(StockSerialsService);
    private readonly productsApi = inject(ProductsService);
    private readonly outletsApi = inject(OutletsService);
    private readonly currentOutlet = inject(CurrentOutletService);

    rows = signal<StockSerialDto[]>([]);
    products = signal<ProductDto[]>([]);
    outlets = signal<OutletDto[]>([]);
    loading = signal(true);
    search = '';
    outletFilter = '';
    statusFilter: SerialStatus | '' = '';
    cols = ['serial', 'imei', 'product', 'outlet', 'cost', 'received', 'sold', 'status'];

    filtered = computed(() => {
        const q = this.search.trim().toLowerCase();
        return this.rows().filter(r =>
            (!q
                || r.serialNumber.toLowerCase().includes(q)
                || (r.imei ?? '').toLowerCase().includes(q))
        );
    });

    productName(id: string): string { return this.products().find(p => p.id === id)?.name ?? ''; }
    outletName(id: string): string { return this.outlets().find(o => o.id === id)?.name ?? ''; }

    statusIcon(s: SerialStatus): string {
        switch (s) {
            case 'InStock': return 'check_circle';
            case 'Reserved': return 'lock';
            case 'Sold': return 'shopping_cart';
            case 'Returned': return 'undo';
            case 'UnderRepair': return 'build';
            case 'WrittenOff': return 'block';
            case 'Transferred': return 'swap_horiz';
            default: return 'help';
        }
    }

    badgeClass(s: SerialStatus): Record<string, boolean> {
        return {
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': s === 'InStock',
            'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200': s === 'Reserved' || s === 'UnderRepair',
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': s === 'Sold' || s === 'Transferred',
            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': s === 'Returned',
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': s === 'WrittenOff',
        };
    }

    ngOnInit(): void {
        this.outletsApi.getAll().subscribe(o => {
            this.outlets.set(o);
            const remembered = this.currentOutlet.outletId();
            if (remembered && o.some(x => x.id === remembered)) this.outletFilter = remembered;
            this.productsApi.getAll().subscribe(p => this.products.set(p));
            this.load();
        });
    }

    onFilterChange(): void { this.load(); }

    load(): void {
        this.loading.set(true);
        this.api.getAll({
            outletId: this.outletFilter || undefined,
            status: this.statusFilter || undefined,
        }).subscribe({
            next: d => { this.rows.set(d); this.loading.set(false); },
            error: () => this.loading.set(false),
        });
    }
}
