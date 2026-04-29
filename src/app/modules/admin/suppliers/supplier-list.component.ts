import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { SuppliersService } from 'app/core/purchasing/purchasing.service';
import { SupplierDto } from 'app/core/purchasing/purchasing.types';

@Component({
    selector: 'app-supplier-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatTableModule, MatTooltipModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div>
    </div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
                    <mat-icon class="text-white">local_shipping</mat-icon>
                </div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Suppliers</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Vendors and wholesalers feeding your inventory</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <mat-form-field class="w-full sm:w-auto sm:min-w-72" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Search suppliers</mat-label>
                    <input matInput [(ngModel)]="search" placeholder="Search by name, contact, phone, email">
                    <mat-icon matSuffix class="text-gray-400">search</mat-icon>
                </mat-form-field>
                <button mat-fab color="primary" routerLink="create" matTooltip="Add new supplier">
                    <mat-icon>add</mat-icon>
                </button>
            </div>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="relative overflow-x-auto">
                    <table mat-table [dataSource]="filtered()" class="w-full">
                        <ng-container matColumnDef="name">
                            <th mat-header-cell *matHeaderCellDef class="pl-4 sm:pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</span></th>
                            <td mat-cell *matCellDef="let r" class="pl-4 sm:pl-6">
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ r.name }}</span>
                                    <span class="text-xs text-gray-500">{{ r.contactPerson || '—' }}</span>
                                </div>
                            </td>
                        </ng-container>
                        <ng-container matColumnDef="phone">
                            <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</span></th>
                            <td mat-cell *matCellDef="let r">{{ r.phone || '—' }}</td>
                        </ng-container>
                        <ng-container matColumnDef="email">
                            <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</span></th>
                            <td mat-cell *matCellDef="let r">{{ r.email || '—' }}</td>
                        </ng-container>
                        <ng-container matColumnDef="active">
                            <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span></th>
                            <td mat-cell *matCellDef="let r">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                      [ngClass]="r.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'">
                                    <mat-icon class="icon-size-4 mr-1">{{ r.isActive ? 'check_circle' : 'cancel' }}</mat-icon>
                                    {{ r.isActive ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                        </ng-container>
                        <ng-container matColumnDef="actions">
                            <th mat-header-cell *matHeaderCellDef class="pr-4 sm:pr-6 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</span></th>
                            <td mat-cell *matCellDef="let r" class="pr-4 sm:pr-6">
                                <div class="flex items-center justify-end space-x-2">
                                    <button mat-icon-button class="text-blue-600" [routerLink]="[r.id]" matTooltip="Edit"><mat-icon class="icon-size-5">edit</mat-icon></button>
                                    <button mat-icon-button class="text-red-600" (click)="remove(r)" matTooltip="Delete"><mat-icon class="icon-size-5">delete</mat-icon></button>
                                </div>
                            </td>
                        </ng-container>
                        <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: cols" class="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"></tr>
                    </table>
                </div>

                <div *ngIf="!loading() && filtered().length === 0" class="flex flex-col items-center justify-center p-12">
                    <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-6 shadow-lg">
                        <mat-icon class="icon-size-16 text-gray-400">local_shipping</mat-icon>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">No suppliers found</h3>
                    <button *ngIf="!search" mat-flat-button color="primary" routerLink="create"><mat-icon class="icon-size-5 mr-2">add_circle</mat-icon><span>Add Supplier</span></button>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class SupplierListComponent implements OnInit {
    private readonly api = inject(SuppliersService);
    rows = signal<SupplierDto[]>([]);
    loading = signal(true);
    search = '';
    cols = ['name', 'phone', 'email', 'active', 'actions'];

    filtered = computed(() => {
        const q = this.search.trim().toLowerCase();
        if (!q) return this.rows();
        return this.rows().filter(r =>
            r.name.toLowerCase().includes(q)
            || (r.contactPerson ?? '').toLowerCase().includes(q)
            || (r.phone ?? '').toLowerCase().includes(q)
            || (r.email ?? '').toLowerCase().includes(q)
        );
    });

    ngOnInit(): void { this.load(); }
    load(): void {
        this.loading.set(true);
        this.api.getAll().subscribe({
            next: d => { this.rows.set(d); this.loading.set(false); },
            error: () => this.loading.set(false),
        });
    }
    remove(r: SupplierDto): void {
        if (!confirm(`Delete supplier "${r.name}"?`)) return;
        this.api.delete(r.id).subscribe(() => this.load());
    }
}
