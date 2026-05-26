import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { ProductsService } from 'app/core/catalog/catalog.service';
import { ProductDto } from 'app/core/catalog/catalog.types';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletDto } from 'app/core/outlets/outlets.types';
import { CurrentOutletService } from 'app/core/outlets/current-outlet.service';
import { StockAdjustmentsService } from 'app/core/inventory/inventory.service';
import { StockAdjustmentReason } from 'app/core/inventory/inventory.types';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

@Component({
    selector: 'app-stock-adjustment-form',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatAutocompleteModule, MatButtonModule, MatFormFieldModule, MatIconModule,
        MatInputModule, MatSelectModule, MatSnackBarModule,
        TranslocoModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl shadow-lg"><mat-icon class="text-white">tune</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ 'INVENTORY.ADJUSTMENTS.FORM.TITLE' | transloco }}</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ 'INVENTORY.ADJUSTMENTS.FORM.SUBTITLE' | transloco }}</p>
                </div>
            </div>
            <button mat-stroked-button class="h-12 px-6 rounded-lg" routerLink="/stock-adjustments"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>{{ 'COMMON.CANCEL' | transloco }}</span></button>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6 lg:col-span-2">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <mat-form-field appearance="outline" class="w-full sm:col-span-2" hideRequiredMarker>
                            <mat-label>{{ 'INVENTORY.ADJUSTMENTS.FORM.PRODUCT_LABEL' | transloco }} <span class="text-rose-600">*</span></mat-label>
                            <input matInput [(ngModel)]="productSearch" [matAutocomplete]="productAuto" [placeholder]="'INVENTORY.ADJUSTMENTS.FORM.PRODUCT_PLACEHOLDER' | transloco" required>
                            <mat-autocomplete #productAuto="matAutocomplete" (optionSelected)="onProductPicked($event.option.value)" [displayWith]="displayProduct">
                                @for (p of productOptions(); track p.id) {
                                    <mat-option [value]="p">
                                        <div class="flex justify-between"><span>{{ p.name }}</span><span class="text-xs text-gray-500 font-mono">{{ p.sku }}</span></div>
                                    </mat-option>
                                }
                            </mat-autocomplete>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="w-full" hideRequiredMarker>
                            <mat-label>{{ 'INVENTORY.ADJUSTMENTS.FORM.OUTLET_LABEL' | transloco }} <span class="text-rose-600">*</span></mat-label>
                            <mat-select [(ngModel)]="outletId" required>
                                @for (o of outlets(); track o.id) { <mat-option [value]="o.id">{{ o.name }}</mat-option> }
                            </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="w-full" hideRequiredMarker>
                            <mat-label>{{ 'INVENTORY.ADJUSTMENTS.FORM.REASON_LABEL' | transloco }} <span class="text-rose-600">*</span></mat-label>
                            <mat-select [(ngModel)]="reason" required>
                                <mat-option value="PhysicalCount">{{ 'INVENTORY.ADJUSTMENTS.FORM.REASON_PHYSICAL_COUNT' | transloco }}</mat-option>
                                <mat-option value="Damage">{{ 'INVENTORY.ADJUSTMENTS.FORM.REASON_DAMAGE' | transloco }}</mat-option>
                                <mat-option value="Loss">{{ 'INVENTORY.ADJUSTMENTS.FORM.REASON_LOSS' | transloco }}</mat-option>
                                <mat-option value="Expiry">{{ 'INVENTORY.ADJUSTMENTS.FORM.REASON_EXPIRY' | transloco }}</mat-option>
                                <mat-option value="Correction">{{ 'INVENTORY.ADJUSTMENTS.FORM.REASON_CORRECTION' | transloco }}</mat-option>
                                <mat-option value="OpeningBalance">{{ 'INVENTORY.ADJUSTMENTS.FORM.REASON_OPENING_BALANCE' | transloco }}</mat-option>
                                <mat-option value="Other">{{ 'INVENTORY.ADJUSTMENTS.FORM.REASON_OTHER' | transloco }}</mat-option>
                            </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="w-full" hideRequiredMarker>
                            <mat-label>{{ 'INVENTORY.ADJUSTMENTS.FORM.NEW_QTY_LABEL' | transloco }} <span class="text-rose-600">*</span></mat-label>
                            <input matInput type="number" min="0" step="0.001" [(ngModel)]="newQuantity" required>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="w-full sm:col-span-2">
                            <mat-label>{{ 'INVENTORY.ADJUSTMENTS.FORM.NOTES_LABEL' | transloco }} <span class="text-gray-400 text-xs">{{ 'INVENTORY.ADJUSTMENTS.FORM.OPTIONAL_HINT' | transloco }}</span></mat-label>
                            <textarea matInput rows="2" [(ngModel)]="notes"></textarea>
                        </mat-form-field>
                    </div>
                    <p class="text-xs text-gray-500 mt-2"><span class="text-rose-600">*</span> {{ 'INVENTORY.ADJUSTMENTS.FORM.REQUIRED_HINT' | transloco }}</p>

                    <div class="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button mat-button type="button" routerLink="/stock-adjustments">{{ 'COMMON.CANCEL' | transloco }}</button>
                        <button mat-flat-button color="primary" type="button" class="h-12 px-6 rounded-lg shadow-lg"
                                [disabled]="!canSubmit() || saving"
                                (click)="save()">
                            <mat-icon class="icon-size-5 mr-2">save</mat-icon><span>{{ saving ? ('INVENTORY.ADJUSTMENTS.FORM.SAVING' | transloco) : ('INVENTORY.ADJUSTMENTS.FORM.SAVE_BUTTON' | transloco) }}</span>
                        </button>
                    </div>
                    <p class="text-xs text-gray-500 mt-2" *ngIf="!canSubmit()">{{ disabledReason() }}</p>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class StockAdjustmentFormComponent implements OnInit {
    private readonly api = inject(StockAdjustmentsService);
    private readonly outletsApi = inject(OutletsService);
    private readonly productsApi = inject(ProductsService);
    private readonly currentOutlet = inject(CurrentOutletService);
    private readonly snack = inject(MatSnackBar);
    private readonly router = inject(Router);
    private readonly _transloco = inject(TranslocoService);

    outlets = signal<OutletDto[]>([]);
    products = signal<ProductDto[]>([]);
    productSearch: any = '';
    outletId: string | null = null;
    productId: string | null = null;
    reason: StockAdjustmentReason = 'Correction';
    newQuantity: number | null = null;
    notes = '';
    saving = false;

    productOptions(): ProductDto[] {
        const q = (typeof this.productSearch === 'string' ? this.productSearch : '').trim().toLowerCase();
        const list = this.products().filter(p => p.isActive);
        if (!q) return list.slice(0, 30);
        return list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 30);
    }

    canSubmit(): boolean {
        return !!this.productId && !!this.outletId
            && this.newQuantity != null && this.newQuantity >= 0;
    }

    disabledReason(): string {
        if (!this.productId) return this._transloco.translate('INVENTORY.ADJUSTMENTS.FORM.DISABLED_PICK_PRODUCT');
        if (!this.outletId) return this._transloco.translate('INVENTORY.ADJUSTMENTS.FORM.DISABLED_PICK_OUTLET');
        if (this.newQuantity == null) return this._transloco.translate('INVENTORY.ADJUSTMENTS.FORM.DISABLED_ENTER_QTY');
        if (this.newQuantity < 0) return this._transloco.translate('INVENTORY.ADJUSTMENTS.FORM.DISABLED_NEGATIVE');
        return '';
    }

    ngOnInit(): void {
        this.outletsApi.getAll().subscribe(o => {
            this.outlets.set(o);
            const remembered = this.currentOutlet.outletId();
            this.outletId = (remembered && o.some(x => x.id === remembered)) ? remembered : (o[0]?.id ?? null);
        });
        this.productsApi.getAll({ isActive: true }).subscribe(p => this.products.set(p));
    }

    displayProduct = (p: ProductDto | string | null): string => {
        if (!p) return '';
        if (typeof p === 'string') return p;
        return `${p.name} (${p.sku})`;
    };

    onProductPicked(p: ProductDto): void {
        if (!p) return;
        this.productId = p.id;
        this.productSearch = p;
    }

    save(): void {
        if (!this.canSubmit() || this.productId == null || this.outletId == null) return;
        this.saving = true;
        this.api.create({
            productId: this.productId,
            outletId: this.outletId,
            newQuantity: Number(this.newQuantity),
            reason: this.reason,
            notes: this.notes || undefined,
        }).subscribe({
            next: () => { this.saving = false; this.router.navigate(['/stock-adjustments']); },
            error: err => {
                this.saving = false;
                const msg = err?.error?.exception ?? err?.error?.title ?? err?.message ?? this._transloco.translate('INVENTORY.ADJUSTMENTS.TOAST.FAILED');
                this.snack.open(msg, this._transloco.translate('INVENTORY.ADJUSTMENTS.TOAST.OK'), { duration: 6000 });
            },
        });
    }
}
