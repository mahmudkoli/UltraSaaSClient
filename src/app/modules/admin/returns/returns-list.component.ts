import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { SaleReturnsService } from 'app/core/sales/sales.service';
import { SaleReturnDto } from 'app/core/sales/sales.types';

@Component({
    selector: 'app-returns-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatSelectModule, MatTableModule, MatTooltipModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-rose-500 to-orange-600 rounded-xl shadow-lg"><mat-icon class="text-white">undo</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Sale Returns</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Refunds, restocked items, write-offs</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <mat-form-field class="w-full sm:w-auto sm:min-w-72" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Search returns</mat-label>
                    <input matInput [(ngModel)]="search" placeholder="Return # / invoice / customer">
                    <mat-icon matSuffix class="text-gray-400">search</mat-icon>
                </mat-form-field>
                <mat-form-field class="w-full sm:w-auto sm:min-w-44" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Status</mat-label>
                    <mat-select [(ngModel)]="statusFilter">
                        <mat-option value="all">All Status</mat-option>
                        <mat-option value="Completed">Completed</mat-option>
                        <mat-option value="Voided">Voided</mat-option>
                        <mat-option value="Draft">Draft</mat-option>
                    </mat-select>
                </mat-form-field>
                <button mat-fab color="primary" routerLink="/sales" matTooltip="Find a sale to refund"><mat-icon>search</mat-icon></button>
            </div>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="relative overflow-x-auto">
                    <table mat-table [dataSource]="filtered()" class="w-full">
                        <ng-container matColumnDef="number"><th mat-header-cell *matHeaderCellDef class="pl-4 sm:pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Return #</span></th>
                            <td mat-cell *matCellDef="let r" class="pl-4 sm:pl-6 font-mono text-sm">{{ r.returnNumber }}</td></ng-container>
                        <ng-container matColumnDef="invoice"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</span></th>
                            <td mat-cell *matCellDef="let r" class="font-mono text-xs text-gray-600 dark:text-gray-400">{{ r.originalInvoiceNumber }}</td></ng-container>
                        <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</span></th>
                            <td mat-cell *matCellDef="let r">{{ r.returnDate | date:'short' }}</td></ng-container>
                        <ng-container matColumnDef="customer"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</span></th>
                            <td mat-cell *matCellDef="let r">{{ r.customerName || 'Walk-in' }}</td></ng-container>
                        <ng-container matColumnDef="reason"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</span></th>
                            <td mat-cell *matCellDef="let r">{{ r.reason }}</td></ng-container>
                        <ng-container matColumnDef="items"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Items</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right">{{ r.items.length }}</td></ng-container>
                        <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Refund</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right font-semibold text-rose-600 dark:text-rose-400">{{ r.refundAmount | number:'1.2-2' }}</td></ng-container>
                        <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span></th>
                            <td mat-cell *matCellDef="let r">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                      [ngClass]="{
                                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': r.status === 'Completed',
                                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': r.status === 'Voided',
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': r.status === 'Draft'
                                      }">
                                    <mat-icon class="icon-size-4 mr-1">{{ r.status === 'Completed' ? 'check_circle' : r.status === 'Voided' ? 'cancel' : 'schedule' }}</mat-icon>{{ r.status }}
                                </span>
                            </td></ng-container>
                        <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef class="pr-4 sm:pr-6 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</span></th>
                            <td mat-cell *matCellDef="let r" class="pr-4 sm:pr-6">
                                <div class="flex items-center justify-end space-x-2">
                                    <button mat-icon-button class="text-blue-600" (click)="view(r)" matTooltip="View"><mat-icon class="icon-size-5">visibility</mat-icon></button>
                                </div>
                            </td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: cols" class="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer" (click)="view(row)"></tr>
                    </table>
                </div>

                <div *ngIf="!loading() && filtered().length === 0" class="flex flex-col items-center justify-center p-12">
                    <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-6 shadow-lg"><mat-icon class="icon-size-16 text-gray-400">undo</mat-icon></div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">No returns yet</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Returns are created from a finalized sale. Open a sale and click "Process Return".</p>
                    <button mat-flat-button color="primary" routerLink="/sales"><mat-icon class="icon-size-5 mr-2">receipt_long</mat-icon><span>Browse Sales</span></button>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class ReturnsListComponent implements OnInit {
    private readonly api = inject(SaleReturnsService);
    private readonly router = inject(Router);
    rows = signal<SaleReturnDto[]>([]);
    loading = signal(true);
    search = '';
    statusFilter: 'all' | SaleReturnDto['status'] = 'all';
    cols = ['number', 'invoice', 'date', 'customer', 'reason', 'items', 'total', 'status', 'actions'];

    filtered = computed(() => {
        const q = this.search.trim().toLowerCase();
        return this.rows().filter(r =>
            (this.statusFilter === 'all' || r.status === this.statusFilter)
            && (!q
                || r.returnNumber.toLowerCase().includes(q)
                || r.originalInvoiceNumber.toLowerCase().includes(q)
                || (r.customerName ?? '').toLowerCase().includes(q))
        );
    });

    ngOnInit(): void {
        this.loading.set(true);
        this.api.getAll().subscribe({
            next: d => { this.rows.set(d); this.loading.set(false); },
            error: () => this.loading.set(false),
        });
    }
    view(r: SaleReturnDto): void { this.router.navigate(['/returns', r.id]); }
}
