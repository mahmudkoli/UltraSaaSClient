import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletDto } from 'app/core/outlets/outlets.types';
import { StockTransfersService } from 'app/core/inventory/inventory.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { StockTransferDto, StockTransferStatus } from 'app/core/inventory/inventory.types';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

@Component({
    selector: 'app-stock-transfer-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatTableModule, TranslocoModule],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        @if (transfer(); as t) {
            <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div class="flex items-center space-x-4">
                    <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg"><mat-icon class="text-white">sync_alt</mat-icon></div>
                    <div>
                        <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ t.transferNumber }}</h2>
                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {{ outletName(t.fromOutletId) }} <mat-icon class="icon-size-4 align-middle">arrow_forward</mat-icon> {{ outletName(t.toOutletId) }}
                            · {{ 'INVENTORY.TRANSFERS.DETAIL.CREATED_PREFIX' | transloco }} {{ t.createdOnUtc | date:'medium' }}
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" [ngClass]="statusClass(t.status)">
                        <mat-icon class="icon-size-4 mr-1">{{ statusIcon(t.status) }}</mat-icon>{{ statusLabel(t.status) | transloco }}
                    </span>
                    <button mat-stroked-button class="h-12 px-6 rounded-lg" routerLink="/stock-transfers"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>{{ 'COMMON.BACK' | transloco }}</span></button>
                </div>
            </div>

            <div class="flex-auto p-4 sm:p-6">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700"><h3 class="text-lg font-semibold">{{ 'INVENTORY.TRANSFERS.DETAIL.ITEMS_SECTION' | transloco }}</h3></div>
                        <table mat-table [dataSource]="t.items" class="w-full">
                            <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef class="pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'INVENTORY.TRANSFERS.DETAIL.COL_SKU' | transloco }}</span></th>
                                <td mat-cell *matCellDef="let i" class="pl-6 font-mono text-xs">{{ i.sku }}</td></ng-container>
                            <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'INVENTORY.TRANSFERS.DETAIL.COL_PRODUCT' | transloco }}</span></th>
                                <td mat-cell *matCellDef="let i">{{ i.productName }}</td></ng-container>
                            <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="pr-6 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'INVENTORY.TRANSFERS.DETAIL.COL_QUANTITY' | transloco }}</span></th>
                                <td mat-cell *matCellDef="let i" class="pr-6 !text-right font-medium">{{ i.quantity | number:'1.0-3' }}</td></ng-container>
                            <tr mat-header-row *matHeaderRowDef="['sku','name','qty']" class="bg-gray-50 dark:bg-gray-700"></tr>
                            <tr mat-row *matRowDef="let row; columns: ['sku','name','qty']"></tr>
                        </table>
                    </div>

                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6 flex flex-col gap-3">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ 'INVENTORY.TRANSFERS.DETAIL.ACTIONS_SECTION' | transloco }}</h3>
                        @if (t.notes) {
                            <p class="text-xs text-gray-500">{{ 'INVENTORY.TRANSFERS.DETAIL.NOTES_PREFIX' | transloco }}: {{ t.notes }}</p>
                        }
                        @if (t.dispatchedOnUtc) { <p class="text-xs text-gray-500">{{ 'INVENTORY.TRANSFERS.DETAIL.DISPATCHED_PREFIX' | transloco }}: {{ t.dispatchedOnUtc | date:'medium' }}</p> }
                        @if (t.receivedOnUtc) { <p class="text-xs text-gray-500">{{ 'INVENTORY.TRANSFERS.DETAIL.RECEIVED_PREFIX' | transloco }}: {{ t.receivedOnUtc | date:'medium' }}</p> }

                        @if (t.status === 'Draft') {
                            <button mat-flat-button color="primary" class="w-full h-12 rounded-lg" [disabled]="busy()" (click)="dispatch()">
                                <mat-icon class="icon-size-5 mr-2">local_shipping</mat-icon><span>{{ 'INVENTORY.TRANSFERS.DETAIL.DISPATCH_BUTTON' | transloco }}</span>
                            </button>
                            <button mat-stroked-button color="warn" class="w-full h-12 rounded-lg" [disabled]="busy()" (click)="cancel()">
                                <mat-icon class="icon-size-5 mr-2">cancel</mat-icon><span>{{ 'INVENTORY.TRANSFERS.DETAIL.CANCEL_BUTTON' | transloco }}</span>
                            </button>
                        }
                        @if (t.status === 'InTransit') {
                            <button mat-flat-button color="primary" class="w-full h-12 rounded-lg" [disabled]="busy()" (click)="receive()">
                                <mat-icon class="icon-size-5 mr-2">inbox_arrow_down</mat-icon><span>{{ 'INVENTORY.TRANSFERS.DETAIL.RECEIVE_BUTTON' | transloco }}</span>
                            </button>
                        }
                        @if (t.status === 'Received' || t.status === 'Cancelled') {
                            <p class="text-sm text-gray-500">{{ 'INVENTORY.TRANSFERS.DETAIL.NO_FURTHER_ACTIONS' | transloco }}</p>
                        }
                    </div>
                </div>
            </div>
        }
    </div>
</div>
    `,
})
export class StockTransferDetailComponent implements OnInit {
    private readonly api = inject(StockTransfersService);
    private readonly outletsApi = inject(OutletsService);
    private readonly route = inject(ActivatedRoute);
    private readonly _confirm = inject(FuseConfirmationService);
    private readonly _transloco = inject(TranslocoService);

    transfer = signal<StockTransferDto | null>(null);
    outlets = signal<OutletDto[]>([]);
    busy = signal(false);

    outletName(id: string): string { return this.outlets().find(o => o.id === id)?.name ?? '—'; }

    statusClass(s: StockTransferStatus): Record<string, boolean> {
        return {
            'bg-gray-100 text-gray-800': s === 'Draft',
            'bg-blue-100 text-blue-800': s === 'InTransit',
            'bg-emerald-100 text-emerald-800': s === 'Received',
            'bg-red-100 text-red-800': s === 'Cancelled',
        };
    }
    statusIcon(s: StockTransferStatus): string {
        return s === 'Received' ? 'check_circle'
             : s === 'Cancelled' ? 'cancel'
             : s === 'InTransit' ? 'local_shipping'
             : 'edit';
    }
    statusLabel(s: StockTransferStatus): string {
        switch (s) {
            case 'Draft': return 'INVENTORY.TRANSFERS.LIST.STATUS_DRAFT';
            case 'InTransit': return 'INVENTORY.TRANSFERS.LIST.STATUS_IN_TRANSIT';
            case 'Received': return 'INVENTORY.TRANSFERS.LIST.STATUS_RECEIVED';
            case 'Cancelled': return 'INVENTORY.TRANSFERS.LIST.STATUS_CANCELLED';
            default: return 'INVENTORY.TRANSFERS.LIST.STATUS_ALL';
        }
    }

    ngOnInit(): void {
        this.outletsApi.getAll().subscribe(o => this.outlets.set(o));
        this.reload();
    }

    private reload(): void {
        const id = this.route.snapshot.paramMap.get('id')!;
        this.api.get(id).subscribe(t => this.transfer.set(t));
    }

    dispatch(): void {
        const t = this.transfer(); if (!t) return;
        this.busy.set(true);
        this.api.dispatch(t.id).subscribe({ next: () => { this.busy.set(false); this.reload(); }, error: () => this.busy.set(false) });
    }
    receive(): void {
        const t = this.transfer(); if (!t) return;
        this.busy.set(true);
        this.api.receive(t.id).subscribe({ next: () => { this.busy.set(false); this.reload(); }, error: () => this.busy.set(false) });
    }
    cancel(): void {
        const t = this.transfer(); if (!t) return;
        this._confirm.open({
            title: this._transloco.translate('INVENTORY.TRANSFERS.DETAIL.CANCEL_TITLE'),
            message: this._transloco.translate('INVENTORY.TRANSFERS.DETAIL.CANCEL_MESSAGE', { number: t.transferNumber }),
            icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
            actions: { confirm: { label: this._transloco.translate('INVENTORY.TRANSFERS.DETAIL.CANCEL_CONFIRM_LABEL'), color: 'warn' }, cancel: { label: this._transloco.translate('INVENTORY.TRANSFERS.DETAIL.KEEP_LABEL') } },
        }).afterClosed().subscribe(result => {
            if (result !== 'confirmed') return;
            this.busy.set(true);
            this.api.cancel(t.id).subscribe({ next: () => { this.busy.set(false); this.reload(); }, error: () => this.busy.set(false) });
        });
    }
}
