import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BarcodeLabelService, LabelFormat } from './barcode-label.service';
import { ProductDto } from 'app/core/catalog/catalog.types';

export interface PrintLabelsDialogData {
    /** Single-product flavor — kept for callers that don't need batch select. */
    product?: ProductDto;
    /** Bulk flavor — N products with one shared qty per product. Takes priority over `product`. */
    products?: ProductDto[];
    /** Optional currency prefix to render before the price (e.g. "৳", "$"). */
    currencyPrefix?: string;
}

/**
 * Quantity + format picker dialog. Accepts either a single product or an array
 * (bulk select on the catalog list). One shared quantity is applied to every
 * selected product — keeps the dialog simple; per-row qty override can come
 * later if anyone asks.
 */
@Component({
    selector: 'app-print-labels-dialog',
    standalone: true,
    imports: [
        CommonModule, FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule,
        MatIconModule, MatInputModule, MatRadioModule, MatTooltipModule,
    ],
    template: `
        <div class="flex items-center gap-3 px-6 pt-5 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <mat-icon class="text-white">qr_code_2</mat-icon>
            </div>
            <div class="flex flex-col">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Print barcode labels</h2>
                @if (products().length === 1) {
                    <p class="text-xs text-gray-500">{{ products()[0].name }} · {{ products()[0].sku }}</p>
                } @else {
                    <p class="text-xs text-gray-500">{{ products().length }} products selected</p>
                }
            </div>
        </div>

        <div class="px-6 py-4 space-y-4 min-w-[460px]">
            <mat-form-field class="w-full" appearance="outline">
                <mat-label>Quantity per product</mat-label>
                <input #qtyInput matInput type="number" min="1" max="500"
                       [value]="quantity"
                       (input)="onQtyInput($event)"
                       (blur)="onQtyInput($event)">
                <mat-icon matSuffix>tag</mat-icon>
                <mat-hint>{{ quantity }} label{{ quantity === 1 ? '' : 's' }} × {{ products().length }} product{{ products().length === 1 ? '' : 's' }} = {{ totalLabels() }} total. Max 500 per product.</mat-hint>
            </mat-form-field>

            <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <p class="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Paper format</p>
                <mat-radio-group [(ngModel)]="format" class="flex flex-col gap-1">
                    <mat-radio-button value="A4_5x13">
                        <div class="flex flex-col">
                            <span class="text-sm font-medium">A4 sticker sheet (5 × 13 = 65 labels per page)</span>
                            <span class="text-xs text-gray-500">Standard Avery-style adhesive label sheet, ~38 × 21 mm cells.</span>
                        </div>
                    </mat-radio-button>
                    <mat-radio-button value="Thermal_Single">
                        <div class="flex flex-col">
                            <span class="text-sm font-medium">Thermal label printer (50 × 30 mm)</span>
                            <span class="text-xs text-gray-500">One label per "page" — for dedicated label printers (Zebra, TSC, Argox).</span>
                        </div>
                    </mat-radio-button>
                </mat-radio-group>
            </div>

            @if (products().length === 1) {
                <div class="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3">
                    <p class="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Label content</p>
                    <p class="text-sm text-gray-700 dark:text-gray-200">{{ products()[0].name }}</p>
                    <p class="text-xs text-gray-500 font-mono">{{ products()[0].sku }}</p>
                    @if (products()[0].barcode) {
                        <p class="text-xs text-gray-500">Barcode: <span class="font-mono">{{ products()[0].barcode }}</span></p>
                    } @else {
                        <p class="text-xs text-gray-500">Barcode: <span class="font-mono">{{ products()[0].sku }}</span> <span class="text-amber-600">(SKU used — no manufacturer barcode set)</span></p>
                    }
                    @if (products()[0].sellingPrice != null) {
                        <p class="text-sm font-semibold mt-1">{{ data.currencyPrefix ?? '' }}{{ products()[0].sellingPrice | number:'1.2-2' }}</p>
                    }
                </div>
            } @else {
                <div class="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3">
                    <p class="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Selected products</p>
                    <div class="max-h-40 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                        @for (p of products(); track p.id) {
                            <div class="flex items-center gap-2 py-1.5 text-xs">
                                <span class="flex-1 truncate text-gray-700 dark:text-gray-200">{{ p.name }}</span>
                                <span class="font-mono text-gray-500">{{ p.sku }}</span>
                                @if (!p.barcode) {
                                    <mat-icon class="icon-size-4 text-amber-600" matTooltip="No manufacturer barcode — SKU will be used">info</mat-icon>
                                }
                            </div>
                        }
                    </div>
                </div>
            }
        </div>

        <div class="flex items-center justify-end gap-2 px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button mat-button mat-dialog-close>Cancel</button>
            <button mat-flat-button color="primary" (click)="print()"
                    [disabled]="!quantity || quantity < 1 || quantity > 500 || products().length === 0">
                <mat-icon class="icon-size-5 mr-1">print</mat-icon>
                <span>Print {{ totalLabels() }} label{{ totalLabels() === 1 ? '' : 's' }}</span>
            </button>
        </div>
    `,
})
export class PrintLabelsDialogComponent {
    private readonly ref = inject(MatDialogRef<PrintLabelsDialogComponent>);
    private readonly labels = inject(BarcodeLabelService);
    readonly data: PrintLabelsDialogData = inject(MAT_DIALOG_DATA);

    quantity = 1;
    format: LabelFormat = 'A4_5x13';

    /** Resolved product list — bulk array wins over the single-product field. */
    products = signal<ProductDto[]>(this.data.products && this.data.products.length > 0
        ? this.data.products
        : this.data.product ? [this.data.product] : []);

    /** Plain method (not computed) so it re-evaluates on every change detection
     * cycle — `quantity` is a plain ngModel-bound field, not a signal, so a
     * computed() wouldn't track its updates. */
    totalLabels(): number {
        return this.products().length * Math.max(1, Math.min(500, Number(this.quantity) || 1));
    }

    /** HTML <input type="number" max=...> only enforces validity, not the value
     * — users can still type 501. Clamp every keystroke so model + DOM stay
     * in lockstep at 1-500. We mutate input.value directly because Angular's
     * change detection won't repaint a focused number input mid-typing
     * reliably. */
    onQtyInput(e: Event): void {
        const input = e.target as HTMLInputElement;
        const raw = input.value;
        const n = Math.floor(Number(raw));
        let clamped: number;
        if (!Number.isFinite(n) || n < 1) clamped = 1;
        else if (n > 500) clamped = 500;
        else clamped = n;
        if (String(clamped) !== raw) input.value = String(clamped);
        this.quantity = clamped;
    }

    print(): void {
        const ps = this.products();
        if (ps.length === 0) return;
        // Final clamp at the boundary — even if the input handler glitched,
        // never hand the print service a value outside the documented range.
        const safeQty = Math.max(1, Math.min(500, Math.floor(Number(this.quantity)) || 1));
        const items = ps.map(p => ({
            name: p.name,
            code: p.barcode?.trim() || p.sku,
            subtitle: p.barcode ? p.sku : undefined,
            price: p.sellingPrice != null
                ? `${this.data.currencyPrefix ?? ''}${p.sellingPrice.toFixed(2)}`
                : undefined,
        }));
        // Same qty per product — service flattens (item × qty) internally.
        const qtys = ps.map(() => safeQty);
        this.labels.print(items, qtys, this.format);
        this.ref.close(true);
    }
}
