import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GoodsReceiptsService, PurchaseOrdersService } from 'app/core/purchasing/purchasing.service';
import { CreateGoodsReceiptLine, PurchaseOrderDto } from 'app/core/purchasing/purchasing.types';

interface GRLineDraft {
    purchaseOrderItemId: string;
    productName: string;
    sku: string;
    outstanding: number;
    unitCost: number;
    quantityReceived: number;
    overrideUnitCost: number | null;
    serialsText: string;
    batchNumber: string;
    expiryDate: Date | null;
}

@Component({
    selector: 'app-goods-receipt-form',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatTableModule, MatTooltipModule, MatDatepickerModule, MatNativeDateModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl shadow-lg"><mat-icon class="text-white">local_shipping</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Receive Goods</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400" *ngIf="po(); else hdrLoading">Against PO <span class="font-mono">{{ po()?.poNumber }}</span></p>
                    <ng-template #hdrLoading><p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Loading PO…</p></ng-template>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <button mat-stroked-button class="h-12 px-6 rounded-lg" [routerLink]="['/purchase-orders', poId]"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>Back to PO</span></button>
            </div>
        </div>

        @if (po(); as p) {
            <div class="flex-auto p-4 sm:p-6">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 flex flex-col gap-6">
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                                <div class="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center"><mat-icon class="text-violet-600 dark:text-violet-400 text-lg">inventory_2</mat-icon></div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Items to Receive</h3>
                                <span class="ml-auto text-xs text-gray-500">Set received qty per line. Optional batch / expiry / serials.</span>
                            </div>

                            <div class="divide-y divide-gray-200 dark:divide-gray-700">
                                <div *ngFor="let l of lines()" class="p-6">
                                    <div class="flex items-center justify-between mb-3">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ l.productName }}</span>
                                            <span class="text-xs text-gray-500 font-mono">{{ l.sku }} · outstanding {{ l.outstanding | number:'1.0-3' }} &#64; {{ l.unitCost | number:'1.2-2' }}</span>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                        <mat-form-field class="sm:col-span-3 w-full" appearance="outline" subscriptSizing="dynamic">
                                            <mat-label>Received</mat-label>
                                            <input matInput type="number" min="0" step="0.001" [max]="l.outstanding" [(ngModel)]="l.quantityReceived">
                                        </mat-form-field>
                                        <mat-form-field class="sm:col-span-3 w-full" appearance="outline" subscriptSizing="dynamic">
                                            <mat-label>Override unit cost</mat-label>
                                            <input matInput type="number" min="0" step="0.01" [(ngModel)]="l.overrideUnitCost">
                                        </mat-form-field>
                                        <mat-form-field class="sm:col-span-3 w-full" appearance="outline" subscriptSizing="dynamic">
                                            <mat-label>Batch number</mat-label>
                                            <input matInput [(ngModel)]="l.batchNumber">
                                        </mat-form-field>
                                        <mat-form-field class="sm:col-span-3 w-full" appearance="outline" subscriptSizing="dynamic">
                                            <mat-label>Expiry date</mat-label>
                                            <input matInput [matDatepicker]="exp" [(ngModel)]="l.expiryDate">
                                            <mat-datepicker-toggle matIconSuffix [for]="exp"></mat-datepicker-toggle>
                                            <mat-datepicker #exp></mat-datepicker>
                                        </mat-form-field>
                                        <mat-form-field class="sm:col-span-12 w-full" appearance="outline" subscriptSizing="dynamic">
                                            <mat-label>Serial numbers (one per line, optional)</mat-label>
                                            <textarea matInput rows="2" [(ngModel)]="l.serialsText" placeholder="SN001&#10;SN002"></textarea>
                                        </mat-form-field>
                                    </div>
                                </div>
                            </div>
                            <div *ngIf="lines().length === 0" class="p-8 text-center text-sm text-gray-500">All lines on this PO have been fully received.</div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-6">
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
                            <div class="flex items-center space-x-3 mb-4">
                                <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center"><mat-icon class="text-emerald-600 dark:text-emerald-400 text-lg">summarize</mat-icon></div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Receipt Summary</h3>
                            </div>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Lines being received</span><span class="font-medium">{{ activeLineCount() }}</span></div>
                                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Total quantity</span><span class="font-medium">{{ totalQty() | number:'1.0-3' }}</span></div>
                            </div>
                            <mat-form-field appearance="outline" class="w-full mt-4">
                                <mat-label>Notes</mat-label>
                                <textarea matInput rows="3" [(ngModel)]="notes"></textarea>
                            </mat-form-field>
                            <button mat-flat-button color="primary" class="w-full h-12 rounded-lg shadow-lg mt-2"
                                    [disabled]="!canSubmit() || saving"
                                    (click)="save()">
                                <mat-icon class="icon-size-5 mr-2">check_circle</mat-icon><span>{{ saving ? 'Saving…' : 'Receive Goods' }}</span>
                            </button>
                            <p class="text-xs text-gray-500 mt-2" *ngIf="!canSubmit()">{{ disabledReason() }}</p>
                        </div>
                    </div>
                </div>
            </div>
        }
    </div>
</div>
    `,
})
export class GoodsReceiptFormComponent implements OnInit {
    private readonly api = inject(GoodsReceiptsService);
    private readonly poApi = inject(PurchaseOrdersService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    poId!: string;
    po = signal<PurchaseOrderDto | null>(null);
    lines = signal<GRLineDraft[]>([]);
    notes = '';
    saving = false;

    activeLineCount = computed(() => this.lines().filter(l => l.quantityReceived > 0).length);
    totalQty = computed(() => this.lines().reduce((s, l) => s + (Number(l.quantityReceived) || 0), 0));

    canSubmit = computed(() => {
        const active = this.lines().filter(l => l.quantityReceived > 0);
        if (active.length === 0) return false;
        return active.every(l => l.quantityReceived <= l.outstanding);
    });

    disabledReason(): string {
        if (this.activeLineCount() === 0) return 'Set received quantity on at least one line.';
        if (this.lines().some(l => l.quantityReceived > l.outstanding))
            return 'Some lines exceed outstanding quantity.';
        return '';
    }

    ngOnInit(): void {
        this.poId = this.route.snapshot.paramMap.get('poId')!;
        this.poApi.get(this.poId).subscribe(p => {
            this.po.set(p);
            this.lines.set(
                p.items
                    .filter(i => i.quantityOutstanding > 0)
                    .map<GRLineDraft>(i => ({
                        purchaseOrderItemId: i.id,
                        productName: i.productName,
                        sku: i.sku,
                        outstanding: i.quantityOutstanding,
                        unitCost: i.unitCost,
                        quantityReceived: i.quantityOutstanding,
                        overrideUnitCost: null,
                        serialsText: '',
                        batchNumber: '',
                        expiryDate: null,
                    }))
            );
        });
    }

    save(): void {
        if (!this.canSubmit()) return;
        this.saving = true;
        const payload: CreateGoodsReceiptLine[] = this.lines()
            .filter(l => l.quantityReceived > 0)
            .map(l => {
                const serials = l.serialsText
                    .split(/\r?\n/)
                    .map(s => s.trim())
                    .filter(s => s.length > 0);
                return {
                    purchaseOrderItemId: l.purchaseOrderItemId,
                    quantityReceived: Number(l.quantityReceived),
                    unitCost: l.overrideUnitCost != null && Number(l.overrideUnitCost) >= 0
                        ? Number(l.overrideUnitCost)
                        : undefined,
                    serialNumbers: serials.length > 0 ? serials : undefined,
                    batchNumber: l.batchNumber?.trim() || undefined,
                    expiryDate: l.expiryDate ? l.expiryDate.toISOString() : undefined,
                };
            });
        this.api.create({
            purchaseOrderId: this.poId,
            lines: payload,
            notes: this.notes || undefined,
        }).subscribe({
            next: id => { this.saving = false; this.router.navigate(['/goods-receipts', id]); },
            error: () => { this.saving = false; },
        });
    }
}
