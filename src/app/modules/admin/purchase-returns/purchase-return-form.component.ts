import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
import { SerialPickerDialogComponent } from './serial-picker-dialog.component';

interface FormLine {
    grItem: GoodsReceiptItemDto;
    selected: boolean;
    quantity: number;
    serialNumber: string;
    maxQty: number;          // received - already-returned (or 1 on inline serial sub-rows)
    // Serial-tracked rendering modes (threshold = SERIAL_INLINE_THRESHOLD):
    //   small group (N <= threshold) → expand to N inline sub-rows, qty=1 each
    //   large group (N > threshold)  → single collapsed row + "Pick serials" dialog
    // Non-serial items render as a single row with the qty stepper.
    isSerialRow: boolean;
    isFirstOfGroup: boolean;
    groupRemaining: number;  // group's total remaining returnable — shown on first-of-group only

    // Collapsed-mode only (isCollapsed = true)
    isCollapsed: boolean;
    availableSerials: string[];   // full pool for the picker dialog
    selectedSerials: string[];    // operator's picks; drives `selected` + `quantity`
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
        MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatIconModule,
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
                                @if (l.isCollapsed) {
                                    @if (l.selectedSerials.length > 0) {
                                        <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 tabular-nums">
                                            {{ l.selectedSerials.length }}
                                        </span>
                                    }
                                } @else {
                                    <mat-checkbox [(ngModel)]="l.selected"
                                                  (ngModelChange)="onLineToggled(l, $event)"
                                                  [disabled]="l.maxQty <= 0"></mat-checkbox>
                                }
                            </td></ng-container>
                        <ng-container matColumnDef="product"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Product</span></th>
                            <td mat-cell *matCellDef="let l">
                                @if (l.isFirstOfGroup) {
                                    <div class="flex flex-col">
                                        <span class="text-sm font-medium text-gray-900 dark:text-white">{{ l.grItem.productName }}</span>
                                        <span class="text-xs font-mono text-gray-500">{{ l.grItem.sku }}</span>
                                        @if (l.isSerialRow && !l.isCollapsed && l.groupRemaining > 1) {
                                            <button type="button" (click)="toggleGroupAll(l)"
                                                    class="text-xs text-blue-600 hover:underline mt-1 self-start">
                                                {{ isGroupAllSelected(l) ? 'Untick all' : ('Tick all ' + l.groupRemaining) }}
                                            </button>
                                        }
                                    </div>
                                } @else {
                                    <span class="text-xs text-gray-400 italic pl-4">↳ same product</span>
                                }
                            </td></ng-container>
                        <ng-container matColumnDef="received"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Received</span></th>
                            <td mat-cell *matCellDef="let l" class="!text-right">
                                @if (l.isFirstOfGroup) { {{ l.grItem.quantityReceived | number:'1.0-3' }} }
                            </td></ng-container>
                        <ng-container matColumnDef="returnable"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Returnable</span></th>
                            <td mat-cell *matCellDef="let l" class="!text-right">
                                @if (l.isFirstOfGroup) {
                                    <span [class.text-rose-700]="l.groupRemaining <= 0">{{ l.groupRemaining | number:'1.0-3' }}</span>
                                }
                            </td></ng-container>
                        <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</span></th>
                            <td mat-cell *matCellDef="let l" class="!text-right py-1">
                                @if (l.isCollapsed) {
                                    <span class="text-sm tabular-nums font-medium" [class.text-gray-400]="l.selectedSerials.length === 0">{{ l.selectedSerials.length }}</span>
                                } @else if (l.isSerialRow) {
                                    <span class="text-sm tabular-nums" [class.text-gray-400]="!l.selected">{{ l.selected ? 1 : 0 }}</span>
                                } @else {
                                    <div class="flex items-center justify-end gap-1">
                                        <button type="button" (click)="nudgeQty(l, -1)" [disabled]="!l.selected || l.quantity <= 0"
                                                class="w-6 h-6 flex items-center justify-center rounded border text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                                aria-label="Decrease quantity">
                                            <mat-icon class="icon-size-4">remove</mat-icon>
                                        </button>
                                        <input type="number" [min]="0" [max]="l.maxQty" step="0.01"
                                               [(ngModel)]="l.quantity" [disabled]="!l.selected"
                                               class="w-16 border rounded px-1 py-0.5 text-right tabular-nums"
                                               [class.!border-rose-400]="l.selected && l.quantity > l.maxQty"
                                               [class.!text-rose-600]="l.selected && l.quantity > l.maxQty"
                                               [matTooltip]="l.selected && l.quantity > l.maxQty ? ('Max returnable: ' + l.maxQty) : ''" />
                                        <button type="button" (click)="nudgeQty(l, 1)" [disabled]="!l.selected || l.quantity >= l.maxQty"
                                                class="w-6 h-6 flex items-center justify-center rounded border text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                                aria-label="Increase quantity">
                                            <mat-icon class="icon-size-4">add</mat-icon>
                                        </button>
                                    </div>
                                }
                            </td></ng-container>
                        <ng-container matColumnDef="serial"><th mat-header-cell *matHeaderCellDef class="pr-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Serial</span></th>
                            <td mat-cell *matCellDef="let l" class="pr-6">
                                @if (l.isCollapsed) {
                                    <button type="button" mat-stroked-button (click)="openSerialPicker(l)" class="!h-8 text-xs">
                                        <mat-icon class="icon-size-4 mr-1">checklist</mat-icon>
                                        Pick serials ({{ l.selectedSerials.length }} of {{ l.availableSerials.length }})
                                    </button>
                                } @else if (l.isSerialRow) {
                                    <span class="text-sm font-mono text-gray-700 dark:text-gray-200">{{ l.serialNumber }}</span>
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
                <div class="flex flex-col gap-2 sm:items-end">
                    <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <button type="button" mat-stroked-button class="w-full sm:w-auto h-12 px-6 rounded-lg" [routerLink]="['/goods-receipts', g.id]">Cancel</button>
                        <button type="button" mat-flat-button color="warn" class="w-full sm:w-auto h-12 px-6 rounded-lg"
                                [disabled]="!canSubmit() || submitting()" (click)="submit()">
                            <mat-icon *ngIf="!submitting()" class="icon-size-5 mr-2">send</mat-icon>
                            <span>{{ submitting() ? 'Submitting…' : 'Send back to supplier' }}</span>
                        </button>
                    </div>
                    @if (!canSubmit() && disabledReason()) {
                        <p class="text-xs text-rose-700 dark:text-rose-300 max-w-md text-right">{{ disabledReason() }}</p>
                    }
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
    private readonly dialog = inject(MatDialog);

    /** Inline sub-row vs collapsed-picker threshold — mirrors GR's 1/2-5/6+ ladder. */
    private readonly SERIAL_INLINE_THRESHOLD = 5;

    Math = Math;

    gr = signal<GoodsReceiptDto | null>(null);
    lines = signal<FormLine[]>([]);
    credits = signal<FormCredit[]>([{ amount: 0, method: 'CreditNote' }]);
    reason: PurchaseReturnReason = 'Damaged';
    notes = '';
    submitting = signal(false);

    lineCols = ['select', 'product', 'received', 'returnable', 'qty', 'serial'];

    // NOTE: these read per-line / per-credit fields mutated directly via two-way
    // ngModel (`l.selected`, `l.quantity`, `l.serialNumber`, `c.amount`).
    // `computed()` would memoize on the `lines` / `credits` signal identity and
    // never re-evaluate when those nested fields change — that's why the
    // checkbox click and amount-typing previously did nothing to the totals or
    // the submit button. Plain methods re-run every change-detection tick.

    /** Sum of selected line subtotals (qty × unit cost). */
    expectedTotal(): number {
        return this.lines()
            .filter(l => l.selected && l.quantity > 0)
            .reduce((s, l) => s + l.quantity * l.grItem.unitCost, 0);
    }

    creditTotal(): number {
        return this.credits().reduce((s, c) => s + (c.amount || 0), 0);
    }

    hasCashishCredit(): boolean {
        return this.credits().some(c => c.method !== 'Replacement' && (c.amount ?? 0) > 0);
    }

    selectedLineCount(): number {
        return this.lines().filter(l => l.selected && l.quantity > 0).length;
    }

    canSubmit(): boolean {
        const selected = this.lines().filter(l => l.selected && l.quantity > 0);
        if (selected.length === 0) return false;
        for (const l of selected) {
            if (l.quantity > l.maxQty + 0.001) return false;
            // Serial rows have their serial baked in at buildLines time; no missing-serial check needed.
        }
        if (this.hasCashishCredit() && Math.abs(this.creditTotal() - this.expectedTotal()) > 0.01) return false;
        return true;
    }

    /** Why the Send-back button is disabled — surfaces the missing piece to the operator. */
    disabledReason(): string {
        const selected = this.lines().filter(l => l.selected && l.quantity > 0);
        if (selected.length === 0) return 'Tick at least one row and set a quantity greater than zero.';
        for (const l of selected) {
            if (l.quantity > l.maxQty + 0.001)
                return `'${l.grItem.productName}' qty exceeds returnable ${l.maxQty}.`;
        }
        if (this.hasCashishCredit() && Math.abs(this.creditTotal() - this.expectedTotal()) > 0.01)
            return `Credit total (${this.creditTotal().toFixed(2)}) must match expected (${this.expectedTotal().toFixed(2)}). Use Replacement rows for non-cash resolutions.`;
        return '';
    }

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

        const lines: FormLine[] = [];
        for (const grItem of g.items) {
            const already = returnedQty.get(grItem.id) ?? 0;
            const max = Math.max(0, grItem.quantityReceived - already);
            const availableSerials = (grItem.serialNumbers ?? [])
                .filter(s => !returnedSerials.has(s.toUpperCase()));

            if (availableSerials.length === 0) {
                // Non-serial: single row with the qty stepper.
                lines.push({
                    grItem,
                    selected: false,
                    quantity: max > 0 ? Math.min(1, max) : 0,
                    serialNumber: '',
                    maxQty: max,
                    isSerialRow: false,
                    isFirstOfGroup: true,
                    groupRemaining: max,
                    isCollapsed: false,
                    availableSerials: [],
                    selectedSerials: [],
                });
            } else if (availableSerials.length <= this.SERIAL_INLINE_THRESHOLD) {
                // Inline mode: one sub-row per available serial, qty implicitly 1.
                // Operator ticks the serials they want to send back; backend gets one
                // line per ticked serial with quantity=1 (the only shape it accepts).
                for (let i = 0; i < availableSerials.length; i++) {
                    lines.push({
                        grItem,
                        selected: false,
                        quantity: 0,
                        serialNumber: availableSerials[i],
                        maxQty: 1,
                        isSerialRow: true,
                        isFirstOfGroup: i === 0,
                        groupRemaining: availableSerials.length,
                        isCollapsed: false,
                        availableSerials: [],
                        selectedSerials: [],
                    });
                }
            } else {
                // Collapsed mode: single row + "Pick serials" button → modal picker.
                // Selected serials drive `selected` (any picked → true) and `quantity`
                // (= picked.length); on submit we fan out one backend line per pick.
                lines.push({
                    grItem,
                    selected: false,
                    quantity: 0,
                    serialNumber: '',
                    maxQty: availableSerials.length,
                    isSerialRow: true,
                    isFirstOfGroup: true,
                    groupRemaining: availableSerials.length,
                    isCollapsed: true,
                    availableSerials: [...availableSerials],
                    selectedSerials: [],
                });
            }
        }
        this.lines.set(lines);
    }

    nudgeQty(line: FormLine, delta: number): void {
        if (!line.selected) return;
        const next = Math.max(0, Math.min(line.maxQty, Number(line.quantity || 0) + delta));
        line.quantity = next;
        this.lines.set([...this.lines()]);
    }

    /** Opens the bulk picker for collapsed serial groups (>5 available). */
    openSerialPicker(line: FormLine): void {
        if (!line.isCollapsed) return;
        const ref = this.dialog.open(SerialPickerDialogComponent, {
            data: {
                productName: line.grItem.productName,
                sku: line.grItem.sku,
                availableSerials: line.availableSerials,
                initialSelected: line.selectedSerials,
            },
            width: '720px',
            maxWidth: '95vw',
            autoFocus: 'first-tabbable',
        });
        ref.afterClosed().subscribe((picked: string[] | null | undefined) => {
            if (picked === null || picked === undefined) return;
            line.selectedSerials = picked;
            line.selected = picked.length > 0;
            line.quantity = picked.length;
            this.lines.set([...this.lines()]);
        });
    }

    /** Inline-mode mass action: tick/untick every serial sub-row in this group. */
    toggleGroupAll(firstLine: FormLine): void {
        const id = firstLine.grItem.id;
        const group = this.lines().filter(l => l.grItem.id === id && l.isSerialRow && !l.isCollapsed);
        const allSelected = group.length > 0 && group.every(l => l.selected);
        for (const l of group) {
            l.selected = !allSelected;
            l.quantity = !allSelected ? 1 : 0;
        }
        this.lines.set([...this.lines()]);
    }

    isGroupAllSelected(firstLine: FormLine): boolean {
        const id = firstLine.grItem.id;
        const group = this.lines().filter(l => l.grItem.id === id && l.isSerialRow && !l.isCollapsed);
        return group.length > 0 && group.every(l => l.selected);
    }

    /**
     * Tick = the row contributes to the return; untick = it doesn't.
     * Serial rows: qty toggles 0 ↔ 1 (the only valid shape).
     * Non-serial rows: tick defaults qty to 1 (or maxQty if less) so totals
     * update immediately; untick resets qty to 0.
     */
    onLineToggled(line: FormLine, checked: boolean): void {
        if (line.isSerialRow) {
            line.quantity = checked ? 1 : 0;
        } else if (checked) {
            if (!line.quantity || line.quantity <= 0) {
                line.quantity = Math.min(1, line.maxQty);
            }
        } else {
            line.quantity = 0;
            line.serialNumber = '';
        }
        this.lines.set([...this.lines()]);
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

        // Collapsed rows expand 1 form row → N backend lines (one per picked serial).
        // Inline serial rows and non-serial rows map 1:1.
        const backendLines: { goodsReceiptItemId: string; quantity: number; serialNumber?: string }[] = [];
        for (const l of this.lines()) {
            if (!l.selected || l.quantity <= 0) continue;
            if (l.isCollapsed) {
                for (const sn of l.selectedSerials) {
                    backendLines.push({ goodsReceiptItemId: l.grItem.id, quantity: 1, serialNumber: sn });
                }
            } else {
                backendLines.push({
                    goodsReceiptItemId: l.grItem.id,
                    quantity: l.quantity,
                    serialNumber: l.serialNumber || undefined,
                });
            }
        }

        const req: CreatePurchaseReturnRequest = {
            goodsReceiptId: g.id,
            reason: this.reason,
            lines: backendLines,
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
