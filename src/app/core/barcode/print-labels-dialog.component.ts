import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { BarcodeLabelService, LabelFormat } from './barcode-label.service';
import { ProductDto } from 'app/core/catalog/catalog.types';

export interface PrintLabelsDialogData {
    /** Product to print labels for. */
    product: ProductDto;
    /** Optional currency prefix to render before the price (e.g. "৳", "$"). */
    currencyPrefix?: string;
}

/**
 * Quantity + format picker dialog. Single-product flavor — multi-select
 * batch printing can come later as a separate "Print labels for many" route
 * if anyone asks.
 */
@Component({
    selector: 'app-print-labels-dialog',
    standalone: true,
    imports: [
        CommonModule, FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule,
        MatIconModule, MatInputModule, MatRadioModule,
    ],
    template: `
        <div class="flex items-center gap-3 px-6 pt-5 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <mat-icon class="text-white">qr_code_2</mat-icon>
            </div>
            <div class="flex flex-col">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Print barcode labels</h2>
                <p class="text-xs text-gray-500">{{ data.product.name }} · {{ data.product.sku }}</p>
            </div>
        </div>

        <div class="px-6 py-4 space-y-4 min-w-[460px]">
            <mat-form-field class="w-full" appearance="outline">
                <mat-label>Quantity</mat-label>
                <input matInput type="number" min="1" max="500" [(ngModel)]="quantity">
                <mat-icon matSuffix>tag</mat-icon>
                <mat-hint>How many labels to print for this product. Max 500.</mat-hint>
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

            <div class="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3">
                <p class="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Label content</p>
                <p class="text-sm text-gray-700 dark:text-gray-200">{{ data.product.name }}</p>
                <p class="text-xs text-gray-500 font-mono">{{ data.product.sku }}</p>
                @if (codeText() && codeText() !== data.product.sku) {
                    <p class="text-xs text-gray-500">Barcode: <span class="font-mono">{{ codeText() }}</span></p>
                } @else {
                    <p class="text-xs text-gray-500">Barcode: <span class="font-mono">{{ data.product.sku }}</span> <span class="text-amber-600">(SKU used — no manufacturer barcode set)</span></p>
                }
                @if (data.product.sellingPrice != null) {
                    <p class="text-sm font-semibold mt-1">{{ data.currencyPrefix ?? '' }}{{ data.product.sellingPrice | number:'1.2-2' }}</p>
                }
            </div>
        </div>

        <div class="flex items-center justify-end gap-2 px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button mat-button mat-dialog-close>Cancel</button>
            <button mat-flat-button color="primary" (click)="print()" [disabled]="!quantity || quantity < 1">
                <mat-icon class="icon-size-5 mr-1">print</mat-icon>
                <span>Print {{ quantity }} label{{ quantity === 1 ? '' : 's' }}</span>
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

    /** Code-128 payload — barcode field if set, otherwise fall back to SKU. */
    codeText = (): string => this.data.product.barcode?.trim() || this.data.product.sku;

    print(): void {
        this.labels.print([{
            name: this.data.product.name,
            code: this.codeText(),
            subtitle: this.data.product.barcode ? this.data.product.sku : undefined,
            price: this.data.product.sellingPrice != null
                ? `${this.data.currencyPrefix ?? ''}${this.data.product.sellingPrice.toFixed(2)}`
                : undefined,
        }], [this.quantity], this.format);
        this.ref.close(true);
    }
}
