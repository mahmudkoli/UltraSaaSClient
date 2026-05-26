import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@ngneat/transloco';
import { forkJoin } from 'rxjs';
import { ProductsService } from 'app/core/catalog/catalog.service';
import { ProductDto } from 'app/core/catalog/catalog.types';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletDto } from 'app/core/outlets/outlets.types';

export interface PricingDialogData {
    product: ProductDto;
}

interface OutletPriceRow {
    outletId: string;
    outletName: string;
    outletCode: string;
    overridePrice: number | null;   // null = no override (uses base)
    isActive: boolean;
    dirty: boolean;
}

@Component({
    selector: 'app-product-pricing-dialog',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule,
        MatIconModule, MatInputModule, MatProgressSpinnerModule,
        TranslocoModule,
    ],
    template: `
<div class="p-1">
    <div class="flex items-center space-x-3 px-4 pt-4 pb-2">
        <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow">
            <mat-icon class="text-white">price_change</mat-icon>
        </div>
        <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'CATALOG.PRODUCTS.PRICING.TITLE' | transloco }}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ 'CATALOG.PRODUCTS.PRICING.SUBTITLE' | transloco:{ name: data.product.name, price: (data.product.sellingPrice | number:'1.2-2') } }}</p>
        </div>
    </div>
    <mat-dialog-content class="!p-4">
        @if (loading()) {
            <div class="flex items-center justify-center py-8"><mat-spinner [diameter]="32"></mat-spinner></div>
        } @else {
            <p class="text-xs text-gray-500 mb-3">{{ 'CATALOG.PRODUCTS.PRICING.INTRO' | transloco }}</p>
            <div class="space-y-2">
                <div *ngFor="let r of rows()" class="grid grid-cols-12 items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div class="col-span-5 flex flex-col">
                        <span class="text-sm font-medium">{{ r.outletName }}</span>
                        <span class="text-xs text-gray-500 font-mono">{{ r.outletCode }}</span>
                    </div>
                    <mat-form-field class="col-span-4" appearance="outline" subscriptSizing="dynamic">
                        <mat-label>{{ 'CATALOG.PRODUCTS.PRICING.OVERRIDE_LABEL' | transloco }}</mat-label>
                        <input matInput type="number" min="0" step="0.01" [(ngModel)]="r.overridePrice" (ngModelChange)="r.dirty = true">
                    </mat-form-field>
                    <mat-checkbox class="col-span-2" [(ngModel)]="r.isActive" (ngModelChange)="r.dirty = true">{{ 'CATALOG.PRODUCTS.PRICING.ACTIVE_LABEL' | transloco }}</mat-checkbox>
                    <button class="col-span-1" mat-icon-button (click)="clear(r)" [matTooltip]="'CATALOG.PRODUCTS.PRICING.CLEAR_TOOLTIP' | transloco" *ngIf="r.overridePrice !== null">
                        <mat-icon class="icon-size-5 text-red-600">delete</mat-icon>
                    </button>
                </div>
                <p *ngIf="rows().length === 0" class="text-sm text-gray-500 py-4 text-center">{{ 'CATALOG.PRODUCTS.PRICING.NO_OUTLETS' | transloco }}</p>
            </div>
        }
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!px-4 !pb-4">
        <button mat-button (click)="close()" [disabled]="saving()">{{ 'COMMON.CANCEL' | transloco }}</button>
        <button mat-flat-button color="primary" (click)="save()" [disabled]="loading() || saving()">
            <mat-icon class="icon-size-5 mr-2">save</mat-icon>{{ (saving() ? 'CATALOG.PRODUCTS.PRICING.SAVING' : 'COMMON.SAVE') | transloco }}
        </button>
    </mat-dialog-actions>
</div>
    `,
})
export class ProductPricingDialogComponent implements OnInit {
    private readonly productsApi = inject(ProductsService);
    private readonly outletsApi = inject(OutletsService);
    private readonly dialogRef = inject(MatDialogRef<ProductPricingDialogComponent>);

    rows = signal<OutletPriceRow[]>([]);
    loading = signal(true);
    saving = signal(false);

    constructor(@Inject(MAT_DIALOG_DATA) public data: PricingDialogData) {}

    ngOnInit(): void {
        forkJoin({
            outlets: this.outletsApi.getAll(),
            prices: this.productsApi.getPrices(this.data.product.id),
        }).subscribe({
            next: ({ outlets, prices }) => {
                const overrideMap = new Map(prices.map(p => [p.outletId, p]));
                this.rows.set((outlets ?? []).map<OutletPriceRow>(o => {
                    const ov = overrideMap.get(o.id);
                    return {
                        outletId: o.id,
                        outletName: o.name,
                        outletCode: o.code,
                        overridePrice: ov ? ov.sellingPrice : null,
                        isActive: ov ? ov.isActive : true,
                        dirty: false,
                    };
                }));
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    clear(r: OutletPriceRow): void {
        r.overridePrice = null;
        r.dirty = true;
    }

    save(): void {
        this.saving.set(true);
        const dirty = this.rows().filter(r => r.dirty);
        if (dirty.length === 0) { this.saving.set(false); this.dialogRef.close(false); return; }

        let pending = dirty.length;
        const tick = () => { if (--pending === 0) { this.saving.set(false); this.dialogRef.close(true); } };

        for (const r of dirty) {
            if (r.overridePrice == null) {
                this.productsApi.removePrice(this.data.product.id, r.outletId).subscribe({ next: tick, error: tick });
            } else {
                this.productsApi.setPrice(this.data.product.id, r.outletId, {
                    productId: this.data.product.id,
                    outletId: r.outletId,
                    sellingPrice: Number(r.overridePrice),
                    isActive: r.isActive,
                }).subscribe({ next: tick, error: tick });
            }
        }
    }

    close(): void { this.dialogRef.close(false); }
}
