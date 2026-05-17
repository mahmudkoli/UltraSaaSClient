import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { RolesService } from 'app/core/roles/roles.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { RoleDto } from 'app/core/roles/roles.types';

const BUILT_IN_ROLES = ['Admin', 'Manager', 'InventoryClerk', 'Cashier', 'Basic'];

@Component({
    selector: 'app-role-list',
    standalone: true,
    imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatTableModule, MatTooltipModule],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-xl shadow-lg"><mat-icon class="text-white">manage_accounts</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Roles</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Built-in operational roles and any custom roles your tenant defines</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <button mat-stroked-button class="h-12 px-6 rounded-lg" routerLink="/users"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>Back to Users</span></button>
                <button mat-fab color="primary" routerLink="create" matTooltip="New role"><mat-icon>add</mat-icon></button>
            </div>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="relative overflow-x-auto">
                    <table mat-table [dataSource]="rows()" class="w-full">
                        <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef class="pl-4 sm:pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</span></th>
                            <td mat-cell *matCellDef="let r" class="pl-4 sm:pl-6">
                                <div class="flex items-center space-x-2">
                                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ r.name }}</span>
                                    <span *ngIf="isBuiltIn(r.name)" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200">built-in</span>
                                </div>
                            </td></ng-container>
                        <ng-container matColumnDef="description"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</span></th>
                            <td mat-cell *matCellDef="let r" class="text-sm text-gray-600 dark:text-gray-400">{{ r.description || '—' }}</td></ng-container>
                        <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef class="pr-4 sm:pr-6 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</span></th>
                            <td mat-cell *matCellDef="let r" class="pr-4 sm:pr-6">
                                <div class="flex items-center justify-end space-x-2">
                                    <button mat-icon-button class="text-blue-600" [routerLink]="[r.id, 'permissions']" matTooltip="Edit permissions"><mat-icon class="icon-size-5">tune</mat-icon></button>
                                    <button mat-icon-button class="text-violet-600" [routerLink]="[r.id, 'edit']" [disabled]="r.name === 'Admin'" matTooltip="Rename / describe"><mat-icon class="icon-size-5">edit</mat-icon></button>
                                    <button mat-icon-button class="text-red-600" (click)="remove(r)" [disabled]="isBuiltIn(r.name)" matTooltip="Delete (custom roles only)"><mat-icon class="icon-size-5">delete</mat-icon></button>
                                </div>
                            </td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: cols" class="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"></tr>
                    </table>
                </div>

                <div *ngIf="!loading() && rows().length === 0" class="flex flex-col items-center justify-center p-12">
                    <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-6 shadow-lg"><mat-icon class="icon-size-16 text-gray-400">manage_accounts</mat-icon></div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">No roles yet</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Built-in roles are seeded automatically; create custom roles to refine access.</p>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class RoleListComponent implements OnInit {
    private readonly api = inject(RolesService);
    private readonly router = inject(Router);
    private readonly _confirm = inject(FuseConfirmationService);
    rows = signal<RoleDto[]>([]);
    loading = signal(true);
    cols = ['name', 'description', 'actions'];

    isBuiltIn(name: string): boolean { return BUILT_IN_ROLES.includes(name); }

    ngOnInit(): void { this.load(); }
    load(): void {
        this.loading.set(true);
        this.api.getAll().subscribe({
            next: d => { this.rows.set(d ?? []); this.loading.set(false); },
            error: () => this.loading.set(false),
        });
    }
    remove(r: RoleDto): void {
        if (this.isBuiltIn(r.name)) return;
        this._confirm.open({
            title: 'Delete role',
            message: `Delete role "${r.name}"? Users assigned this role lose its permissions.`,
            icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
            actions: { confirm: { label: 'Delete', color: 'warn' }, cancel: { label: 'Cancel' } },
        }).afterClosed().subscribe(result => {
            if (result !== 'confirmed') return;
            this.api.delete(r.id).subscribe(() => this.load());
        });
    }
}
