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
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { SaleReturnsService, SalesService } from 'app/core/sales/sales.service';
import {
    CreateSaleReturnLine, CreateSaleReturnRefund, PaymentMethod,
    ReturnedItemCondition, SaleDto, SaleItemDto, SaleReturnDto, SaleReturnReason,
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
    /** Originally sold quantity on the source sale line — informational only. */
    originalQuantity: number;
    /** Sum of qty already returned against this sale item across all non-voided
     *  prior returns. Subtracted from `originalQuantity` to get `maxReturnable`. */
    alreadyReturned: number;
    /** Effective cap: `originalQuantity - alreadyReturned`. 0 means fully refunded already. */
    maxReturnable: number;
    unitPrice: number;
    quantity: number;
    condition: ReturnedItemCondition;
}

@Component({
    selector: 'app-return-form',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, TranslocoModule,
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
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ 'RETURNS.FORM.TITLE' | transloco }}</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400" *ngIf="sale(); else loadingHdr">{{ 'RETURNS.FORM.SUBTITLE_PREFIX' | transloco }} <span class="font-mono">{{ sale()?.invoiceNumber }}</span></p>
                    <ng-template #loadingHdr><p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ 'RETURNS.FORM.LOADING_SALE' | transloco }}</p></ng-template>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <button mat-stroked-button class="h-12 px-6 rounded-lg" [routerLink]="['/sales', saleId]"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>{{ 'RETURNS.FORM.BACK_TO_SALE' | transloco }}</span></button>
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
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ 'RETURNS.FORM.ITEMS' | transloco }}</h3>
                                <div class="ml-auto flex items-center gap-2">
                                    <button type="button" (click)="returnAll()" [disabled]="!anyReturnable()"
                                            class="text-xs px-3 py-1.5 rounded-lg border text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 disabled:opacity-40"
                                            [matTooltip]="'RETURNS.FORM.RETURN_ALL_TOOLTIP' | transloco">
                                        {{ 'RETURNS.FORM.RETURN_ALL' | transloco }}
                                    </button>
                                    <button type="button" (click)="clearAllQty()" [disabled]="selectedItemCount() === 0"
                                            class="text-xs px-3 py-1.5 rounded-lg border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
                                            [matTooltip]="'RETURNS.FORM.CLEAR_TOOLTIP' | transloco">
                                        {{ 'RETURNS.FORM.CLEAR' | transloco }}
                                    </button>
                                    <span class="text-xs text-gray-500 ml-1">{{ priorReturnsHint() }}</span>
                                </div>
                            </div>
                            <table mat-table [dataSource]="lines()" class="w-full">
                                <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef class="pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'RETURNS.FORM.COL_PRODUCT' | transloco }}</span></th>
                                    <td mat-cell *matCellDef="let l" class="pl-6">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ l.productName }}</span>
                                            <span class="text-xs text-gray-500 font-mono">{{ l.sku }}</span>
                                            <span class="text-xs text-gray-500" *ngIf="l.serialNumber">{{ 'RETURNS.FORM.SN_PREFIX' | transloco }}: {{ l.serialNumber }}</span>
                                            <span class="text-xs text-gray-500" *ngIf="l.batchNumber">{{ 'RETURNS.FORM.BATCH_PREFIX' | transloco }}: {{ l.batchNumber }}</span>
                                        </div>
                                    </td></ng-container>
                                <ng-container matColumnDef="orig"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'RETURNS.FORM.COL_SOLD' | transloco }}</span></th>
                                    <td mat-cell *matCellDef="let l" class="!text-right tabular-nums">{{ l.originalQuantity | number:'1.0-3' }}</td></ng-container>
                                <ng-container matColumnDef="returnable"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'RETURNS.FORM.COL_RETURNABLE' | transloco }}</span></th>
                                    <td mat-cell *matCellDef="let l" class="!text-right tabular-nums"
                                        [class.text-rose-700]="l.maxReturnable <= 0"
                                        [class.text-emerald-700]="l.alreadyReturned > 0 && l.maxReturnable > 0"
                                        [matTooltip]="l.alreadyReturned > 0 ? ('RETURNS.FORM.ALREADY_RETURNED_TOOLTIP' | transloco:{ count: l.alreadyReturned }) : ''">
                                        {{ l.maxReturnable | number:'1.0-3' }}
                                    </td></ng-container>
                                <ng-container matColumnDef="unit"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'RETURNS.FORM.COL_UNIT' | transloco }}</span></th>
                                    <td mat-cell *matCellDef="let l" class="!text-right">{{ l.unitPrice | number:'1.2-2' }}</td></ng-container>
                                <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'RETURNS.FORM.COL_RETURN_QTY' | transloco }}</span></th>
                                    <td mat-cell *matCellDef="let l" class="!text-right">
                                        <div class="flex items-center justify-end gap-1">
                                            <button type="button" (click)="nudgeQty(l, -1)" [disabled]="l.quantity <= 0 || l.maxReturnable <= 0"
                                                    class="w-6 h-6 flex items-center justify-center rounded border text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                                    [attr.aria-label]="'RETURNS.FORM.DECREASE_QTY' | transloco">
                                                <mat-icon class="icon-size-4">remove</mat-icon>
                                            </button>
                                            <input type="number" min="0" [max]="l.maxReturnable" step="0.01"
                                                   [(ngModel)]="l.quantity"
                                                   [disabled]="l.maxReturnable <= 0"
                                                   class="w-16 border rounded px-1 py-0.5 text-right tabular-nums"
                                                   [class.!border-rose-400]="l.quantity > l.maxReturnable"
                                                   [class.!text-rose-600]="l.quantity > l.maxReturnable"
                                                   [matTooltip]="l.maxReturnable <= 0 ? ('RETURNS.FORM.FULLY_REFUNDED_TOOLTIP' | transloco) : (l.quantity > l.maxReturnable ? ('RETURNS.FORM.MAX_RETURNABLE_TOOLTIP' | transloco:{ max: l.maxReturnable }) : '')" />
                                            <button type="button" (click)="nudgeQty(l, 1)" [disabled]="l.quantity >= l.maxReturnable || l.maxReturnable <= 0"
                                                    class="w-6 h-6 flex items-center justify-center rounded border text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                                    [attr.aria-label]="'RETURNS.FORM.INCREASE_QTY' | transloco">
                                                <mat-icon class="icon-size-4">add</mat-icon>
                                            </button>
                                        </div>
                                    </td></ng-container>
                                <ng-container matColumnDef="condition"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'RETURNS.FORM.COL_CONDITION' | transloco }}</span></th>
                                    <td mat-cell *matCellDef="let l">
                                        <!-- Side-by-side toggle. Resellable goes back on the shelf;
                                             Damaged writes off the unit. Color-coded so the
                                             impact is obvious without reading the label. Disabled
                                             when qty=0 (line not selected for return). -->
                                        <div class="inline-flex h-7 rounded border border-gray-300 dark:border-gray-600 overflow-hidden"
                                             [class.opacity-40]="!l.quantity">
                                            <button type="button" [disabled]="!l.quantity"
                                                    (click)="setCondition(l, 'Resellable')"
                                                    class="px-2.5 text-xs font-medium flex items-center gap-1 transition-colors"
                                                    [ngClass]="l.condition === 'Resellable'
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                                                        : 'bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'"
                                                    [matTooltip]="'RETURNS.FORM.RESELLABLE_TOOLTIP' | transloco">
                                                <mat-icon class="icon-size-3.5">check_circle</mat-icon>
                                                <span>{{ 'RETURNS.FORM.RESELLABLE' | transloco }}</span>
                                            </button>
                                            <button type="button" [disabled]="!l.quantity"
                                                    (click)="setCondition(l, 'Damaged')"
                                                    class="px-2.5 text-xs font-medium flex items-center gap-1 border-l border-gray-300 dark:border-gray-600 transition-colors"
                                                    [ngClass]="l.condition === 'Damaged'
                                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'
                                                        : 'bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'"
                                                    [matTooltip]="'RETURNS.FORM.DAMAGED_TOOLTIP' | transloco">
                                                <mat-icon class="icon-size-3.5">block</mat-icon>
                                                <span>{{ 'RETURNS.FORM.DAMAGED' | transloco }}</span>
                                            </button>
                                        </div>
                                    </td></ng-container>
                                <ng-container matColumnDef="lineTotal"><th mat-header-cell *matHeaderCellDef class="pr-6 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'RETURNS.FORM.COL_REFUND' | transloco }}</span></th>
                                    <td mat-cell *matCellDef="let l" class="pr-6 !text-right font-semibold tabular-nums">{{ (l.quantity * l.unitPrice) | number:'1.2-2' }}</td></ng-container>
                                <tr mat-header-row *matHeaderRowDef="['name','orig','returnable','unit','qty','condition','lineTotal']" class="bg-gray-50 dark:bg-gray-700"></tr>
                                <tr mat-row *matRowDef="let row; columns: ['name','orig','returnable','unit','qty','condition','lineTotal']"></tr>
                            </table>
                        </div>

                        <!-- Refunds -->
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center"><mat-icon class="text-blue-600 dark:text-blue-400 text-lg">payments</mat-icon></div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ 'RETURNS.FORM.REFUND_SECTION' | transloco }}</h3>
                                <button class="ml-auto" mat-stroked-button (click)="addRefund()"><mat-icon class="icon-size-5 mr-1">add</mat-icon>{{ 'RETURNS.FORM.ADD_METHOD' | transloco }}</button>
                            </div>
                            <div class="p-6 space-y-3">
                                @for (r of refunds(); track $index) {
                                    <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                                        <mat-form-field class="sm:col-span-3 w-full" appearance="outline" subscriptSizing="dynamic" hideRequiredMarker>
                                            <mat-label>{{ 'RETURNS.FORM.METHOD_LABEL' | transloco }} <span class="text-rose-600">*</span></mat-label>
                                            <mat-select [(ngModel)]="r.method" required>
                                                <mat-option value="Cash">{{ 'RETURNS.FORM.METHOD_CASH' | transloco }}</mat-option>
                                                <mat-option value="Card">{{ 'RETURNS.FORM.METHOD_CARD' | transloco }}</mat-option>
                                                <mat-option value="MobileBanking">{{ 'RETURNS.FORM.METHOD_MOBILE_BANKING' | transloco }}</mat-option>
                                                <mat-option value="BankTransfer">{{ 'RETURNS.FORM.METHOD_BANK_TRANSFER' | transloco }}</mat-option>
                                                <mat-option value="Voucher">{{ 'RETURNS.FORM.METHOD_VOUCHER' | transloco }}</mat-option>
                                                <mat-option value="Credit">{{ 'RETURNS.FORM.METHOD_STORE_CREDIT' | transloco }}</mat-option>
                                            </mat-select>
                                        </mat-form-field>
                                        <mat-form-field class="sm:col-span-3 w-full" appearance="outline" subscriptSizing="dynamic" hideRequiredMarker>
                                            <mat-label>{{ 'RETURNS.FORM.AMOUNT_LABEL' | transloco }} <span class="text-rose-600">*</span></mat-label>
                                            <input matInput type="number" min="0" step="0.01" [(ngModel)]="r.amount" required>
                                        </mat-form-field>
                                        <mat-form-field class="sm:col-span-5 w-full" appearance="outline" subscriptSizing="dynamic">
                                            <mat-label>{{ 'RETURNS.FORM.REFERENCE_LABEL' | transloco }} <span class="text-gray-400 text-xs">{{ 'RETURNS.FORM.OPTIONAL' | transloco }}</span></mat-label>
                                            <input matInput [(ngModel)]="r.reference">
                                        </mat-form-field>
                                        <button mat-icon-button class="sm:col-span-1 text-red-600" (click)="removeRefund($index)" [matTooltip]="'RETURNS.FORM.REMOVE_REFUND_TOOLTIP' | transloco">
                                            <mat-icon class="icon-size-5">delete</mat-icon>
                                        </button>
                                    </div>
                                }
                                @if (refunds().length === 0) {
                                    <p class="text-sm text-rose-700 dark:text-rose-300">{{ 'RETURNS.FORM.NO_REFUND_METHODS' | transloco }}</p>
                                }
                                @if (refunds().length > 0 && refundDue() > 0 && refundEntered() !== refundDue()) {
                                    <button type="button" mat-stroked-button (click)="autoFillRemainder()"
                                            [matTooltip]="'RETURNS.FORM.AUTO_BALANCE_TOOLTIP' | transloco">
                                        <mat-icon class="icon-size-4 mr-1">auto_fix_high</mat-icon>
                                        {{ 'RETURNS.FORM.AUTO_BALANCE' | transloco }}
                                    </button>
                                }
                            </div>
                        </div>
                    </div>

                    <!-- Reason + summary -->
                    <div class="flex flex-col gap-6">
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
                            <div class="flex items-center space-x-3 mb-4">
                                <div class="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center"><mat-icon class="text-amber-600 dark:text-amber-400 text-lg">help_center</mat-icon></div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ 'RETURNS.FORM.REASON_SECTION' | transloco }}</h3>
                            </div>
                            <mat-form-field class="w-full" appearance="outline" hideRequiredMarker>
                                <mat-label>{{ 'RETURNS.FORM.RETURN_REASON_LABEL' | transloco }} <span class="text-rose-600">*</span></mat-label>
                                <mat-select [(ngModel)]="reason" required>
                                    <mat-option value="DefectiveProduct">{{ 'RETURNS.FORM.REASON_DEFECTIVE' | transloco }}</mat-option>
                                    <mat-option value="WrongItem">{{ 'RETURNS.FORM.REASON_WRONG_ITEM' | transloco }}</mat-option>
                                    <mat-option value="BuyersRemorse">{{ 'RETURNS.FORM.REASON_BUYERS_REMORSE' | transloco }}</mat-option>
                                    <mat-option value="ExpiredOrDamaged">{{ 'RETURNS.FORM.REASON_EXPIRED_OR_DAMAGED' | transloco }}</mat-option>
                                    <mat-option value="Other">{{ 'RETURNS.FORM.REASON_OTHER' | transloco }}</mat-option>
                                </mat-select>
                            </mat-form-field>
                            <mat-form-field class="w-full" appearance="outline">
                                <mat-label>{{ 'RETURNS.FORM.NOTES_LABEL' | transloco }} <span class="text-gray-400 text-xs">{{ 'RETURNS.FORM.OPTIONAL' | transloco }}</span></mat-label>
                                <textarea matInput rows="3" [(ngModel)]="notes"></textarea>
                            </mat-form-field>
                        </div>

                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
                            <div class="flex items-center space-x-3 mb-4">
                                <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center"><mat-icon class="text-emerald-600 dark:text-emerald-400 text-lg">summarize</mat-icon></div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ 'RETURNS.FORM.SUMMARY' | transloco }}</h3>
                            </div>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">{{ 'RETURNS.FORM.ORIGINAL_TOTAL' | transloco }}</span><span class="font-medium tabular-nums">{{ s.total | number:'1.2-2' }}</span></div>
                                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">{{ 'RETURNS.FORM.ITEMS_SELECTED' | transloco }}</span><span class="font-medium tabular-nums">{{ selectedItemCount() }}</span></div>
                                <div class="flex justify-between text-xl font-bold pt-2 border-t border-gray-200 dark:border-gray-700"><span>{{ 'RETURNS.FORM.REFUND_DUE' | transloco }}</span><span class="text-rose-600 tabular-nums">{{ refundDue() | number:'1.2-2' }}</span></div>
                                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">{{ 'RETURNS.FORM.REFUND_ENTERED' | transloco }}</span><span class="font-medium tabular-nums">{{ refundEntered() | number:'1.2-2' }}</span></div>
                                <div class="flex justify-between" [ngClass]="{ 'text-red-600': !amountsBalanced(), 'text-emerald-700 dark:text-emerald-400': amountsBalanced() && refundDue() > 0 }">
                                    <span>{{ 'RETURNS.FORM.DIFFERENCE' | transloco }}</span>
                                    <span class="font-medium tabular-nums">{{ (refundEntered() - refundDue()) | number:'1.2-2' }}</span>
                                </div>
                            </div>
                            <p class="text-xs text-gray-500 mt-2"><span class="text-rose-600">*</span> {{ 'RETURNS.FORM.REQUIRED' | transloco }}</p>
                            <button mat-flat-button color="warn" class="w-full h-12 rounded-lg shadow-lg mt-4"
                                    [disabled]="!canSubmit() || submitting"
                                    (click)="submit()">
                                <mat-icon class="icon-size-5 mr-2">undo</mat-icon><span>{{ (submitting ? 'RETURNS.FORM.PROCESSING' : 'RETURNS.FORM.PROCESS_RETURN') | transloco }}</span>
                            </button>
                            @if (!canSubmit()) {
                                <p class="text-xs text-rose-700 dark:text-rose-300 mt-2">{{ disabledReason() }}</p>
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
export class ReturnFormComponent implements OnInit {
    private readonly salesApi = inject(SalesService);
    private readonly returnsApi = inject(SaleReturnsService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly _transloco = inject(TranslocoService);
    saleId!: string;
    sale = signal<SaleDto | null>(null);
    lines = signal<ReturnLineDraft[]>([]);
    refunds = signal<RefundLine[]>([]);
    reason: SaleReturnReason = 'DefectiveProduct';
    notes = '';
    submitting = false;

    // Plain methods (not computed signals) — these read per-line/per-refund
    // fields mutated directly via ngModel (`l.quantity`, `r.amount`). The
    // signal identity doesn't change on a deep mutation, so a computed()
    // would memoize the initial result and "Refund entered" / Submit gate
    // would stay stale. Plain methods re-run every change-detection tick.

    refundDue(): number {
        return this.lines().reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
    }
    refundEntered(): number {
        return this.refunds().reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    }
    selectedItemCount(): number {
        return this.lines().filter(l => l.quantity > 0).length;
    }
    amountsBalanced(): boolean {
        return Math.abs(this.refundEntered() - this.refundDue()) < 0.005;
    }

    canSubmit(): boolean {
        return this.selectedItemCount() > 0
            && this.refunds().length > 0
            && this.amountsBalanced();
    }

    disabledReason(): string {
        if (this.selectedItemCount() === 0) return this._transloco.translate('RETURNS.FORM.DISABLED_NO_ITEMS');
        if (this.refunds().length === 0) return this._transloco.translate('RETURNS.FORM.DISABLED_NO_REFUND');
        if (!this.amountsBalanced())
            return this._transloco.translate('RETURNS.FORM.DISABLED_NOT_BALANCED', {
                entered: this.refundEntered().toFixed(2),
                due: this.refundDue().toFixed(2),
            });
        return '';
    }

    nudgeQty(line: ReturnLineDraft, delta: number): void {
        const max = line.maxReturnable;
        if (max <= 0) return;
        line.quantity = Math.max(0, Math.min(max, Number(line.quantity || 0) + delta));
        this.lines.set([...this.lines()]);
    }

    setCondition(line: ReturnLineDraft, condition: ReturnedItemCondition): void {
        line.condition = condition;
        this.lines.set([...this.lines()]);
    }

    /** Drop the remaining refund difference onto the first refund row so the cashier
     *  doesn't have to do mental arithmetic when split-tender doesn't quite balance. */
    autoFillRemainder(): void {
        const refunds = [...this.refunds()];
        if (refunds.length === 0) return;
        const due = this.refundDue();
        const enteredExceptFirst = refunds.slice(1).reduce((s, r) => s + (Number(r.amount) || 0), 0);
        refunds[0].amount = Math.max(0, +(due - enteredExceptFirst).toFixed(2));
        this.refunds.set(refunds);
    }

    /** Set when load is in flight so the form can hide totals until math is honest. */
    private loadingPrior = signal(false);

    ngOnInit(): void {
        this.saleId = this.route.snapshot.paramMap.get('saleId')!;
        this.loadingPrior.set(true);

        // Fetch the sale AND any prior non-voided returns against it in parallel.
        // We must subtract already-returned qty per sale-item before the cashier
        // sees the table — otherwise they can over-claim a partial-return.
        this.salesApi.get(this.saleId).subscribe(s => {
            this.sale.set(s);
            this.returnsApi.getBySale(this.saleId).subscribe({
                next: priorReturns => this.buildLines(s, priorReturns ?? []),
                error: () => this.buildLines(s, []), // be lenient — show the form but flag it
            });
        });
    }

    private buildLines(s: SaleDto, priorReturns: SaleReturnDto[]): void {
        // Sum already-returned qty per saleItemId across non-voided returns.
        const alreadyByItem = new Map<string, number>();
        for (const pr of priorReturns) {
            if (pr.status === 'Voided') continue;
            for (const it of (pr.items ?? [])) {
                alreadyByItem.set(it.saleItemId, (alreadyByItem.get(it.saleItemId) ?? 0) + (it.quantity ?? 0));
            }
        }

        this.lines.set(s.items.map<ReturnLineDraft>(i => {
            const already = alreadyByItem.get(i.id) ?? 0;
            const max = Math.max(0, i.quantity - already);
            return {
                saleItemId: i.id,
                productName: i.productName,
                sku: i.sku,
                serialNumber: i.serialNumber,
                batchNumber: i.batchNumber,
                originalQuantity: i.quantity,
                alreadyReturned: already,
                maxReturnable: max,
                unitPrice: i.unitPrice,
                quantity: 0,
                condition: 'Resellable',
            };
        }));
        this.loadingPrior.set(false);
    }

    /** Tiny inline hint shown on the Items header — surfaces the fact that prior returns exist
     *  so the cashier knows why some lines may already be fully refunded. */
    priorReturnsHint(): string {
        const lines = this.lines();
        const alreadyHit = lines.filter(l => l.alreadyReturned > 0).length;
        if (alreadyHit === 0) return '';
        const fullyConsumed = lines.filter(l => l.maxReturnable === 0 && l.alreadyReturned > 0).length;
        if (fullyConsumed > 0)
            return this._transloco.translate('RETURNS.FORM.HINT_PARTIAL_AND_FULL', { partial: alreadyHit, full: fullyConsumed });
        return this._transloco.translate('RETURNS.FORM.HINT_PARTIAL', { count: alreadyHit });
    }

    anyReturnable(): boolean {
        return this.lines().some(l => l.maxReturnable > 0 && l.quantity < l.maxReturnable);
    }

    /** Full-refund shortcut — set every line's qty to its remaining returnable amount. */
    returnAll(): void {
        this.lines.update(ls => ls.map(l => ({
            ...l,
            quantity: l.maxReturnable,
        })));
    }
    clearAllQty(): void {
        this.lines.update(ls => ls.map(l => ({ ...l, quantity: 0 })));
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

    /** Pick the most-used payment method on the original sale, or Cash if none. */
    private defaultRefundMethod(): PaymentMethod {
        const payments = this.sale()?.payments ?? [];
        if (payments.length === 0) return 'Cash';
        const totals: Partial<Record<PaymentMethod, number>> = {};
        for (const p of payments) totals[p.method] = (totals[p.method] ?? 0) + p.amount;
        let best: PaymentMethod = payments[0].method;
        let bestAmt = totals[best] ?? 0;
        for (const m of Object.keys(totals) as PaymentMethod[]) {
            if ((totals[m] ?? 0) > bestAmt) { best = m; bestAmt = totals[m] ?? 0; }
        }
        return best;
    }

    addRefund(): void {
        const remaining = +(this.refundDue() - this.refundEntered()).toFixed(2);
        const method = this.refunds().length === 0 ? this.defaultRefundMethod() : 'Cash';
        this.refunds.set([
            ...this.refunds(),
            { method, amount: Math.max(0, remaining), reference: '' },
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
