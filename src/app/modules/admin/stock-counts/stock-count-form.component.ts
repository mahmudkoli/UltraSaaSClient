import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { BrandsService, CategoriesService } from 'app/core/catalog/catalog.service';
import { BrandDto, CategoryDto } from 'app/core/catalog/catalog.types';
import { StockCountsService } from 'app/core/inventory/inventory.service';
import { StockCountScope } from 'app/core/inventory/inventory.types';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletDto } from 'app/core/outlets/outlets.types';
import { CurrentOutletService } from 'app/core/outlets/current-outlet.service';

@Component({
    selector: 'app-stock-count-form',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatButtonModule, MatFormFieldModule, MatIconModule,
        MatInputModule, MatSelectModule, MatSnackBarModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg"><mat-icon class="text-white">fact_check</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Start Cycle Count</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Snapshots system stock at start; you record the floor count next.</p>
                </div>
            </div>
            <button mat-stroked-button class="h-12 px-6 rounded-lg" routerLink="/stock-counts"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>Cancel</span></button>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6 lg:col-span-2">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Outlet</mat-label>
                            <mat-select [(ngModel)]="outletId">
                                @for (o of outlets(); track o.id) { <mat-option [value]="o.id">{{ o.name }}</mat-option> }
                            </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Scope</mat-label>
                            <mat-select [(ngModel)]="scope">
                                <mat-option value="AllProducts">All active products</mat-option>
                                <mat-option value="ByCategory">By category</mat-option>
                                <mat-option value="ByBrand">By brand</mat-option>
                            </mat-select>
                        </mat-form-field>

                        @if (scope === 'ByCategory') {
                            <mat-form-field appearance="outline" class="w-full">
                                <mat-label>Category</mat-label>
                                <mat-select [(ngModel)]="categoryId">
                                    @for (c of categories(); track c.id) { <mat-option [value]="c.id">{{ c.name }}</mat-option> }
                                </mat-select>
                            </mat-form-field>
                        }
                        @if (scope === 'ByBrand') {
                            <mat-form-field appearance="outline" class="w-full">
                                <mat-label>Brand</mat-label>
                                <mat-select [(ngModel)]="brandId">
                                    @for (b of brands(); track b.id) { <mat-option [value]="b.id">{{ b.name }}</mat-option> }
                                </mat-select>
                            </mat-form-field>
                        }

                        <mat-form-field appearance="outline" class="w-full sm:col-span-2">
                            <mat-label>Notes (optional)</mat-label>
                            <textarea matInput rows="2" [(ngModel)]="notes"></textarea>
                        </mat-form-field>
                    </div>

                    <div class="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button mat-button type="button" routerLink="/stock-counts">Cancel</button>
                        <button mat-flat-button color="primary" type="button" class="h-12 px-6 rounded-lg shadow-lg"
                                [disabled]="!canSubmit() || saving"
                                (click)="save()">
                            <mat-icon class="icon-size-5 mr-2">play_arrow</mat-icon><span>{{ saving ? 'Starting…' : 'Start Count' }}</span>
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
export class StockCountFormComponent implements OnInit {
    private readonly api = inject(StockCountsService);
    private readonly outletsApi = inject(OutletsService);
    private readonly categoriesApi = inject(CategoriesService);
    private readonly brandsApi = inject(BrandsService);
    private readonly currentOutlet = inject(CurrentOutletService);
    private readonly snack = inject(MatSnackBar);
    private readonly router = inject(Router);

    outlets = signal<OutletDto[]>([]);
    categories = signal<CategoryDto[]>([]);
    brands = signal<BrandDto[]>([]);

    outletId: string | null = null;
    scope: StockCountScope = 'AllProducts';
    categoryId: string | null = null;
    brandId: string | null = null;
    notes = '';
    saving = false;

    canSubmit(): boolean {
        if (!this.outletId) return false;
        if (this.scope === 'ByCategory' && !this.categoryId) return false;
        if (this.scope === 'ByBrand' && !this.brandId) return false;
        return true;
    }

    disabledReason(): string {
        if (!this.outletId) return 'Pick an outlet.';
        if (this.scope === 'ByCategory' && !this.categoryId) return 'Pick a category.';
        if (this.scope === 'ByBrand' && !this.brandId) return 'Pick a brand.';
        return '';
    }

    ngOnInit(): void {
        this.outletsApi.getAll().subscribe(o => {
            this.outlets.set(o);
            const remembered = this.currentOutlet.outletId();
            this.outletId = (remembered && o.some(x => x.id === remembered)) ? remembered : (o[0]?.id ?? null);
        });
        this.categoriesApi.getAll().subscribe(c => this.categories.set(c));
        this.brandsApi.getAll().subscribe(b => this.brands.set(b));
    }

    save(): void {
        if (!this.canSubmit() || !this.outletId) return;
        this.saving = true;
        this.api.start({
            outletId: this.outletId,
            scope: this.scope,
            categoryId: this.scope === 'ByCategory' ? (this.categoryId ?? undefined) : undefined,
            brandId: this.scope === 'ByBrand' ? (this.brandId ?? undefined) : undefined,
            notes: this.notes || undefined,
        }).subscribe({
            next: id => { this.saving = false; this.router.navigate(['/stock-counts', id]); },
            error: err => {
                this.saving = false;
                const msg = err?.error?.exception ?? err?.error?.title ?? err?.message ?? 'Could not start count';
                this.snack.open(msg, 'OK', { duration: 6000 });
            },
        });
    }
}
