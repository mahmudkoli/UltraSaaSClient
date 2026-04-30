import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SaleReturnsService } from 'app/core/sales/sales.service';
import { SaleReturnDto } from 'app/core/sales/sales.types';

@Component({
    selector: 'app-return-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatTableModule],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        @if (ret(); as r) {
            <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div class="flex items-center space-x-4">
                    <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-rose-500 to-orange-600 rounded-xl shadow-lg"><mat-icon class="text-white">undo</mat-icon></div>
                    <div>
                        <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ r.returnNumber }}</h2>
                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ r.returnDate | date:'medium' }} · invoice <a class="text-blue-600 hover:underline font-mono" [routerLink]="['/sales', r.saleId]">{{ r.originalInvoiceNumber }}</a> · {{ r.customerName || 'Walk-in' }}</p>
                    </div>
                </div>
                <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                          [ngClass]="{
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': r.status === 'Completed',
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': r.status === 'Voided',
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': r.status === 'Draft'
                          }">
                        <mat-icon class="icon-size-4 mr-1">{{ r.status === 'Completed' ? 'check_circle' : r.status === 'Voided' ? 'cancel' : 'schedule' }}</mat-icon>{{ r.status }}
                    </span>
                    <button mat-stroked-button class="h-12 px-6 rounded-lg" routerLink="/returns"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>Back</span></button>
                </div>
            </div>

            <div class="flex-auto p-4 sm:p-6">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 flex flex-col gap-6">
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                                <div class="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center"><mat-icon class="text-violet-600 dark:text-violet-400 text-lg">inventory_2</mat-icon></div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Returned Items</h3>
                            </div>
                            <table mat-table [dataSource]="r.items" class="w-full">
                                <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef class="pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</span></th>
                                    <td mat-cell *matCellDef="let i" class="pl-6 font-mono text-xs">{{ i.sku }}</td></ng-container>
                                <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Product</span></th>
                                    <td mat-cell *matCellDef="let i">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ i.productName }}</span>
                                            <span class="text-xs text-gray-500" *ngIf="i.serialNumber">SN: {{ i.serialNumber }}</span>
                                        </div>
                                    </td></ng-container>
                                <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</span></th>
                                    <td mat-cell *matCellDef="let i" class="!text-right">{{ i.quantity | number:'1.0-3' }}</td></ng-container>
                                <ng-container matColumnDef="condition"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</span></th>
                                    <td mat-cell *matCellDef="let i">
                                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                              [ngClass]="i.condition === 'Resellable'
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'">
                                            {{ i.condition }}
                                        </span>
                                    </td></ng-container>
                                <ng-container matColumnDef="unit"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</span></th>
                                    <td mat-cell *matCellDef="let i" class="!text-right">{{ i.unitPrice | number:'1.2-2' }}</td></ng-container>
                                <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef class="pr-6 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</span></th>
                                    <td mat-cell *matCellDef="let i" class="pr-6 !text-right font-semibold">{{ i.lineTotal | number:'1.2-2' }}</td></ng-container>
                                <tr mat-header-row *matHeaderRowDef="['sku','name','qty','condition','unit','total']" class="bg-gray-50 dark:bg-gray-700"></tr>
                                <tr mat-row *matRowDef="let row; columns: ['sku','name','qty','condition','unit','total']"></tr>
                            </table>
                        </div>

                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center"><mat-icon class="text-blue-600 dark:text-blue-400 text-lg">payments</mat-icon></div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Refunds</h3>
                            </div>
                            <table mat-table [dataSource]="r.refunds" class="w-full">
                                <ng-container matColumnDef="method"><th mat-header-cell *matHeaderCellDef class="pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Method</span></th>
                                    <td mat-cell *matCellDef="let p" class="pl-6">{{ p.method }}</td></ng-container>
                                <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</span></th>
                                    <td mat-cell *matCellDef="let p" class="!text-right font-medium">{{ p.amount | number:'1.2-2' }}</td></ng-container>
                                <ng-container matColumnDef="ref"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</span></th>
                                    <td mat-cell *matCellDef="let p">{{ p.reference || '—' }}</td></ng-container>
                                <ng-container matColumnDef="paid"><th mat-header-cell *matHeaderCellDef class="pr-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Refunded On</span></th>
                                    <td mat-cell *matCellDef="let p" class="pr-6">{{ p.refundedOn | date:'short' }}</td></ng-container>
                                <tr mat-header-row *matHeaderRowDef="['method','amount','ref','paid']" class="bg-gray-50 dark:bg-gray-700"></tr>
                                <tr mat-row *matRowDef="let row; columns: ['method','amount','ref','paid']"></tr>
                            </table>
                        </div>
                    </div>

                    <div class="flex flex-col gap-6">
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
                            <div class="flex items-center space-x-3 mb-4">
                                <div class="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center"><mat-icon class="text-amber-600 dark:text-amber-400 text-lg">summarize</mat-icon></div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Summary</h3>
                            </div>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Reason</span><span class="font-medium">{{ r.reason }}</span></div>
                                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Subtotal</span><span class="font-medium">{{ r.subTotal | number:'1.2-2' }}</span></div>
                                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Discount</span><span class="font-medium">−{{ r.discountAmount | number:'1.2-2' }}</span></div>
                                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Tax</span><span class="font-medium">{{ r.taxAmount | number:'1.2-2' }}</span></div>
                                <div class="flex justify-between text-xl font-bold pt-2 border-t border-gray-200 dark:border-gray-700"><span>Refunded</span><span class="text-rose-600">{{ r.refundAmount | number:'1.2-2' }}</span></div>
                                <div class="flex justify-between text-sm pt-2"><span class="text-gray-600 dark:text-gray-400">Balance</span><span class="font-medium">{{ r.balance | number:'1.2-2' }}</span></div>
                            </div>
                            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700" *ngIf="r.notes">
                                <p class="text-xs text-gray-500 mb-1">Notes</p>
                                <p class="text-sm text-gray-700 dark:text-gray-300">{{ r.notes }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }
    </div>
</div>
    `,
})
export class ReturnDetailComponent implements OnInit {
    private readonly api = inject(SaleReturnsService);
    private readonly route = inject(ActivatedRoute);
    ret = signal<SaleReturnDto | null>(null);

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id')!;
        this.api.get(id).subscribe(r => this.ret.set(r));
    }
}
