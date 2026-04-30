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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SaleReturnsService, SalesService } from 'app/core/sales/sales.service';
import {
    CreateSaleReturnLine, CreateSaleReturnRefund, PaymentMethod,
    ReturnedItemCondition, SaleDto, SaleItemDto, SaleReturnReason,
} from 'app/core/sales/sales.types';

interface RefundLine {
    method: PaymentMethod;
    amount: number;
    reference?: string;
}

interface ReturnLineDraft {
    saleItemId: string;
    productName: string;
    sku: string;
    serialNumber?: string;
    batchNumber?: string;
    originalQuantity: number;
    unitPrice: number;
    quantity: number;
    condition: ReturnedItemCondition;
}

@Component({
    selector: 'app-return-form',
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
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-rose-500 to-orange-600 rounded-xl shadow-lg"><mat-icon class="text-white">undo</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Process Return</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400" *ngIf="sale(); else loadingHdr">Refund items from invoice <span class="font-mono">{{ sale()?.invoiceNumber }}</span></p>
                    <ng-template #loadingHdr><p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Loading sale…</p></ng-template>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <button mat-stroked-button class="h-12 px-6 rounded-lg" [routerLink]="['/sales', saleId]"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>Back to Sale</span></button>
            </div>
        </div>

        @if (sale(); as s) {
            <div class="flex-auto p-4 sm:p-6">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <!-- Items -->
                    <div class="lg:col-span-2 flex flex-col gap-6">
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                                <div class="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center"><mat-icon class="text-violet-600 dark:text-violet-400 text-lg">inventory_2</mat-icon></div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Items</h3>
                                <span class="ml-auto text-xs text-gray-500">Set qty &gt; 0 on items being returned</span>
                            </div>
                            <table mat-table [dataSource]="lines()" class="w-full">
                                <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef class="pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Product</span></th>
                                    <td mat-cell *matCellDef="let l" class="pl-6">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ l.productName }}</span>
                                            <span class="text-xs text-gray-500 font-mono">{{ l.sku }}</span>
                                            <span class="text-xs text-gray-500" *ngIf="l.serialNumber">SN: {{ l.serialNumber }}</span>
                                            <span class="text-xs text-gray-500" *ngIf="l.batchNumber">Batch: {{ l.batchNumber }}</span>
                                        </div>
                                    </td></ng-container>
                                <ng-container matColumnDef="orig"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</span></th>
                                    <td mat-cell *matCellDef="let l" class="!text-right">{{ l.originalQuantity | number:'1.0-3' }}</td></ng-container>
                                <ng-container matColumnDef="unit"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</span></th>
                                    <td mat-cell *matCellDef="let l" class="!text-right">{{ l.unitPrice | number:'1.2-2' }}</td></ng-container>
                                <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Return Qty</span></th>
                                    <td mat-cell *matCellDef="let l" class="!text-right">
                                        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-24">
                                            <input matInput type="number" min="0" [max]="l.originalQuantity" [(ngModel)]="l.quantity" (ngModelChange)="onLineChange()">
                                        </mat-form-field>
                                    </td></ng-container>
                                <ng-container matColumnDef="condition"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</span></th>
                                    <td mat-cell *matCellDef="let l">
                                        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-36">
                                            <mat-select [(ngModel)]="l.condition" [disabled]="!l.quantity">
                                                <mat-option value="Resellable">Resellable</mat-option>
                                                <mat-option value="Damaged">Damaged</mat-option>
                                            </mat-select>
                                        </mat-form-field>
                                    </td></ng-container>
                                <ng-container matColumnDef="lineTotal"><th mat-header-cell *matHeaderCellDef class="pr-6 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Refund</span></th>
                                    <td mat-cell *matCellDef="let l" class="pr-6 !text-right font-semibold">{{ (l.quantity * l.unitPrice) | number:'1.2-2' }}</td></ng-container>
                                <tr mat-header-row *matHeaderRowDef="['name','orig','unit','qty','condition','lineTotal']" class="bg-gray-50 dark:bg-gray-700"></tr>
                                <tr mat-row *matRowDef="let row; columns: ['name','orig','unit','qty','condition','lineTotal']"></tr>
                            </table>
                        </div>

                        <!-- Refunds -->
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center"><mat-icon class="text-blue-600 dark:text-blue-400 text-lg">payments</mat-icon></div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Refund</h3>
                                <button class="ml-auto" mat-stroked-button (click)="addRefund()"><mat-icon class="icon-size-5 mr-1">add</mat-icon>Add method</button>
                            </div>
                            <div class="p-6 space-y-3">
                                <div *ngFor="let r of refunds(); let i = index" class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                                    <mat-form-field class="sm:col-span-3 w-full" appearance="outline" subscriptSizing="dynamic">
                                        <mat-label>Method</mat-label>
                                        <mat-select [(ngModel)]="r.method">
                                            <mat-option value="Cash">Cash</mat-option>
                                            <mat-option value="Card">Card</mat-option>
                                            <mat-option value="MobileBanking">Mobile Banking</mat-option>
                                            <mat-option value="BankTransfer">Bank Transfer</mat-option>
                                            <mat-option value="Voucher">Voucher</mat-option>
                                            <mat-option value="Credit">Store Credit</mat-option>
                                        </mat-select>
                                    </mat-form-field>
                                    <mat-form-field class="sm:col-span-3 w-full" appearance="outline" subscriptSizing="dynamic">
                                        <mat-label>Amount</mat-label>
                                        <input matInput type="number" min="0" step="0.01" [(ngModel)]="r.amount">
                                    </mat-form-field>
                                    <mat-form-field class="sm:col-span-5 w-full" appearance="outline" subscriptSizing="dynamic">
                                        <mat-label>Reference (optional)</mat-label>
                                        <input matInput [(ngModel)]="r.reference">
                                    </mat-form-field>
                                    <button mat-icon-button class="sm:col-span-1 text-red-600" (click)="removeRefund(i)" matTooltip="Remove">
                                        <mat-icon class="icon-size-5">delete</mat-icon>
                                    </button>
                                </div>
                                <p *ngIf="refunds().length === 0" class="text-sm text-gray-500">No refund methods. Add at least one before submitting.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Reason + summary -->
                    <div class="flex flex-col gap-6">
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
                            <div class="flex items-center space-x-3 mb-4">
                                <div class="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center"><mat-icon class="text-amber-600 dark:text-amber-400 text-lg">help_center</mat-icon></div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Reason</h3>
                            </div>
                            <mat-form-field class="w-full" appearance="outline">
                                <mat-label>Return reason</mat-label>
                                <mat-select [(ngModel)]="reason">
                                    <mat-option value="DefectiveProduct">Defective product</mat-option>
                                    <mat-option value="WrongItem">Wrong item</mat-option>
                                    <mat-option value="BuyersRemorse">Buyer's remorse</mat-option>
                                    <mat-option value="ExpiredOrDamaged">Expired or damaged</mat-option>
                                    <mat-option value="Other">Other</mat-option>
                                </mat-select>
                            </mat-form-field>
                            <mat-form-field class="w-full" appearance="outline">
                                <mat-label>Notes</mat-label>
                                <textarea matInput rows="3" [(ngModel)]="notes"></textarea>
                            </mat-form-field>
                        </div>

                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
                            <div class="flex items-center space-x-3 mb-4">
                                <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center"><mat-icon class="text-emerald-600 dark:text-emerald-400 text-lg">summarize</mat-icon></div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Summary</h3>
                            </div>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Original total</span><span class="font-medium">{{ s.total | number:'1.2-2' }}</span></div>
                                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Items selected</span><span class="font-medium">{{ selectedItemCount() }}</span></div>
                                <div class="flex justify-between text-xl font-bold pt-2 border-t border-gray-200 dark:border-gray-700"><span>Refund due</span><span class="text-rose-600">{{ refundDue() | number:'1.2-2' }}</span></div>
                                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Refund entered</span><span class="font-medium">{{ refundEntered() | number:'1.2-2' }}</span></div>
                                <div class="flex justify-between" [ngClass]="{ 'text-red-600': refundEntered() !== refundDue() }">
                                    <span>Difference</span>
                                    <span class="font-medium">{{ (refundEntered() - refundDue()) | number:'1.2-2' }}</span>
                                </div>
                            </div>
                            <button mat-flat-button color="warn" class="w-full h-12 rounded-lg shadow-lg mt-4"
                                    [disabled]="!canSubmit() || submitting"
                                    (click)="submit()">
                                <mat-icon class="icon-size-5 mr-2">undo</mat-icon><span>{{ submitting ? 'Processing…' : 'Process Return' }}</span>
                            </button>
                            <p class="text-xs text-gray-500 mt-2" *ngIf="!canSubmit()">{{ disabledReason() }}</p>
                        </div>
                    </div>
                </div>
            </div>
        }
    </div>
</div>
    `,
})
export class ReturnFormComponent implements OnInit {
    private readonly salesApi = inject(SalesService);
    private readonly returnsApi = inject(SaleReturnsService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    saleId!: string;
    sale = signal<SaleDto | null>(null);
    lines = signal<ReturnLineDraft[]>([]);
    refunds = signal<RefundLine[]>([]);
    reason: SaleReturnReason = 'DefectiveProduct';
    notes = '';
    submitting = false;

    refundDue = computed(() =>
        this.lines().reduce((sum, l) => sum + l.quantity * l.unitPrice, 0)
    );
    refundEntered = computed(() =>
        this.refunds().reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
    );
    selectedItemCount = computed(() => this.lines().filter(l => l.quantity > 0).length);

    canSubmit = computed(() =>
        this.selectedItemCount() > 0
        && this.refunds().length > 0
        && Math.abs(this.refundEntered() - this.refundDue()) < 0.005
    );

    disabledReason(): string {
        if (this.selectedItemCount() === 0) return 'Set return quantity on at least one item.';
        if (this.refunds().length === 0) return 'Add at least one refund method.';
        if (Math.abs(this.refundEntered() - this.refundDue()) >= 0.005)
            return 'Refund total must equal the refund due.';
        return '';
    }

    ngOnInit(): void {
        this.saleId = this.route.snapshot.paramMap.get('saleId')!;
        this.salesApi.get(this.saleId).subscribe(s => {
            this.sale.set(s);
            this.lines.set(s.items.map<ReturnLineDraft>(i => ({
                saleItemId: i.id,
                productName: i.productName,
                sku: i.sku,
                serialNumber: i.serialNumber,
                batchNumber: i.batchNumber,
                originalQuantity: i.quantity,
                unitPrice: i.unitPrice,
                quantity: 0,
                condition: 'Resellable',
            })));
        });
    }

    onLineChange(): void {
        // Force computed re-evaluation by rewriting the signal value.
        this.lines.set([...this.lines()]);
        // Auto-fill the first refund line's amount when only one method is configured.
        const refunds = this.refunds();
        if (refunds.length === 1) {
            refunds[0].amount = +this.refundDue().toFixed(2);
            this.refunds.set([...refunds]);
        }
    }

    addRefund(): void {
        const remaining = +(this.refundDue() - this.refundEntered()).toFixed(2);
        this.refunds.set([
            ...this.refunds(),
            { method: 'Cash', amount: Math.max(0, remaining), reference: '' },
        ]);
    }

    removeRefund(i: number): void {
        const arr = [...this.refunds()];
        arr.splice(i, 1);
        this.refunds.set(arr);
    }

    submit(): void {
        if (!this.canSubmit()) return;
        this.submitting = true;
        const linesPayload: CreateSaleReturnLine[] = this.lines()
            .filter(l => l.quantity > 0)
            .map(l => ({ saleItemId: l.saleItemId, quantity: l.quantity, condition: l.condition }));
        const refundsPayload: CreateSaleReturnRefund[] = this.refunds()
            .map(r => ({ amount: Number(r.amount), method: r.method, reference: r.reference || undefined }));
        this.returnsApi.create({
            saleId: this.saleId,
            reason: this.reason,
            lines: linesPayload,
            refunds: refundsPayload,
            notes: this.notes || undefined,
        }).subscribe({
            next: id => { this.submitting = false; this.router.navigate(['/returns', id]); },
            error: () => { this.submitting = false; },
        });
    }
}
