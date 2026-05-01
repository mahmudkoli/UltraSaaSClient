import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { ReceiptPrintService } from 'app/core/sales/receipt-print.service';
import { SalesService } from 'app/core/sales/sales.service';
import { SaleDto } from 'app/core/sales/sales.types';
import { OutletDto } from 'app/core/outlets/outlets.types';

export interface SaleLookupDialogData {
    outletId?: string;
    outletName?: string;
    /** Full outlet DTO when caller has it; used to brand the re-printed receipt. */
    outlet?: OutletDto;
}

/**
 * POS sale lookup. Opens with the most recent finalized sales for the current
 * outlet; cashier can filter by invoice / customer phone / customer name. Each
 * row exposes Print and View actions. Used for "customer needs another copy
 * of the receipt" — the most-frequent post-sale support task.
 */
@Component({
    selector: 'app-sale-lookup-dialog',
    standalone: true,
    imports: [
        CommonModule, FormsModule, MatButtonModule, MatDialogModule,
        MatFormFieldModule, MatIconModule, MatInputModule, MatTableModule, MatTooltipModule,
    ],
    template: `
<h2 mat-dialog-title class="!flex !items-center !gap-2">
    <mat-icon class="text-blue-600">receipt_long</mat-icon>
    <span>Find a sale</span>
</h2>
<mat-dialog-content class="!min-w-[640px] !max-w-[800px]">
    <div class="flex items-center gap-3 mb-3">
        <mat-form-field class="flex-1" appearance="outline" subscriptSizing="dynamic">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="searchChanged.next($event)"
                   placeholder="Invoice / customer name / phone" autofocus>
            <mat-icon matSuffix class="text-gray-400">search</mat-icon>
        </mat-form-field>
    </div>
    <div class="text-xs text-gray-500 mb-2" *ngIf="data.outletName">
        Showing finalized sales for <span class="font-semibold">{{ data.outletName }}</span>.
    </div>

    <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <table mat-table [dataSource]="rows()" class="w-full">
            <ng-container matColumnDef="invoice"><th mat-header-cell *matHeaderCellDef class="pl-4"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</span></th>
                <td mat-cell *matCellDef="let r" class="pl-4 font-mono text-sm">{{ r.invoiceNumber }}</td></ng-container>
            <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</span></th>
                <td mat-cell *matCellDef="let r" class="text-xs">{{ r.saleDate | date:'short' }}</td></ng-container>
            <ng-container matColumnDef="customer"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</span></th>
                <td mat-cell *matCellDef="let r">
                    <div class="flex flex-col">
                        <span class="text-sm">{{ r.customerName || 'Walk-in' }}</span>
                        <span class="text-xs text-gray-500">{{ r.customerPhone || '—' }}</span>
                    </div>
                </td></ng-container>
            <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</span></th>
                <td mat-cell *matCellDef="let r" class="!text-right font-semibold">{{ r.total | number:'1.2-2' }}</td></ng-container>
            <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef class="pr-4 !text-right"></th>
                <td mat-cell *matCellDef="let r" class="pr-4">
                    <div class="flex items-center justify-end gap-1">
                        <button mat-icon-button class="text-blue-600" (click)="reprint(r)" matTooltip="Re-print receipt"><mat-icon class="icon-size-5">print</mat-icon></button>
                        <button mat-icon-button class="text-gray-600" (click)="open(r)" matTooltip="Open sale detail"><mat-icon class="icon-size-5">open_in_new</mat-icon></button>
                    </div>
                </td></ng-container>
            <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
            <tr mat-row *matRowDef="let row; columns: cols" class="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer" (click)="reprint(row)"></tr>
        </table>
        <div *ngIf="!loading() && rows().length === 0" class="p-8 text-center text-gray-500">
            <mat-icon class="icon-size-10 mb-2 text-gray-400">search_off</mat-icon>
            <div class="text-sm">No matching sales.</div>
        </div>
        <div *ngIf="loading()" class="p-8 text-center text-gray-400 text-sm">Loading…</div>
    </div>
</mat-dialog-content>
<mat-dialog-actions class="!justify-end">
    <button mat-button mat-dialog-close>Close</button>
</mat-dialog-actions>
    `,
})
export class SaleLookupDialogComponent implements OnInit {
    private readonly api = inject(SalesService);
    private readonly print = inject(ReceiptPrintService);
    private readonly router = inject(Router);
    readonly data = inject<SaleLookupDialogData>(MAT_DIALOG_DATA);
    private readonly dialogRef = inject(MatDialogRef<SaleLookupDialogComponent>);

    rows = signal<SaleDto[]>([]);
    loading = signal(true);
    search = '';
    cols = ['invoice', 'date', 'customer', 'total', 'actions'];
    searchChanged = new Subject<string>();

    ngOnInit(): void {
        this.searchChanged.pipe(debounceTime(300)).subscribe(() => this.load());
        this.load();
    }

    load(): void {
        this.loading.set(true);
        this.api.search({
            pageNumber: 1,
            pageSize: 25,
            orderBy: ['saleDate Desc'],
            keyword: this.search.trim() || undefined,
            outletId: this.data.outletId,
            status: 'Finalized',
        }).subscribe({
            next: r => { this.rows.set(r.data); this.loading.set(false); },
            error: () => this.loading.set(false),
        });
    }

    reprint(s: SaleDto): void {
        // Re-fetch the full sale to get items + payments, then print.
        // Pass the outlet DTO if we have it so the receipt is fully branded.
        this.api.get(s.id).subscribe(full =>
            this.print.print(full, this.data.outlet ?? this.data.outletName));
    }

    open(s: SaleDto): void {
        this.dialogRef.close();
        this.router.navigate(['/sales', s.id]);
    }
}
