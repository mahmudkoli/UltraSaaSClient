import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GoodsReceiptsService, PurchaseReturnsService } from 'app/core/purchasing/purchasing.service';
import {
    CreatePurchaseReturnRequest, GoodsReceiptDto, GoodsReceiptItemDto,
    PurchaseReturnDto, PurchaseReturnReason, SupplierCreditMethod,
} from 'app/core/purchasing/purchasing.types';

interface FormLine {
    grItem: GoodsReceiptItemDto;
    selected: boolean;
    quantity: number;
    serialNumber: string;
    maxQty: number;          // received - already-returned
    serialOptions: string[]; // available serials (received - already-returned)
}

interface FormCredit {
    amount: number;
    method: SupplierCreditMethod;
    reference?: string;
}

@Component({
    selector: 'app-purchase-return-form',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule,
        MatInputModule, MatSelectModule, MatSnackBarModule, MatTableModule, MatTooltipModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        @if (gr(); as g) {
            <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div class="flex items-center space-x-4">
                    <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg"><mat-icon class="text-white">assignment_return</mat-icon></div>
                    <div>
                        <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Send back to supplier</h2>
                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Receipt <a class="text-blue-600 hover:underline font-mono" [routerLink]="['/goods-receipts', g.id]">{{ g.receiptNumber }}</a> · PO <span class="font-mono">{{ g.poNumber }}</span></p>
                    </div>
                </div>
                <button mat-stroked-button class="h-12 px-6 rounded-lg" [routerLink]="['/goods-receipts', g.id]"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>Cancel</span></button>
            </div>

            <div class="flex-auto p-4 sm:p-6 space-y-6">
                <!-- Reason + Notes -->
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <mat-form-field appearance="outline" subscriptSizing="dynamic">
                        <mat-label>Reason</mat-label>
                        <mat-select [(ngModel)]="reason">
                            <mat-option value="Damaged">Damaged</mat-option>
                            <mat-option value="WrongItem">Wrong item</mat-option>
                            <mat-option value="Excess">Excess / over-shipped</mat-option>
                            <mat-option value="Expired">Expired on receipt</mat-option>
                            <mat-option value="QualityFailure">Quality failure / QC</mat-option>
                            <mat-option value="Other">Other</mat-option>
                        </mat-select>
                    </mat-form-field>
                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="md:col-span-2">
                        <mat-label>Notes</mat-label>
                        <input matInput [(ngModel)]="notes" placeholder="Optional context (e.g. courier reference, supplier RMA #)">
                    </mat-form-field>
                </div>

                <!-- Lines -->
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                        <div class="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center"><mat-icon class="text-violet-600 dark:text-violet-400 text-lg">inventory_2</mat-icon></div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Lines to return</h3>
                    </div>
                    <table mat-table [dataSource]="lines()" class="w-full">
                        <ng-container matColumnDef="select"><th mat-header-cell *matHeaderCellDef class="pl-6 w-10"></th>
                            <td mat-cell *matCellDef="let l" class="pl-6">
                                <mat-checkbox [(ngModel)]="l.selected" [disabled]="l.maxQty <= 0"></mat-checkbox>
                            </td></ng-container>
                        <ng-container matColumnDef="product"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Product</span></th>
                            <td mat-cell *matCellDef="let l">
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ l.grItem.productName }}</span>
                                    <span class="text-xs font-mono text-gray-500">{{ l.grItem.sku }}</span>
                                </div>
                            </td></ng-container>
                        <ng-container matColumnDef="received"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Received</span></th>
                            <td mat-cell *matCellDef="let l" class="!text-right">{{ l.grItem.quantityReceived | number:'1.0-3' }}</td></ng-container>
                        <ng-container matColumnDef="returnable"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Returnable</span></th>
                            <td mat-cell *matCellDef="let l" class="!text-right" [class.text-rose-700]="l.maxQty <= 0">{{ l.maxQty | number:'1.0-3' }}</td></ng-container>
                        <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</span></th>
                            <td mat-cell *matCellDef="let l" class="!text-right py-1">
                                <input type="number" [min]="0" [max]="l.maxQty" step="0.01"
                                       [(ngModel)]="l.quantity" [disabled]="!l.selected"
                                       class="w-20 border rounded px-2 py-1 text-right" />
                            </td></ng-container>
                        <ng-container matColumnDef="serial"><th mat-header-cell *matHeaderCellDef class="pr-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Serial</span></th>
                            <td mat-cell *matCellDef="let l" class="pr-6">
                                @if (l.serialOptions.length > 0) {
                                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-44">
                                        <mat-select [(ngModel)]="l.serialNumber" [disabled]="!l.selected">
                                            <mat-option [value]="''">— pick a serial —</mat-option>
                                            @for (s of l.serialOptions; track s) {
                                                <mat-option [value]="s">{{ s }}</mat-option>
                                            }
                                        </mat-select>
                                    </mat-form-field>
                                } @else {
                                    <span class="text-xs text-gray-400">—</span>
                                }
                            </td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="lineCols" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: lineCols"></tr>
                    </table>
                </div>

                <!-- Credits -->
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center"><mat-icon class="text-emerald-600 dark:text-emerald-400 text-lg">request_quote</mat-icon></div>
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Supplier credit</h3>
                            <span class="text-sm text-gray-500">Expected total: <span class="font-semibold text-gray-900 dark:text-white">{{ expectedTotal() | number:'1.2-2' }}</span></span>
                        </div>
                        <button type="button" mat-stroked-button (click)="addCredit()"><mat-icon class="icon-size-5 mr-1">add</mat-icon>Add credit row</button>
                    </div>
                    <div class="p-6 space-y-3">
                        @for (c of credits(); track $index) {
                            <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="md:col-span-3">
                                    <mat-label>Amount</mat-label>
                                    <input matInput type="number" min="0" step="0.01" [(ngModel)]="c.amount">
                                </mat-form-field>
                                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="md:col-span-3">
                                    <mat-label>Method</mat-label>
                                    <mat-select [(ngModel)]="c.method">
                                        <mat-option value="CreditNote">Credit note</mat-option>
                                        <mat-option value="CashRefund">Cash refund</mat-option>
                                        <mat-option value="BankRefund">Bank refund</mat-option>
                                        <mat-option value="Replacement">Replacement (no money)</mat-option>
                                        <mat-option value="InvoiceAdjustment">Invoice adjustment</mat-option>
                                    </mat-select>
                                </mat-form-field>
                                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="md:col-span-5">
                                    <mat-label>Reference (RMA / CN # / etc.)</mat-label>
                                    <input matInput [(ngModel)]="c.reference">
                                </mat-form-field>
                                <button type="button" mat-icon-button class="text-rose-600 mt-1" (click)="removeCredit($index)" matTooltip="Remove credit row">
                                    <mat-icon class="icon-size-5">delete</mat-icon>
                                </button>
                            </div>
                        }
                        <p class="text-xs text-gray-500" *ngIf="hasCashishCredit() && Math.abs(creditTotal() - expectedTotal()) > 0.01">
                            Credit total ({{ creditTotal() | number:'1.2-2' }}) doesn't match expected ({{ expectedTotal() | number:'1.2-2' }}). Use Replacement for non-cash resolutions.
                        </p>
                    </div>
                </div>

                <!-- Submit -->
                <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 sm:justify-end">
                    <button type="button" mat-stroked-button class="w-full sm:w-auto h-12 px-6 rounded-lg" [routerLink]="['/goods-receipts', g.id]">Cancel</button>
                    <button type="button" mat-flat-button color="warn" class="w-full sm:w-auto h-12 px-6 rounded-lg"
                            [disabled]="!canSubmit() || submitting()" (click)="submit()">
                        <mat-icon *ngIf="!submitting()" class="icon-size-5 mr-2">send</mat-icon>
                        <span>{{ submitting() ? 'Submitting…' : 'Send back to supplier' }}</span>
                    </button>
                </div>
            </div>
        }
    </div>
</div>
    `,
})
export class PurchaseReturnFormComponent implements OnInit {
    private readonly grApi = inject(GoodsReceiptsService);
    private readonly api = inject(PurchaseReturnsService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly snack = inject(MatSnackBar);

    Math = Math;

    gr = signal<GoodsReceiptDto | null>(null);
    lines = signal<FormLine[]>([]);
    credits = signal<FormCredit[]>([{ amount: 0, method: 'CreditNote' }]);
    reason: PurchaseReturnReason = 'Damaged';
    notes = '';
    submitting = signal(false);

    lineCols = ['select', 'product', 'received', 'returnable', 'qty', 'serial'];

    // Sum of selected line subtotals (qty × unit cost).
    expectedTotal = computed(() =>
        this.lines()
            .filter(l => l.selected && l.quantity > 0)
            .reduce((s, l) => s + l.quantity * l.grItem.unitCost, 0));

    creditTotal = computed(() =>
        this.credits().reduce((s, c) => s + (c.amount || 0), 0));

    hasCashishCredit = (): boolean =>
        this.credits().some(c => c.method !== 'Replacement' && (c.amount ?? 0) > 0);

    canSubmit = computed(() => {
        const selected = this.lines().filter(l => l.selected && l.quantity > 0);
        if (selected.length === 0) return false;
        // Each selected line must respect maxQty + supply a serial when serialOptions is non-empty
        for (const l of selected) {
            if (l.quantity > l.maxQty + 0.001) return false;
            if (l.serialOptions.length > 0 && !l.serialNumber) return false;
        }
        // Credit total ok: either all-Replacement (zero) or matches expected within penny
        if (this.hasCashishCredit() && Math.abs(this.creditTotal() - this.expectedTotal()) > 0.01) return false;
        return true;
    });

    ngOnInit(): void {
        const grId = this.route.snapshot.paramMap.get('goodsReceiptId')!;
        this.grApi.get(grId).subscribe(g => {
            this.gr.set(g);

            // Existing returns against this receipt → compute already-returned per line + serial.
            this.api.getByReceipt(grId).subscribe(prior => this.buildLines(g, prior));
        });
    }

    private buildLines(g: GoodsReceiptDto, priorReturns: PurchaseReturnDto[]): void {
        const liveReturns = priorReturns.filter(p => p.status !== 'Voided');

        // Already-returned qty by GR item id
        const returnedQty = new Map<string, number>();
        // Already-returned serials
        const returnedSerials = new Set<string>();

        for (const pr of liveReturns) {
            for (const it of pr.items) {
                returnedQty.set(it.goodsReceiptItemId, (returnedQty.get(it.goodsReceiptItemId) ?? 0) + it.quantity);
                if (it.serialNumber) returnedSerials.add(it.serialNumber.toUpperCase());
            }
        }

        const lines: FormLine[] = g.items.map(grItem => {
            const already = returnedQty.get(grItem.id) ?? 0;
            const max = Math.max(0, grItem.quantityReceived - already);
            const serialOptions = (grItem.serialNumbers ?? [])
                .filter(s => !returnedSerials.has(s.toUpperCase()));
            return {
                grItem,
                selected: false,
                quantity: max > 0 ? Math.min(1, max) : 0,
                serialNumber: '',
                maxQty: max,
                serialOptions,
            };
        });
        this.lines.set(lines);
    }

    addCredit(): void {
        this.credits.update(arr => [...arr, { amount: 0, method: 'CreditNote' }]);
    }
    removeCredit(idx: number): void {
        this.credits.update(arr => {
            const next = [...arr];
            next.splice(idx, 1);
            return next.length === 0 ? [{ amount: 0, method: 'CreditNote' }] : next;
        });
    }

    submit(): void {
        const g = this.gr();
        if (!g || !this.canSubmit()) return;

        const req: CreatePurchaseReturnRequest = {
            goodsReceiptId: g.id,
            reason: this.reason,
            lines: this.lines()
                .filter(l => l.selected && l.quantity > 0)
                .map(l => ({
                    goodsReceiptItemId: l.grItem.id,
                    quantity: l.quantity,
                    serialNumber: l.serialNumber || undefined,
                })),
            credits: this.credits().map(c => ({
                amount: c.amount || 0,
                method: c.method,
                reference: c.reference || undefined,
            })),
            notes: this.notes.trim() || undefined,
        };

        this.submitting.set(true);
        this.api.create(req).subscribe({
            next: id => {
                this.snack.open(`Return created`, 'OK', { duration: 3000 });
                this.router.navigate(['/purchase-returns', id]);
            },
            error: err => {
                this.submitting.set(false);
                const msg = err?.error?.exception ?? err?.error?.title ?? err?.message ?? 'Return failed';
                this.snack.open(msg, 'OK', { duration: 6000 });
            },
        });
    }
}
