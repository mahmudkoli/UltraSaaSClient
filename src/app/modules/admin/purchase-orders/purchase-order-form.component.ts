import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router, RouterModule } from '@angular/router';
import { ProductsService } from 'app/core/catalog/catalog.service';
import { ProductDto } from 'app/core/catalog/catalog.types';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletDto } from 'app/core/outlets/outlets.types';
import { PurchaseOrdersService, SuppliersService } from 'app/core/purchasing/purchasing.service';
import { CreatePurchaseOrderLine, SupplierDto } from 'app/core/purchasing/purchasing.types';

interface POLineDraft {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitCost: number;
}

@Component({
    selector: 'app-purchase-order-form',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatAutocompleteModule, MatButtonModule, MatFormFieldModule, MatIconModule,
        MatInputModule, MatSelectModule, MatTableModule, MatTooltipModule,
        MatDatepickerModule, MatNativeDateModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl shadow-lg"><mat-icon class="text-white">request_quote</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">New Purchase Order</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Order stock from a supplier</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <button mat-stroked-button class="h-12 px-6 rounded-lg" routerLink="/purchase-orders"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>Cancel</span></button>
            </div>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 flex flex-col gap-6">
                    <!-- Header -->
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
                        <div class="flex items-center space-x-3 mb-4">
                            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center"><mat-icon class="text-blue-600 dark:text-blue-400 text-lg">info</mat-icon></div>
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Order Details</h3>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <mat-form-field appearance="outline" class="w-full" hideRequiredMarker>
                                <mat-label>Outlet <span class="text-rose-600">*</span></mat-label>
                                <mat-select [(ngModel)]="outletId" required>
                                    @for (o of outlets(); track o.id) {
                                        <mat-option [value]="o.id">{{ o.name }}</mat-option>
                                    }
                                </mat-select>
                            </mat-form-field>
                            <mat-form-field appearance="outline" class="w-full" hideRequiredMarker>
                                <mat-label>Supplier <span class="text-rose-600">*</span></mat-label>
                                <input matInput #supplierInput
                                       [(ngModel)]="supplierSearch"
                                       [matAutocomplete]="supplierAuto"
                                       (blur)="resetSupplierIfClearedOrUnselected()"
                                       placeholder="Type to search by name or tax ID"
                                       required>
                                <mat-autocomplete #supplierAuto="matAutocomplete"
                                                  (optionSelected)="onSupplierPicked($event.option.value)"
                                                  [displayWith]="displaySupplier">
                                    @for (s of supplierOptions(); track s.id) {
                                        <mat-option [value]="s">
                                            <div class="flex items-center justify-between gap-2 w-full">
                                                <span class="truncate">{{ s.name }}</span>
                                                @if (s.taxId) {
                                                    <span class="text-xs text-gray-500 font-mono flex-shrink-0">{{ s.taxId }}</span>
                                                }
                                            </div>
                                        </mat-option>
                                    }
                                    @if (supplierOptions().length === 0 && supplierSearch && suppliers().length > 0) {
                                        <mat-option [disabled]="true" class="!opacity-100">
                                            <span class="text-xs text-gray-500 italic">No supplier matches "{{ supplierSearch }}".</span>
                                        </mat-option>
                                    }
                                </mat-autocomplete>
                                @if (supplierId) {
                                    <button matSuffix mat-icon-button type="button" aria-label="Clear supplier"
                                            (click)="clearSupplier(supplierInput); $event.stopPropagation()">
                                        <mat-icon class="icon-size-4">close</mat-icon>
                                    </button>
                                }
                            </mat-form-field>
                            <mat-form-field appearance="outline" class="w-full">
                                <mat-label>Expected delivery <span class="text-gray-400 text-xs">(optional)</span></mat-label>
                                <input matInput [matDatepicker]="picker" [(ngModel)]="expectedDate">
                                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                                <mat-datepicker #picker></mat-datepicker>
                            </mat-form-field>
                            <mat-form-field appearance="outline" class="w-full">
                                <mat-label>Notes <span class="text-gray-400 text-xs">(optional)</span></mat-label>
                                <input matInput [(ngModel)]="notes">
                            </mat-form-field>
                        </div>
                        <p class="text-xs text-gray-500 mt-2"><span class="text-rose-600">*</span> Required</p>
                    </div>

                    <!-- Lines -->
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                            <div class="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center"><mat-icon class="text-violet-600 dark:text-violet-400 text-lg">inventory_2</mat-icon></div>
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                                Line Items <span class="text-rose-600">*</span>
                                @if (lines().length > 0) {
                                    <span class="ml-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 rounded-full px-2 py-0.5">
                                        <mat-icon class="icon-size-3.5">check_circle</mat-icon>
                                        {{ lines().length }} added
                                    </span>
                                }
                            </h3>
                            <span class="text-xs text-gray-500">At least one product required</span>
                        </div>

                        <div class="px-6 py-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-gray-50 dark:bg-gray-900/40">
                            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="sm:col-span-7 w-full">
                                <mat-label>Add product</mat-label>
                                <input matInput #productInput
                                       [(ngModel)]="productSearch"
                                       [matAutocomplete]="productAuto"
                                       placeholder="Search by name or SKU">
                                <mat-autocomplete #productAuto="matAutocomplete"
                                                  (optionSelected)="onProductPicked($event.option.value, productInput)"
                                                  [displayWith]="displayProduct">
                                    @for (p of productOptions(); track p.id) {
                                        <mat-option [value]="p">
                                            <div class="flex items-center justify-between gap-2 w-full">
                                                <span class="truncate">{{ p.name }}</span>
                                                <span class="text-xs text-gray-500 font-mono flex-shrink-0">{{ p.sku }}</span>
                                            </div>
                                        </mat-option>
                                    }
                                    @if (productOptions().length === 0 && lines().length > 0) {
                                        <mat-option [disabled]="true" class="!opacity-100">
                                            <span class="text-xs text-gray-500 italic">All matching products are already in this PO.</span>
                                        </mat-option>
                                    }
                                </mat-autocomplete>
                            </mat-form-field>
                        </div>

                        <table mat-table [dataSource]="lines()" class="w-full">
                            <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef class="pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Product</span></th>
                                <td mat-cell *matCellDef="let l" class="pl-6">
                                    <div class="flex flex-col">
                                        <span class="text-sm font-medium text-gray-900 dark:text-white">{{ l.productName }}</span>
                                        <span class="text-xs text-gray-500 font-mono">{{ l.sku }}</span>
                                    </div>
                                </td></ng-container>
                            <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</span></th>
                                <td mat-cell *matCellDef="let l" class="!text-right">
                                    <div class="flex items-center justify-end gap-1">
                                        <button type="button" (click)="nudgeQty(l, -1)" [disabled]="l.quantity <= 1"
                                                class="w-6 h-6 flex items-center justify-center rounded border text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                                aria-label="Decrease quantity">
                                            <mat-icon class="icon-size-4">remove</mat-icon>
                                        </button>
                                        <input type="number" min="0" step="0.001" [(ngModel)]="l.quantity"
                                               class="w-16 border rounded px-1 py-0.5 text-right tabular-nums" />
                                        <button type="button" (click)="nudgeQty(l, 1)"
                                                class="w-6 h-6 flex items-center justify-center rounded border text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                aria-label="Increase quantity">
                                            <mat-icon class="icon-size-4">add</mat-icon>
                                        </button>
                                    </div>
                                </td></ng-container>
                            <ng-container matColumnDef="cost"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</span></th>
                                <td mat-cell *matCellDef="let l" class="!text-right">
                                    <input type="number" min="0" step="0.01" [(ngModel)]="l.unitCost"
                                           class="w-24 border rounded px-1 py-0.5 text-right tabular-nums" />
                                </td></ng-container>
                            <ng-container matColumnDef="lineTotal"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Line Total</span></th>
                                <td mat-cell *matCellDef="let l" class="!text-right font-semibold tabular-nums">{{ (l.quantity * l.unitCost) | number:'1.2-2' }}</td></ng-container>
                            <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef class="pr-6"></th>
                                <td mat-cell *matCellDef="let l; let i = index" class="pr-6 !text-right">
                                    <button mat-icon-button class="text-red-600" (click)="removeLine(i)" matTooltip="Remove"><mat-icon class="icon-size-5">delete</mat-icon></button>
                                </td></ng-container>
                            <tr mat-header-row *matHeaderRowDef="['name','qty','cost','lineTotal','actions']" class="bg-gray-50 dark:bg-gray-700"></tr>
                            <tr mat-row *matRowDef="let row; columns: ['name','qty','cost','lineTotal','actions']"></tr>
                        </table>
                        <div *ngIf="lines().length === 0" class="p-8 text-center text-sm text-gray-500">No lines yet — search for a product above.</div>
                    </div>
                </div>

                <!-- Summary -->
                <div class="flex flex-col gap-6">
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
                        <div class="flex items-center space-x-3 mb-4">
                            <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center"><mat-icon class="text-emerald-600 dark:text-emerald-400 text-lg">summarize</mat-icon></div>
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Summary</h3>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Lines</span><span class="font-medium">{{ lines().length }}</span></div>
                            <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Total quantity</span><span class="font-medium">{{ totalQty() | number:'1.0-3' }}</span></div>
                            <div class="flex justify-between text-xl font-bold pt-2 border-t border-gray-200 dark:border-gray-700"><span>Total</span><span>{{ total() | number:'1.2-2' }}</span></div>
                        </div>
                        <button mat-flat-button color="primary" class="w-full h-12 rounded-lg shadow-lg mt-4"
                                [disabled]="!canSubmit() || saving"
                                (click)="save()">
                            <mat-icon class="icon-size-5 mr-2">save</mat-icon><span>{{ saving ? 'Saving…' : 'Save Draft' }}</span>
                        </button>
                        <p class="text-xs text-gray-500 mt-2" *ngIf="!canSubmit()">{{ disabledReason() }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class PurchaseOrderFormComponent implements OnInit {
    private readonly api = inject(PurchaseOrdersService);
    private readonly suppliersApi = inject(SuppliersService);
    private readonly outletsApi = inject(OutletsService);
    private readonly productsApi = inject(ProductsService);
    private readonly router = inject(Router);

    outlets = signal<OutletDto[]>([]);
    suppliers = signal<SupplierDto[]>([]);
    products = signal<ProductDto[]>([]);
    lines = signal<POLineDraft[]>([]);

    outletId: string | null = null;
    supplierId: string | null = null;
    supplierSearch: any = '';
    expectedDate: Date | null = null;
    notes = '';
    saving = false;

    productSearch: any = '';

    /** Active suppliers, filtered by the current search text (name or tax ID, case-insensitive). */
    supplierOptions(): SupplierDto[] {
        const q = (typeof this.supplierSearch === 'string' ? this.supplierSearch : '').trim().toLowerCase();
        const list = this.suppliers().filter(s => s.isActive);
        if (!q) return list.slice(0, 30);
        return list
            .filter(s => s.name.toLowerCase().includes(q) || (s.taxId ?? '').toLowerCase().includes(q))
            .slice(0, 30);
    }

    displaySupplier = (s: SupplierDto | string | null): string => {
        if (!s) return '';
        if (typeof s === 'string') return s;
        return s.name;
    };

    onSupplierPicked(s: SupplierDto): void {
        if (!s) return;
        this.supplierId = s.id;
        this.supplierSearch = s; // displayWith renders the name
    }

    /**
     * If the user erased the field or typed something that no longer matches
     * a real supplier, drop the bound id so canSubmit() stays honest. Without
     * this, a mistyped name would still submit with the previously-picked id.
     */
    resetSupplierIfClearedOrUnselected(): void {
        const ss = this.supplierSearch;
        if (!ss || ss === '') {
            this.supplierId = null;
            return;
        }
        if (typeof ss === 'string') {
            const match = this.suppliers().find(s => s.name.toLowerCase() === ss.trim().toLowerCase());
            this.supplierId = match?.id ?? null;
            if (match) this.supplierSearch = match;
        }
    }

    clearSupplier(input: HTMLInputElement): void {
        this.supplierId = null;
        this.supplierSearch = '';
        input.value = '';
        input.focus();
    }

    productOptions(): ProductDto[] {
        const q = (typeof this.productSearch === 'string' ? this.productSearch : '').trim().toLowerCase();
        const addedIds = new Set(this.lines().map(l => l.productId));
        // Hide already-added products from the dropdown. The badge on the
        // section header surfaces what's already in the cart; the table below
        // shows the lines themselves. Filtering here avoids Material's
        // mdc-list-item--selected double-tick on the last-picked option.
        const base = this.products().filter(p => p.isActive && !addedIds.has(p.id));
        if (!q) return base.slice(0, 30);
        return base
            .filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
            .slice(0, 30);
    }

    total = computed(() => this.lines().reduce((s, l) => s + l.quantity * l.unitCost, 0));
    totalQty = computed(() => this.lines().reduce((s, l) => s + (Number(l.quantity) || 0), 0));

    canSubmit(): boolean {
        return !!this.outletId && !!this.supplierId
            && this.lines().length > 0
            && this.lines().every(l => l.quantity > 0 && l.unitCost >= 0);
    }

    disabledReason(): string {
        if (!this.outletId) return 'Pick an outlet.';
        if (!this.supplierId) return 'Pick a supplier.';
        if (this.lines().length === 0) return 'Add at least one line.';
        if (this.lines().some(l => l.quantity <= 0)) return 'All line quantities must be greater than zero.';
        return '';
    }

    ngOnInit(): void {
        this.outletsApi.getAll().subscribe(o => {
            this.outlets.set(o);
            if (o.length > 0 && !this.outletId) this.outletId = o[0].id;
        });
        this.suppliersApi.getAll().subscribe(s => this.suppliers.set(s.filter(x => x.isActive)));
        this.productsApi.getAll({ isActive: true }).subscribe(p => this.products.set(p));
    }

    displayProduct = (p: ProductDto | string | null): string => {
        if (!p) return '';
        if (typeof p === 'string') return p;
        return `${p.name} (${p.sku})`;
    };

    addLine(p: ProductDto): void {
        if (!p) return;
        if (this.lines().some(l => l.productId === p.id)) {
            this.productSearch = '';
            return;
        }
        this.lines.set([
            ...this.lines(),
            { productId: p.id, productName: p.name, sku: p.sku, quantity: 1, unitCost: p.costPrice },
        ]);
        this.productSearch = '';
    }

    /**
     * Mat-autocomplete writes the selected option's value (a ProductDto) into
     * the bound ngModel before our handler fires; that flips the input through
     * `displayWith` and renders "Phone XYZ (SKU)". Simply setting
     * `productSearch = ''` in addLine() doesn't clear the rendered DOM value
     * reliably — we also have to flush the native input and queue the reset
     * past Angular Material's own state update. This matches the POS pattern
     * of clearing the search field after each add so the buyer can type the
     * next product immediately.
     */
    onProductPicked(p: ProductDto, input: HTMLInputElement): void {
        this.addLine(p);
        // Defer past mat-autocomplete's internal write so our reset wins.
        Promise.resolve().then(() => {
            this.productSearch = '';
            input.value = '';
            input.focus();
        });
    }

    removeLine(i: number): void {
        const arr = [...this.lines()];
        arr.splice(i, 1);
        this.lines.set(arr);
    }

    nudgeQty(line: POLineDraft, delta: number): void {
        const next = Math.max(0, Number(line.quantity || 0) + delta);
        line.quantity = next;
        // Trigger signal change so totals recompute
        this.lines.set([...this.lines()]);
    }

    save(): void {
        if (!this.canSubmit()) return;
        this.saving = true;
        const linesPayload: CreatePurchaseOrderLine[] = this.lines().map(l => ({
            productId: l.productId,
            quantity: Number(l.quantity),
            unitCost: Number(l.unitCost),
        }));
        const expected = this.expectedDate ? this.expectedDate.toISOString() : undefined;
        this.api.create({
            outletId: this.outletId!,
            supplierId: this.supplierId!,
            expectedDeliveryDate: expected,
            lines: linesPayload,
            notes: this.notes || undefined,
        }).subscribe({
            next: id => { this.saving = false; this.router.navigate(['/purchase-orders', id]); },
            error: () => { this.saving = false; },
        });
    }
}
