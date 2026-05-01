import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { toOrderBy } from 'app/core/common/pagination.types';
import { AuditTrailDto, AuditTrailService, SearchAuditTrailsRequest } from 'app/core/audit/audit.service';

@Component({
    selector: 'app-audit-trail-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatButtonModule, MatExpansionModule, MatFormFieldModule, MatIconModule,
        MatInputModule, MatPaginatorModule, MatSelectModule, MatSortModule,
        MatTableModule, MatTooltipModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-slate-500 to-gray-700 rounded-xl shadow-lg"><mat-icon class="text-white">history</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Audit Trail</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Append-only ledger of every Create / Update / Delete in the per-tenant DB</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <mat-form-field class="w-full sm:w-auto sm:min-w-44" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Table</mat-label>
                    <mat-select [(ngModel)]="tableFilter" (ngModelChange)="resetAndLoad()">
                        <mat-option [value]="''">All tables</mat-option>
                        @for (t of tables(); track t) {
                            <mat-option [value]="t">{{ t }}</mat-option>
                        }
                    </mat-select>
                </mat-form-field>
                <mat-form-field class="w-full sm:w-auto sm:min-w-44" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Type</mat-label>
                    <mat-select [(ngModel)]="typeFilter" (ngModelChange)="resetAndLoad()">
                        <mat-option value="all">All</mat-option>
                        <mat-option value="Create">Create</mat-option>
                        <mat-option value="Update">Update</mat-option>
                        <mat-option value="Delete">Delete</mat-option>
                    </mat-select>
                </mat-form-field>
            </div>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="relative overflow-x-auto">
                    <table mat-table matSort [dataSource]="rows()" (matSortChange)="onSort($event)" multiTemplateDataRows class="w-full">
                        <ng-container matColumnDef="dateTime"><th mat-header-cell *matHeaderCellDef mat-sort-header class="pl-4 sm:pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">When</span></th>
                            <td mat-cell *matCellDef="let r" class="pl-4 sm:pl-6 text-xs">{{ r.dateTime | date:'short' }}</td></ng-container>
                        <ng-container matColumnDef="type"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Action</span></th>
                            <td mat-cell *matCellDef="let r">
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                      [ngClass]="{
                                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': r.type === 'Create',
                                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': r.type === 'Update',
                                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': r.type === 'Delete'
                                      }">{{ r.type }}</span>
                            </td></ng-container>
                        <ng-container matColumnDef="table"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Table</span></th>
                            <td mat-cell *matCellDef="let r" class="font-mono text-xs">{{ r.tableName }}</td></ng-container>
                        <ng-container matColumnDef="user"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">User</span></th>
                            <td mat-cell *matCellDef="let r" class="font-mono text-[10px] text-gray-500">{{ shortGuid(r.userId) }}</td></ng-container>
                        <ng-container matColumnDef="key"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Key</span></th>
                            <td mat-cell *matCellDef="let r" class="font-mono text-[10px] text-gray-500">{{ r.primaryKey | slice:0:60 }}</td></ng-container>
                        <ng-container matColumnDef="changed"><th mat-header-cell *matHeaderCellDef class="pr-4 sm:pr-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Changes</span></th>
                            <td mat-cell *matCellDef="let r" class="pr-4 sm:pr-6">
                                @if (expanded() === r.id) {
                                    <button mat-icon-button (click)="expanded.set(null)"><mat-icon>expand_less</mat-icon></button>
                                } @else {
                                    <button mat-icon-button (click)="expanded.set(r.id)" matTooltip="Show old / new values"><mat-icon>expand_more</mat-icon></button>
                                }
                            </td></ng-container>
                        <ng-container matColumnDef="diff">
                            <td mat-cell *matCellDef="let r" [attr.colspan]="cols.length" class="!p-0 !border-b-0">
                                <div class="p-4 bg-slate-50 dark:bg-slate-900 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <div class="font-semibold text-gray-500 mb-1">Affected columns</div>
                                        <pre class="whitespace-pre-wrap break-all bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">{{ r.affectedColumns || '—' }}</pre>
                                    </div>
                                    <div>
                                        <div class="font-semibold text-gray-500 mb-1">Old values</div>
                                        <pre class="whitespace-pre-wrap break-all bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">{{ pretty(r.oldValues) }}</pre>
                                    </div>
                                    <div>
                                        <div class="font-semibold text-gray-500 mb-1">New values</div>
                                        <pre class="whitespace-pre-wrap break-all bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">{{ pretty(r.newValues) }}</pre>
                                    </div>
                                </div>
                            </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: cols" class="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"></tr>
                        <tr mat-row *matRowDef="let row; columns: ['diff']" [hidden]="expanded() !== row.id"></tr>
                    </table>

                    <mat-paginator
                        [length]="totalCount()"
                        [pageSize]="pageSize"
                        [pageSizeOptions]="[10, 25, 50, 100]"
                        [pageIndex]="pageIndex"
                        (page)="onPage($event)"
                        showFirstLastButtons></mat-paginator>
                </div>

                <div *ngIf="!loading() && rows().length === 0" class="flex flex-col items-center justify-center p-12">
                    <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-6 shadow-lg"><mat-icon class="icon-size-16 text-gray-400">history</mat-icon></div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">No audit entries</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Per-tenant changes are recorded automatically by the EF interceptor.</p>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class AuditTrailListComponent implements OnInit {
    private readonly api = inject(AuditTrailService);

    @ViewChild(MatPaginator) paginator?: MatPaginator;
    @ViewChild(MatSort) sort?: MatSort;

    rows = signal<AuditTrailDto[]>([]);
    tables = signal<string[]>([]);
    loading = signal(true);
    totalCount = signal(0);
    expanded = signal<string | null>(null);

    tableFilter = '';
    typeFilter: 'all' | 'Create' | 'Update' | 'Delete' = 'all';

    pageIndex = 0;
    pageSize = 25;
    private orderBy?: string[];

    cols = ['dateTime', 'type', 'table', 'user', 'key', 'changed'];

    ngOnInit(): void {
        this.api.tables().subscribe(t => this.tables.set(t));
        this.load();
    }

    private buildRequest(): SearchAuditTrailsRequest {
        return {
            pageNumber: this.pageIndex + 1,
            pageSize: this.pageSize,
            orderBy: this.orderBy,
            tableName: this.tableFilter || undefined,
            type: this.typeFilter === 'all' ? undefined : this.typeFilter,
        };
    }

    load(): void {
        this.loading.set(true);
        this.api.search(this.buildRequest()).subscribe({
            next: r => { this.rows.set(r.data); this.totalCount.set(r.totalCount); this.loading.set(false); },
            error: () => this.loading.set(false),
        });
    }

    resetAndLoad(): void { this.pageIndex = 0; this.load(); }
    onPage(e: PageEvent): void { this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load(); }
    onSort(s: Sort): void { this.orderBy = toOrderBy(s.active, s.direction); this.resetAndLoad(); }

    shortGuid(g: string): string { return g ? g.slice(0, 8) : ''; }

    pretty(json?: string): string {
        if (!json) return '—';
        try { return JSON.stringify(JSON.parse(json), null, 2); }
        catch { return json; }
    }
}
