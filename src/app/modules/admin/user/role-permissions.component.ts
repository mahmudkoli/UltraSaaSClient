import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { RolesService } from 'app/core/roles/roles.service';
import { PermissionDto, RoleDto } from 'app/core/roles/roles.types';
import { TranslocoModule } from '@ngneat/transloco';

interface PermissionGroup {
    resource: string;
    permissions: PermissionDto[];
}

@Component({
    selector: 'app-role-permissions',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatButtonModule, MatCheckboxModule, MatExpansionModule, MatIconModule,
        MatProgressSpinnerModule,
        TranslocoModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-xl shadow-lg"><mat-icon class="text-white">tune</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ 'ADMIN.ROLE.PERMISSIONS.TITLE' | transloco }}</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400" *ngIf="role(); else hdrLoading">{{ 'ADMIN.ROLE.PERMISSIONS.EDITING' | transloco }} <strong>{{ role()?.name }}</strong></p>
                    <ng-template #hdrLoading><p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ 'ADMIN.ROLE.PERMISSIONS.LOADING' | transloco }}</p></ng-template>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <button mat-stroked-button class="h-12 px-6 rounded-lg" routerLink="/users/roles"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>{{ 'COMMON.BACK' | transloco }}</span></button>
                <button mat-flat-button color="primary" class="h-12 px-6 rounded-lg shadow-lg"
                        [disabled]="loading() || saving() || isAdminRole()"
                        (click)="save()">
                    <mat-icon class="icon-size-5 mr-2">save</mat-icon><span>{{ (saving() ? 'ADMIN.ROLE.PERMISSIONS.SAVING' : 'COMMON.SAVE') | transloco }}</span>
                </button>
            </div>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            @if (loading()) {
                <div class="flex items-center justify-center py-16"><mat-spinner [diameter]="48"></mat-spinner></div>
            } @else if (isAdminRole()) {
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
                    <p class="text-sm text-gray-700 dark:text-gray-300">{{ 'ADMIN.ROLE.PERMISSIONS.ADMIN_NOTE' | transloco }}</p>
                </div>
            } @else {
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                        <div class="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center"><mat-icon class="text-violet-600 dark:text-violet-400 text-lg">lock</mat-icon></div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ 'ADMIN.ROLE.PERMISSIONS.SECTION_AVAILABLE' | transloco }}</h3>
                        <span class="ml-auto text-xs text-gray-500">{{ 'ADMIN.ROLE.PERMISSIONS.SELECTED_OF' | transloco:{ checked: checkedCount(), total: available().length } }}</span>
                    </div>
                    <div class="p-2 sm:p-4">
                        <mat-accordion multi>
                            <mat-expansion-panel *ngFor="let g of grouped()" expanded>
                                <mat-expansion-panel-header>
                                    <mat-panel-title>
                                        <div class="flex items-center space-x-2">
                                            <span class="font-semibold">{{ g.resource }}</span>
                                            <span class="text-xs text-gray-500">{{ groupCheckedCount(g) }}/{{ g.permissions.length }}</span>
                                        </div>
                                    </mat-panel-title>
                                    <mat-panel-description>
                                        <button mat-stroked-button type="button" class="ml-auto !min-h-0 !h-8 !px-2 !text-xs"
                                                (click)="toggleGroup(g, $event)">
                                            {{ (groupCheckedCount(g) === g.permissions.length ? 'ADMIN.ROLE.PERMISSIONS.DESELECT_ALL' : 'ADMIN.ROLE.PERMISSIONS.SELECT_ALL') | transloco }}
                                        </button>
                                    </mat-panel-description>
                                </mat-expansion-panel-header>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                                    <mat-checkbox *ngFor="let p of g.permissions"
                                                  [checked]="isChecked(p.name)"
                                                  (change)="toggle(p.name, $event.checked)"
                                                  class="text-sm">
                                        <div class="flex flex-col">
                                            <span>{{ p.action }} {{ p.resource }}</span>
                                            <span class="text-xs text-gray-500" *ngIf="p.description">{{ p.description }}</span>
                                        </div>
                                    </mat-checkbox>
                                </div>
                            </mat-expansion-panel>
                        </mat-accordion>
                        <p *ngIf="available().length === 0" class="text-sm text-gray-500 p-6 text-center">{{ 'ADMIN.ROLE.PERMISSIONS.EMPTY' | transloco }}</p>
                    </div>
                </div>
            }
        </div>
    </div>
</div>
    `,
})
export class RolePermissionsComponent implements OnInit {
    private readonly api = inject(RolesService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    role = signal<RoleDto | null>(null);
    available = signal<PermissionDto[]>([]);
    selected = signal<Set<string>>(new Set<string>());
    loading = signal(true);
    saving = signal(false);
    roleId = '';

    grouped = computed<PermissionGroup[]>(() => {
        const groups = new Map<string, PermissionDto[]>();
        for (const p of this.available()) {
            const key = p.resource ?? p.category ?? 'Other';
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(p);
        }
        return Array.from(groups.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([resource, permissions]) => ({ resource, permissions }));
    });

    checkedCount = computed(() => this.selected().size);

    isAdminRole(): boolean { return this.role()?.name === 'Admin'; }

    ngOnInit(): void {
        this.roleId = this.route.snapshot.paramMap.get('id') ?? '';
        forkJoin({
            role: this.api.getWithPermissions(this.roleId),
            available: this.api.getAvailablePermissions(),
        }).subscribe({
            next: ({ role, available }) => {
                this.role.set(role);
                this.available.set(available ?? []);
                this.selected.set(new Set<string>(role.permissions ?? []));
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    isChecked(name: string): boolean { return this.selected().has(name); }

    toggle(name: string, checked: boolean): void {
        const next = new Set(this.selected());
        if (checked) next.add(name);
        else next.delete(name);
        this.selected.set(next);
    }

    groupCheckedCount(g: PermissionGroup): number {
        const sel = this.selected();
        return g.permissions.reduce((acc, p) => acc + (sel.has(p.name) ? 1 : 0), 0);
    }

    toggleGroup(g: PermissionGroup, ev: MouseEvent): void {
        ev.stopPropagation();
        const next = new Set(this.selected());
        const all = g.permissions.every(p => next.has(p.name));
        for (const p of g.permissions) {
            if (all) next.delete(p.name); else next.add(p.name);
        }
        this.selected.set(next);
    }

    save(): void {
        if (this.isAdminRole()) return;
        this.saving.set(true);
        this.api.updatePermissions(this.roleId, {
            roleId: this.roleId,
            permissions: Array.from(this.selected()),
        }).subscribe({
            next: () => { this.saving.set(false); this.router.navigate(['/users/roles']); },
            error: () => this.saving.set(false),
        });
    }
}
