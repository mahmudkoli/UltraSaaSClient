import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GoodsReceiptsService } from 'app/core/purchasing/purchasing.service';
import { GoodsReceiptDto } from 'app/core/purchasing/purchasing.types';

@Component({
    selector: 'app-goods-receipt-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatTableModule, MatTooltipModule],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        @if (gr(); as g) {
            <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div class="flex items-center space-x-4">
                    <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl shadow-lg"><mat-icon class="text-white">local_shipping</mat-icon></div>
                    <div>
                        <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ g.receiptNumber }}</h2>
                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Received {{ g.receivedOn | date:'medium' }} · PO <a class="text-blue-600 hover:underline font-mono" [routerLink]="['/purchase-orders', g.purchaseOrderId]">{{ g.poNumber }}</a></p>
                    </div>
                </div>
                <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                          [ngClass]="{
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': g.status === 'Completed',
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': g.status === 'Voided',
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': g.status === 'Draft'
                          }">
                        <mat-icon class="icon-size-4 mr-1">{{ g.status === 'Completed' ? 'check_circle' : g.status === 'Voided' ? 'cancel' : 'schedule' }}</mat-icon>{{ g.status }}
                    </span>
                    <button mat-stroked-button color="warn" class="h-12 px-6 rounded-lg" *ngIf="g.status === 'Completed'"
                            [routerLink]="['/purchase-returns/from', g.id, 'new']" matTooltip="Send damaged / wrong / excess goods back to the supplier">
                        <mat-icon class="icon-size-5 mr-2">assignment_return</mat-icon><span>Send back to supplier</span>
                    </button>
                    <button mat-stroked-button class="h-12 px-6 rounded-lg" routerLink="/goods-receipts"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>Back</span></button>
                </div>
            </div>

            <div class="flex-auto p-4 sm:p-6">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                        <div class="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center"><mat-icon class="text-violet-600 dark:text-violet-400 text-lg">inventory_2</mat-icon></div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Items Received</h3>
                    </div>
                    <table mat-table [dataSource]="g.items" class="w-full">
                        <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef class="pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</span></th>
                            <td mat-cell *matCellDef="let i" class="pl-6 font-mono text-xs">{{ i.sku }}</td></ng-container>
                        <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Product</span></th>
                            <td mat-cell *matCellDef="let i">
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ i.productName }}</span>
                                    <span class="text-xs text-gray-500" *ngIf="i.batchNumber">Batch: {{ i.batchNumber }}<span *ngIf="i.expiryDate"> · expires {{ i.expiryDate | date:'shortDate' }}</span></span>
                                    <span class="text-xs text-gray-500" *ngIf="i.serialNumbers?.length">Serials: {{ i.serialNumbers.join(', ') }}</span>
                                </div>
                            </td></ng-container>
                        <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</span></th>
                            <td mat-cell *matCellDef="let i" class="!text-right">{{ i.quantityReceived | number:'1.0-3' }}</td></ng-container>
                        <ng-container matColumnDef="cost"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</span></th>
                            <td mat-cell *matCellDef="let i" class="!text-right">{{ i.unitCost | number:'1.2-2' }}</td></ng-container>
                        <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef class="pr-6 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Line Total</span></th>
                            <td mat-cell *matCellDef="let i" class="pr-6 !text-right font-semibold">{{ i.lineTotal | number:'1.2-2' }}</td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="['sku','name','qty','cost','total']" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: ['sku','name','qty','cost','total']"></tr>
                    </table>
                </div>
                <div class="mt-4 text-sm text-gray-600 dark:text-gray-400" *ngIf="g.notes"><strong>Notes:</strong> {{ g.notes }}</div>
            </div>
        }
    </div>
</div>
    `,
})
export class GoodsReceiptDetailComponent implements OnInit {
    private readonly api = inject(GoodsReceiptsService);
    private readonly route = inject(ActivatedRoute);
    gr = signal<GoodsReceiptDto | null>(null);

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id')!;
        this.api.get(id).subscribe(g => this.gr.set(g));
    }
}
