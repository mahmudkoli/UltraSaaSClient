import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PurchaseOrdersService, SuppliersService } from 'app/core/purchasing/purchasing.service';
import { PurchaseOrderDto, PurchaseOrderStatus, SupplierDto } from 'app/core/purchasing/purchasing.types';

@Component({
    selector: 'app-purchase-order-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatTableModule, MatTooltipModule],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        @if (po(); as p) {
            <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div class="flex items-center space-x-4">
                    <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl shadow-lg"><mat-icon class="text-white">request_quote</mat-icon></div>
                    <div>
                        <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ p.poNumber }}</h2>
                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Ordered {{ p.orderDate | date:'medium' }} · Supplier: {{ supplierName() }}</p>
                    </div>
                </div>
                <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" [ngClass]="statusClass(p.status)">
                        <mat-icon class="icon-size-4 mr-1">{{ statusIcon(p.status) }}</mat-icon>{{ p.status }}
                    </span>
                    <button mat-stroked-button class="h-12 px-6 rounded-lg" routerLink="/purchase-orders"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>Back</span></button>
                </div>
            </div>

            <div class="flex-auto p-4 sm:p-6">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 flex flex-col gap-6">
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                                <div class="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center"><mat-icon class="text-violet-600 dark:text-violet-400 text-lg">inventory_2</mat-icon></div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Line Items</h3>
                            </div>
                            <table mat-table [dataSource]="p.items" class="w-full">
                                <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef class="pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</span></th>
                                    <td mat-cell *matCellDef="let i" class="pl-6 font-mono text-xs">{{ i.sku }}</td></ng-container>
                                <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Product</span></th>
                                    <td mat-cell *matCellDef="let i">{{ i.productName }}</td></ng-container>
                                <ng-container matColumnDef="ordered"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Ordered</span></th>
                                    <td mat-cell *matCellDef="let i" class="!text-right">{{ i.quantityOrdered | number:'1.0-3' }}</td></ng-container>
                                <ng-container matColumnDef="received"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Received</span></th>
                                    <td mat-cell *matCellDef="let i" class="!text-right">{{ i.quantityReceived | number:'1.0-3' }}</td></ng-container>
                                <ng-container matColumnDef="outstanding"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</span></th>
                                    <td mat-cell *matCellDef="let i" class="!text-right" [class.text-amber-600]="i.quantityOutstanding > 0">{{ i.quantityOutstanding | number:'1.0-3' }}</td></ng-container>
                                <ng-container matColumnDef="cost"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</span></th>
                                    <td mat-cell *matCellDef="let i" class="!text-right">{{ i.unitCost | number:'1.2-2' }}</td></ng-container>
                                <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef class="pr-6 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Line Total</span></th>
                                    <td mat-cell *matCellDef="let i" class="pr-6 !text-right font-semibold">{{ i.lineTotal | number:'1.2-2' }}</td></ng-container>
                                <tr mat-header-row *matHeaderRowDef="['sku','name','ordered','received','outstanding','cost','total']" class="bg-gray-50 dark:bg-gray-700"></tr>
                                <tr mat-row *matRowDef="let row; columns: ['sku','name','ordered','received','outstanding','cost','total']"></tr>
                            </table>
                        </div>
                    </div>

                    <div class="flex flex-col gap-6">
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
                            <div class="flex items-center space-x-3 mb-4">
                                <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center"><mat-icon class="text-emerald-600 dark:text-emerald-400 text-lg">summarize</mat-icon></div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Summary</h3>
                            </div>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Subtotal</span><span class="font-medium">{{ p.subTotal | number:'1.2-2' }}</span></div>
                                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Tax</span><span class="font-medium">{{ p.taxAmount | number:'1.2-2' }}</span></div>
                                <div class="flex justify-between text-xl font-bold pt-2 border-t border-gray-200 dark:border-gray-700"><span>Total</span><span>{{ p.total | number:'1.2-2' }}</span></div>
                                <div class="flex justify-between pt-2"><span class="text-gray-600 dark:text-gray-400">Expected by</span><span class="font-medium">{{ p.expectedDeliveryDate ? (p.expectedDeliveryDate | date:'shortDate') : '—' }}</span></div>
                            </div>
                            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700" *ngIf="p.notes">
                                <p class="text-xs text-gray-500 mb-1">Notes</p>
                                <p class="text-sm text-gray-700 dark:text-gray-300">{{ p.notes }}</p>
                            </div>
                        </div>

                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6 flex flex-col gap-3">
                            <div class="flex items-center space-x-3 mb-2">
                                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center"><mat-icon class="text-blue-600 dark:text-blue-400 text-lg">flag</mat-icon></div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Actions</h3>
                            </div>
                            @if (p.status === 'Draft') {
                                <button mat-flat-button color="primary" class="w-full h-12 rounded-lg" [disabled]="busy()" (click)="submit()">
                                    <mat-icon class="icon-size-5 mr-2">send</mat-icon><span>Submit to Supplier</span>
                                </button>
                                <button mat-stroked-button color="warn" class="w-full h-12 rounded-lg" [disabled]="busy()" (click)="cancel()">
                                    <mat-icon class="icon-size-5 mr-2">cancel</mat-icon><span>Cancel</span>
                                </button>
                            }
                            @if (p.status === 'Submitted' || p.status === 'PartiallyReceived') {
                                <button mat-flat-button color="primary" class="w-full h-12 rounded-lg" [routerLink]="['/goods-receipts/new', p.id]">
                                    <mat-icon class="icon-size-5 mr-2">local_shipping</mat-icon><span>Receive Goods</span>
                                </button>
                                <button mat-stroked-button color="warn" class="w-full h-12 rounded-lg" [disabled]="busy()" (click)="cancel()">
                                    <mat-icon class="icon-size-5 mr-2">cancel</mat-icon><span>Cancel PO</span>
                                </button>
                            }
                            @if (p.status === 'Received' || p.status === 'Cancelled') {
                                <p class="text-sm text-gray-500">No further actions available.</p>
                            }
                        </div>
                    </div>
                </div>
            </div>
        }
    </div>
</div>
    `,
})
export class PurchaseOrderDetailComponent implements OnInit {
    private readonly api = inject(PurchaseOrdersService);
    private readonly suppliersApi = inject(SuppliersService);
    private readonly route = inject(ActivatedRoute);

    po = signal<PurchaseOrderDto | null>(null);
    suppliers = signal<SupplierDto[]>([]);
    busy = signal(false);

    supplierName = computed(() => {
        const p = this.po();
        if (!p) return '';
        return this.suppliers().find(s => s.id === p.supplierId)?.name ?? '';
    });

    statusClass(s: PurchaseOrderStatus): Record<string, boolean> {
        return {
            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200': s === 'Draft',
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': s === 'Submitted',
            'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200': s === 'PartiallyReceived',
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': s === 'Received',
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': s === 'Cancelled',
        };
    }
    statusIcon(s: PurchaseOrderStatus): string {
        return s === 'Received' ? 'check_circle'
             : s === 'Cancelled' ? 'cancel'
             : s === 'PartiallyReceived' ? 'pending'
             : s === 'Submitted' ? 'send'
             : 'edit';
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id')!;
        this.suppliersApi.getAll().subscribe(s => this.suppliers.set(s));
        this.reload(id);
    }

    private reload(id: string): void {
        this.api.get(id).subscribe(p => this.po.set(p));
    }

    submit(): void {
        const p = this.po();
        if (!p) return;
        this.busy.set(true);
        this.api.submit(p.id).subscribe({
            next: () => { this.busy.set(false); this.reload(p.id); },
            error: () => this.busy.set(false),
        });
    }

    cancel(): void {
        const p = this.po();
        if (!p) return;
        if (!confirm(`Cancel PO ${p.poNumber}? This cannot be undone.`)) return;
        this.busy.set(true);
        this.api.cancel(p.id).subscribe({
            next: () => { this.busy.set(false); this.reload(p.id); },
            error: () => this.busy.set(false),
        });
    }
}
