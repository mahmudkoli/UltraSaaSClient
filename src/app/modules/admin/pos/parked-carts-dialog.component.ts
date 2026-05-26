import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { ParkedCartsService, ParkedCartDto, RecalledCartDto } from 'app/core/sales/parked-cart.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';

export interface ParkedCartsDialogData { outletId: string; outletName?: string; }

/**
 * POS parked-cart picker. Lists parked carts for the current outlet, lets
 * the cashier recall (returns the full payload to the caller) or discard.
 * Recalls delete the parked record server-side so two cashiers can't
 * finalize the same cart.
 */
@Component({
    selector: 'app-parked-carts-dialog',
    standalone: true,
    imports: [
        CommonModule, FormsModule, MatButtonModule, MatDialogModule,
        MatIconModule, MatTableModule, MatTooltipModule, TranslocoModule,
    ],
    template: `
<h2 mat-dialog-title class="!flex !items-center !gap-2">
    <mat-icon class="text-amber-600">pause_circle</mat-icon>
    <span>{{ 'POS.PARKED.TITLE' | transloco }}</span>
    <span class="ml-auto text-sm text-gray-500" *ngIf="data.outletName">{{ data.outletName }}</span>
</h2>
<mat-dialog-content class="!min-w-[640px] !max-w-[800px]">
    @if (loading()) {
        <div class="p-8 text-center text-gray-400 text-sm">{{ 'POS.PARKED.LOADING' | transloco }}</div>
    } @else if (rows().length === 0) {
        <div class="p-8 text-center">
            <mat-icon class="icon-size-12 text-gray-300 mb-2">pause_circle</mat-icon>
            <div class="text-sm text-gray-500">{{ 'POS.PARKED.EMPTY' | transloco }}</div>
        </div>
    } @else {
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <table mat-table [dataSource]="rows()" class="w-full">
                <ng-container matColumnDef="when"><th mat-header-cell *matHeaderCellDef class="pl-4"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'POS.PARKED.COL_PARKED' | transloco }}</span></th>
                    <td mat-cell *matCellDef="let r" class="pl-4 text-xs">
                        {{ r.parkedAt | date:'short' }}
                        <span class="block text-[10px] text-gray-500">{{ relative(r.parkedAt) }}</span>
                    </td></ng-container>
                <ng-container matColumnDef="who"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'POS.PARKED.COL_CUSTOMER_LABEL' | transloco }}</span></th>
                    <td mat-cell *matCellDef="let r">
                        <div class="flex flex-col">
                            <span class="text-sm font-medium">{{ r.customerName || r.label || ('POS.PARKED.WALK_IN' | transloco) }}</span>
                            <span class="text-xs text-gray-500">{{ r.label && r.customerName ? r.label : (r.customerPhone || '—') }}</span>
                        </div>
                    </td></ng-container>
                <ng-container matColumnDef="items"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'POS.PARKED.COL_ITEMS' | transloco }}</span></th>
                    <td mat-cell *matCellDef="let r" class="!text-right">{{ r.itemCount }}</td></ng-container>
                <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'POS.PARKED.COL_SUBTOTAL' | transloco }}</span></th>
                    <td mat-cell *matCellDef="let r" class="!text-right font-semibold">{{ r.subTotal | number:'1.2-2' }}</td></ng-container>
                <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef class="pr-4 !text-right"></th>
                    <td mat-cell *matCellDef="let r" class="pr-4">
                        <div class="flex items-center justify-end gap-1">
                            <button mat-flat-button color="primary" class="!h-8 !leading-7" (click)="recall(r)">
                                <mat-icon class="icon-size-4 mr-1">play_arrow</mat-icon>{{ 'POS.PARKED.RECALL_BUTTON' | transloco }}
                            </button>
                            <button mat-icon-button class="text-rose-600" (click)="discard(r)" [matTooltip]="'POS.PARKED.DISCARD_TOOLTIP' | transloco">
                                <mat-icon class="icon-size-5">delete</mat-icon>
                            </button>
                        </div>
                    </td></ng-container>
                <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                <tr mat-row *matRowDef="let row; columns: cols" class="hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"></tr>
            </table>
        </div>
    }
</mat-dialog-content>
<mat-dialog-actions class="!justify-end">
    <button mat-button mat-dialog-close>{{ 'COMMON.CLOSE' | transloco }}</button>
</mat-dialog-actions>
    `,
})
export class ParkedCartsDialogComponent implements OnInit {
    private readonly api = inject(ParkedCartsService);
    private readonly dialogRef = inject(MatDialogRef<ParkedCartsDialogComponent, RecalledCartDto>);
    private readonly _confirm = inject(FuseConfirmationService);
    private readonly _transloco = inject(TranslocoService);
    readonly data = inject<ParkedCartsDialogData>(MAT_DIALOG_DATA);

    rows = signal<ParkedCartDto[]>([]);
    loading = signal(true);
    cols = ['when', 'who', 'items', 'total', 'actions'];

    ngOnInit(): void { this.load(); }

    load(): void {
        this.loading.set(true);
        this.api.byOutlet(this.data.outletId).subscribe({
            next: d => { this.rows.set(d); this.loading.set(false); },
            error: () => this.loading.set(false),
        });
    }

    recall(r: ParkedCartDto): void {
        this.api.recall(r.id).subscribe({
            next: payload => this.dialogRef.close(payload),
        });
    }

    discard(r: ParkedCartDto): void {
        const name = r.customerName || r.label || this._transloco.translate('POS.PARKED.WALK_IN');
        this._confirm.open({
            title: this._transloco.translate('POS.PARKED.DISCARD_TITLE'),
            message: this._transloco.translate('POS.PARKED.DISCARD_MESSAGE', { name }),
            icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
            actions: {
                confirm: { label: this._transloco.translate('POS.PARKED.DISCARD_LABEL'), color: 'warn' },
                cancel: { label: this._transloco.translate('POS.PARKED.KEEP_LABEL') },
            },
        }).afterClosed().subscribe(result => {
            if (result !== 'confirmed') return;
            this.api.discard(r.id).subscribe(() => this.load());
        });
    }

    relative(iso: string): string {
        const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
        if (m < 1) return this._transloco.translate('POS.PARKED.REL_JUST_NOW');
        if (m < 60) return this._transloco.translate('POS.PARKED.REL_MINUTES', { m });
        const h = Math.round(m / 60);
        if (h < 24) return this._transloco.translate('POS.PARKED.REL_HOURS', { h });
        const d = Math.round(h / 24);
        return this._transloco.translate('POS.PARKED.REL_DAYS', { d });
    }
}
