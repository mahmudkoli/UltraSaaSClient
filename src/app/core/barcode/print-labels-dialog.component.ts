import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BarcodeLabelService, LabelFormat } from './barcode-label.service';
import { ProductDto } from 'app/core/catalog/catalog.types';
import { TenantInfoService } from 'app/core/auth/tenant-info.service';

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
        CommonModule, FormsModule, MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule,
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
            <mat-form-field class="w-full" appearance="outline" [class.qty-invalid]="qtyInvalid()">
                <mat-label>Quantity per product</mat-label>
                <input matInput type="number" min="1" max="500" [(ngModel)]="quantity">
                <mat-icon matSuffix [class.text-rose-500]="qtyInvalid()">tag</mat-icon>
                @if (qtyInvalid()) {
                    <mat-hint class="!text-rose-600 dark:!text-rose-400">Enter a number between 1 and 500.</mat-hint>
                } @else {
                    <mat-hint>{{ quantity }} label{{ quantity === 1 ? '' : 's' }} × {{ products().length }} product{{ products().length === 1 ? '' : 's' }} = {{ totalLabels() }} total. Max 500 per product.</mat-hint>
                }
            </mat-form-field>

            <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-1">
                <p class="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Label content</p>
                <mat-checkbox [(ngModel)]="showPrice" color="primary">
                    <span class="text-sm">Show selling price on the label</span>
                </mat-checkbox>
                @if (showPrice && hasOutletPrices()) {
                    <mat-checkbox [(ngModel)]="useOutletPrice" color="primary" class="!ml-6">
                        <span class="text-sm">Use outlet-specific price (when set)</span>
                    </mat-checkbox>
                    <p class="text-xs text-gray-500 ml-6">{{ outletPriceCount() }} of {{ products().length }} selected product{{ products().length === 1 ? ' has' : 's have' }} an outlet override.</p>
                }
                <p class="text-xs text-gray-500 pt-1">Defaults are set in tenant settings; override here for this print only.</p>
            </div>

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
                    @if (showPrice && useOutletPrice && products()[0].isOutletPriceOverride && products()[0].outletSellingPrice != null) {
                        <p class="text-sm font-semibold mt-1 text-emerald-700 dark:text-emerald-400">{{ data.currencyPrefix ?? '' }}{{ products()[0].outletSellingPrice | number:'1.2-2' }} <span class="text-xs font-normal text-gray-500">(outlet)</span></p>
                    } @else if (showPrice && products()[0].isOfferActive && products()[0].offerPrice != null) {
                        <p class="text-sm font-semibold mt-1 text-amber-700 dark:text-amber-400">{{ data.currencyPrefix ?? '' }}{{ products()[0].offerPrice | number:'1.2-2' }} <span class="text-xs font-normal text-gray-500">(offer)</span></p>
                    } @else if (showPrice && products()[0].sellingPrice != null) {
                        <p class="text-sm font-semibold mt-1">{{ data.currencyPrefix ?? '' }}{{ products()[0].sellingPrice | number:'1.2-2' }}</p>
                    } @else {
                        <p class="text-xs text-gray-500 italic mt-1">No price on label</p>
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
                    [disabled]="qtyInvalid() || products().length === 0">
                <mat-icon class="icon-size-5 mr-1">print</mat-icon>
                <span>Print {{ totalLabels() }} label{{ totalLabels() === 1 ? '' : 's' }}</span>
            </button>
        </div>
    `,
    styles: [`
        /* Red outline on the qty mat-form-field when value is out of 1-500.
         * Material's notched-outline is rendered inside the component, so we
         * use ::ng-deep to penetrate the emulated encapsulation barrier. */
        :host ::ng-deep .qty-invalid .mdc-notched-outline__leading,
        :host ::ng-deep .qty-invalid .mdc-notched-outline__notch,
        :host ::ng-deep .qty-invalid .mdc-notched-outline__trailing {
            border-color: rgb(244 63 94) !important; /* tailwind rose-500 */
        }
    `],
})
export class PrintLabelsDialogComponent {
    private readonly ref = inject(MatDialogRef<PrintLabelsDialogComponent>);
    private readonly labels = inject(BarcodeLabelService);
    private readonly tenantInfo = inject(TenantInfoService);
    readonly data: PrintLabelsDialogData = inject(MAT_DIALOG_DATA);

    quantity = 1;
    format: LabelFormat = 'A4_5x13';

    /** Toggles seeded from tenant defaults — user can override per print job.
     * Falls back to true when the tenant info hasn't loaded yet (defensive). */
    showPrice = this.tenantInfo.info()?.showPriceOnLabel ?? true;
    useOutletPrice = this.tenantInfo.info()?.useOutletPriceOnLabel ?? true;

    /** Resolved product list — bulk array wins over the single-product field. */
    products = signal<ProductDto[]>(this.data.products && this.data.products.length > 0
        ? this.data.products
        : this.data.product ? [this.data.product] : []);

    /** True when at least one selected product has an outlet-override price.
     * Hides the "Use outlet price" toggle when nothing in the cart benefits from it. */
    hasOutletPrices(): boolean {
        return this.products().some(p => p.isOutletPriceOverride === true);
    }
    outletPriceCount(): number {
        return this.products().filter(p => p.isOutletPriceOverride === true).length;
    }

    /** Plain method (not computed) so it re-evaluates on every change detection
     * cycle — `quantity` is a plain ngModel-bound field, not a signal, so a
     * computed() wouldn't track its updates. */
    totalLabels(): number {
        return this.products().length * Math.max(1, Math.min(500, Number(this.quantity) || 1));
    }

    /** True when the current quantity is outside 1-500 or non-numeric. Drives
     * the red border + hint and the Print button's disabled state. We never
     * mutate the user's input — they type freely; the UI just surfaces the
     * validity. */
    qtyInvalid(): boolean {
        const n = Number(this.quantity);
        return !Number.isFinite(n) || n < 1 || n > 500;
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
            price: this.priceFor(p),
        }));
        // Same qty per product — service flattens (item × qty) internally.
        const qtys = ps.map(() => safeQty);
        this.labels.print(items, qtys, this.format);
        this.ref.close(true);
    }

    /** Resolve which price (if any) goes on the label for this product.
     * Resolution chain mirrors the server: outlet override > active offer > base.
     *   - showPrice=false → no price line
     *   - useOutletPrice && product has outlet override → outlet price
     *   - product offer is active → offer price
     *   - otherwise → catalog base
     * Returns undefined when no price should render so the label template skips
     * the price block entirely. */
    private priceFor(p: ProductDto): string | undefined {
        if (!this.showPrice) return undefined;
        const prefix = this.data.currencyPrefix ?? '';
        if (this.useOutletPrice && p.isOutletPriceOverride && p.outletSellingPrice != null) {
            return `${prefix}${p.outletSellingPrice.toFixed(2)}`;
        }
        if (p.isOfferActive && p.offerPrice != null) {
            return `${prefix}${p.offerPrice.toFixed(2)}`;
        }
        return p.sellingPrice != null ? `${prefix}${p.sellingPrice.toFixed(2)}` : undefined;
    }
}
