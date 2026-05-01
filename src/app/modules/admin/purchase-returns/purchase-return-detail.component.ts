import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PurchaseReturnsService } from 'app/core/purchasing/purchasing.service';
import { PurchaseReturnDto } from 'app/core/purchasing/purchasing.types';

@Component({
    selector: 'app-purchase-return-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatTableModule],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        @if (pr(); as p) {
            <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div class="flex items-center space-x-4">
                    <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg"><mat-icon class="text-white">assignment_return</mat-icon></div>
                    <div>
                        <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ p.returnNumber }}</h2>
                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {{ p.returnDate | date:'medium' }} · Receipt
                            <a class="text-blue-600 hover:underline font-mono" [routerLink]="['/goods-receipts', p.goodsReceiptId]">{{ p.originalReceiptNumber }}</a>
                            · PO <span class="font-mono">{{ p.originalPONumber }}</span>
                            · Reason {{ p.reason }}
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                          [ngClass]="{
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': p.status === 'Completed',
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': p.status === 'Voided',
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': p.status === 'Draft'
                          }">
                        <mat-icon class="icon-size-4 mr-1">{{ p.status === 'Completed' ? 'check_circle' : p.status === 'Voided' ? 'cancel' : 'schedule' }}</mat-icon>{{ p.status }}
                    </span>
                    <button mat-stroked-button class="h-12 px-6 rounded-lg" routerLink="/purchase-returns"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>Back</span></button>
                </div>
            </div>

            <div class="flex-auto p-4 sm:p-6 space-y-6">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                        <div class="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center"><mat-icon class="text-violet-600 dark:text-violet-400 text-lg">inventory_2</mat-icon></div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Lines returned</h3>
                    </div>
                    <table mat-table [dataSource]="p.items" class="w-full">
                        <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef class="pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</span></th>
                            <td mat-cell *matCellDef="let i" class="pl-6 font-mono text-xs">{{ i.sku }}</td></ng-container>
                        <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Product</span></th>
                            <td mat-cell *matCellDef="let i">
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ i.productName }}</span>
                                    <span class="text-xs text-gray-500" *ngIf="i.serialNumber">Serial: {{ i.serialNumber }}</span>
                                    <span class="text-xs text-gray-500" *ngIf="i.batchNumber">Batch: {{ i.batchNumber }}</span>
                                </div>
                            </td></ng-container>
                        <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</span></th>
                            <td mat-cell *matCellDef="let i" class="!text-right">{{ i.quantity | number:'1.0-3' }}</td></ng-container>
                        <ng-container matColumnDef="cost"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</span></th>
                            <td mat-cell *matCellDef="let i" class="!text-right">{{ i.unitCost | number:'1.2-2' }}</td></ng-container>
                        <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef class="pr-6 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Line Total</span></th>
                            <td mat-cell *matCellDef="let i" class="pr-6 !text-right font-semibold">{{ i.lineTotal | number:'1.2-2' }}</td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="['sku','name','qty','cost','total']" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: ['sku','name','qty','cost','total']"></tr>
                    </table>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center"><mat-icon class="text-emerald-600 dark:text-emerald-400 text-lg">request_quote</mat-icon></div>
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Supplier credit</h3>
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">
                            Credit total <span class="font-semibold text-gray-900 dark:text-white">{{ p.creditAmount | number:'1.2-2' }}</span>
                            of <span class="font-semibold">{{ p.total | number:'1.2-2' }}</span> · Balance
                            <span class="font-semibold" [class.text-rose-700]="p.balance > 0">{{ p.balance | number:'1.2-2' }}</span>
                        </div>
                    </div>
                    <table mat-table [dataSource]="p.credits" class="w-full">
                        <ng-container matColumnDef="when"><th mat-header-cell *matHeaderCellDef class="pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded</span></th>
                            <td mat-cell *matCellDef="let c" class="pl-6">{{ c.recordedOn | date:'short' }}</td></ng-container>
                        <ng-container matColumnDef="method"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Method</span></th>
                            <td mat-cell *matCellDef="let c">{{ c.method }}</td></ng-container>
                        <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</span></th>
                            <td mat-cell *matCellDef="let c" class="!text-right font-semibold">{{ c.amount | number:'1.2-2' }}</td></ng-container>
                        <ng-container matColumnDef="ref"><th mat-header-cell *matHeaderCellDef class="pr-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</span></th>
                            <td mat-cell *matCellDef="let c" class="pr-6 text-xs text-gray-500">{{ c.reference || '—' }}</td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="['when','method','amount','ref']" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: ['when','method','amount','ref']"></tr>
                    </table>
                </div>

                <div class="text-sm text-gray-600 dark:text-gray-400" *ngIf="p.notes"><strong>Notes:</strong> {{ p.notes }}</div>
            </div>
        }
    </div>
</div>
    `,
})
export class PurchaseReturnDetailComponent implements OnInit {
    private readonly api = inject(PurchaseReturnsService);
    private readonly route = inject(ActivatedRoute);
    pr = signal<PurchaseReturnDto | null>(null);

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id')!;
        this.api.get(id).subscribe(p => this.pr.set(p));
    }
}
