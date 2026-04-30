import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { PermissionsService } from 'app/core/auth/permissions.service';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { UserService } from 'app/core/user/user.service';
import { UserRoleDto } from 'app/core/user/user.types';

export interface UserRolesDialogData {
    userId: string;
    userName: string;
}

@Component({
    selector: 'app-user-roles-dialog',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatButtonModule, MatCheckboxModule, MatDialogModule, MatIconModule,
        MatProgressSpinnerModule,
    ],
    template: `
<div class="p-1">
    <div class="flex items-center space-x-3 px-4 pt-4 pb-2">
        <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow">
            <mat-icon class="text-white">manage_accounts</mat-icon>
        </div>
        <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Manage Roles</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ data.userName }}</p>
        </div>
    </div>
    <mat-dialog-content class="!p-4">
        @if (loading()) {
            <div class="flex items-center justify-center py-8">
                <mat-spinner [diameter]="32"></mat-spinner>
            </div>
        } @else {
            <p class="text-xs text-gray-500 mb-3">Toggle the roles for this user. Permissions outside the tenant's pool are stripped automatically on save.</p>
            <div class="space-y-2">
                <div *ngFor="let r of roles(); let i = index"
                     class="flex items-start p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <mat-checkbox class="pt-0.5" [(ngModel)]="r.enabled"></mat-checkbox>
                    <div class="ml-2 flex flex-col">
                        <span class="text-sm font-medium text-gray-900 dark:text-white">{{ r.roleName }}</span>
                        <span class="text-xs text-gray-500" *ngIf="r.description">{{ r.description }}</span>
                    </div>
                </div>
            </div>
            <p *ngIf="roles().length === 0" class="text-sm text-gray-500 py-4 text-center">No roles available.</p>
        }
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!px-4 !pb-4">
        <button mat-button (click)="close()" [disabled]="saving()">Cancel</button>
        <button mat-flat-button color="primary"
                (click)="save()"
                [disabled]="loading() || saving()">
            <mat-icon class="icon-size-5 mr-2">save</mat-icon>{{ saving() ? 'Saving…' : 'Save Roles' }}
        </button>
    </mat-dialog-actions>
</div>
    `,
})
export class UserRolesDialogComponent implements OnInit {
    private readonly userService = inject(UserService);
    private readonly permissionsService = inject(PermissionsService);
    private readonly navigationService = inject(NavigationService);
    private readonly dialogRef = inject(MatDialogRef<UserRolesDialogComponent>);

    roles = signal<UserRoleDto[]>([]);
    loading = signal(true);
    saving = signal(false);

    constructor(@Inject(MAT_DIALOG_DATA) public data: UserRolesDialogData) {}

    ngOnInit(): void {
        this.userService.getUserRoles(this.data.userId).subscribe({
            next: rolesList => {
                this.roles.set(rolesList ?? []);
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    save(): void {
        this.saving.set(true);
        this.userService.assignUserRoles(this.data.userId, { userRoles: this.roles() }).subscribe({
            next: () => {
                // Refresh the current user's permissions + navigation in case
                // they just edited their own roles. Cheap no-op when not.
                this.permissionsService.load().subscribe({
                    complete: () => this.navigationService.get().subscribe({
                        complete: () => { this.saving.set(false); this.dialogRef.close(true); },
                    }),
                });
            },
            error: () => this.saving.set(false),
        });
    }

    close(): void { this.dialogRef.close(false); }
}
