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
import { Router, RouterModule } from '@angular/router';
import { ProductsService } from 'app/core/catalog/catalog.service';
import { ProductDto } from 'app/core/catalog/catalog.types';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletDto } from 'app/core/outlets/outlets.types';
import { StockTransfersService } from 'app/core/inventory/inventory.service';
import { CreateStockTransferLine } from 'app/core/inventory/inventory.types';

interface LineDraft {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
}

@Component({
    selector: 'app-stock-transfer-form',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatAutocompleteModule, MatButtonModule, MatFormFieldModule, MatIconModule,
        MatInputModule, MatSelectModule, MatTableModule, MatTooltipModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg"><mat-icon class="text-white">sync_alt</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">New Stock Transfer</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Move stock from one outlet to another. Saves as Draft — dispatch when ready.</p>
                </div>
            </div>
            <button mat-stroked-button class="h-12 px-6 rounded-lg" routerLink="/stock-transfers"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>Cancel</span></button>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 flex flex-col gap-6">
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Outlets</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <mat-form-field appearance="outline" class="w-full">
                                <mat-label>From outlet</mat-label>
                                <mat-select [(ngModel)]="fromOutletId">
                                    @for (o of outlets(); track o.id) { <mat-option [value]="o.id">{{ o.name }}</mat-option> }
                                </mat-select>
                            </mat-form-field>
                            <mat-form-field appearance="outline" class="w-full">
                                <mat-label>To outlet</mat-label>
                                <mat-select [(ngModel)]="toOutletId">
                                    @for (o of outlets(); track o.id) {
                                        <mat-option [value]="o.id" [disabled]="o.id === fromOutletId">{{ o.name }}</mat-option>
                                    }
                                </mat-select>
                            </mat-form-field>
                            <mat-form-field appearance="outline" class="w-full sm:col-span-2">
                                <mat-label>Notes (optional)</mat-label>
                                <input matInput [(ngModel)]="notes">
                            </mat-form-field>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Items</h3>
                        </div>
                        <div class="px-6 py-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-gray-50 dark:bg-gray-900/40">
                            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="sm:col-span-7 w-full">
                                <mat-label>Add product</mat-label>
                                <input matInput [(ngModel)]="productSearch" [matAutocomplete]="productAuto" placeholder="Search by name or SKU">
                                <mat-autocomplete #productAuto="matAutocomplete" (optionSelected)="addLine($event.option.value)" [displayWith]="displayProduct">
                                    @for (p of productOptions(); track p.id) {
                                        <mat-option [value]="p">
                                            <div class="flex justify-between"><span>{{ p.name }}</span><span class="text-xs text-gray-500 font-mono">{{ p.sku }}</span></div>
                                        </mat-option>
                                    }
                                </mat-autocomplete>
                            </mat-form-field>
                        </div>
                        <table mat-table [dataSource]="lines()" class="w-full">
                            <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef class="pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Product</span></th>
                                <td mat-cell *matCellDef="let l" class="pl-6">
                                    <div class="flex flex-col">
                                        <span class="text-sm font-medium">{{ l.productName }}</span>
                                        <span class="text-xs text-gray-500 font-mono">{{ l.sku }}</span>
                                    </div>
                                </td></ng-container>
                            <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</span></th>
                                <td mat-cell *matCellDef="let l" class="!text-right">
                                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-24">
                                        <input matInput type="number" min="0" step="0.001" [(ngModel)]="l.quantity">
                                    </mat-form-field>
                                </td></ng-container>
                            <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef class="pr-6"></th>
                                <td mat-cell *matCellDef="let l; let i = index" class="pr-6 !text-right">
                                    <button mat-icon-button class="text-red-600" (click)="removeLine(i)" matTooltip="Remove"><mat-icon class="icon-size-5">delete</mat-icon></button>
                                </td></ng-container>
                            <tr mat-header-row *matHeaderRowDef="['name','qty','actions']" class="bg-gray-50 dark:bg-gray-700"></tr>
                            <tr mat-row *matRowDef="let row; columns: ['name','qty','actions']"></tr>
                        </table>
                        <div *ngIf="lines().length === 0" class="p-8 text-center text-sm text-gray-500">No lines yet — search for a product above.</div>
                    </div>
                </div>

                <div class="flex flex-col gap-6">
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Summary</h3>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between"><span class="text-gray-600">Lines</span><span class="font-medium">{{ lines().length }}</span></div>
                            <div class="flex justify-between"><span class="text-gray-600">Total quantity</span><span class="font-medium">{{ totalQty() | number:'1.0-3' }}</span></div>
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
export class StockTransferFormComponent implements OnInit {
    private readonly api = inject(StockTransfersService);
    private readonly outletsApi = inject(OutletsService);
    private readonly productsApi = inject(ProductsService);
    private readonly router = inject(Router);

    outlets = signal<OutletDto[]>([]);
    products = signal<ProductDto[]>([]);
    lines = signal<LineDraft[]>([]);

    fromOutletId: string | null = null;
    toOutletId: string | null = null;
    notes = '';
    saving = false;
    productSearch: any = '';

    productOptions = computed(() => {
        const q = (typeof this.productSearch === 'string' ? this.productSearch : '').trim().toLowerCase();
        const list = this.products().filter(p => p.isActive);
        if (!q) return list.slice(0, 30);
        return list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 30);
    });

    totalQty = computed(() => this.lines().reduce((s, l) => s + (Number(l.quantity) || 0), 0));

    canSubmit = computed(() =>
        !!this.fromOutletId && !!this.toOutletId && this.fromOutletId !== this.toOutletId
        && this.lines().length > 0
        && this.lines().every(l => l.quantity > 0)
    );

    disabledReason(): string {
        if (!this.fromOutletId || !this.toOutletId) return 'Pick both outlets.';
        if (this.fromOutletId === this.toOutletId) return 'From and To must differ.';
        if (this.lines().length === 0) return 'Add at least one line.';
        if (this.lines().some(l => l.quantity <= 0)) return 'All quantities must be greater than zero.';
        return '';
    }

    ngOnInit(): void {
        this.outletsApi.getAll().subscribe(o => {
            this.outlets.set(o);
            if (o.length > 0 && !this.fromOutletId) this.fromOutletId = o[0].id;
            if (o.length > 1 && !this.toOutletId) this.toOutletId = o[1].id;
        });
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
            { productId: p.id, productName: p.name, sku: p.sku, quantity: 1 },
        ]);
        this.productSearch = '';
    }

    removeLine(i: number): void {
        const arr = [...this.lines()];
        arr.splice(i, 1);
        this.lines.set(arr);
    }

    save(): void {
        if (!this.canSubmit()) return;
        this.saving = true;
        const payload: CreateStockTransferLine[] = this.lines().map(l => ({
            productId: l.productId,
            quantity: Number(l.quantity),
        }));
        this.api.create({
            fromOutletId: this.fromOutletId!,
            toOutletId: this.toOutletId!,
            lines: payload,
            notes: this.notes || undefined,
        }).subscribe({
            next: id => { this.saving = false; this.router.navigate(['/stock-transfers', id]); },
            error: () => { this.saving = false; },
        });
    }
}
