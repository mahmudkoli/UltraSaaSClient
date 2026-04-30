import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletDto } from 'app/core/outlets/outlets.types';
import { UserService } from 'app/core/user/user.service';

export interface UserOutletsDialogData {
    userId: string;
    userName: string;
}

interface OutletPick extends OutletDto {
    selected: boolean;
}

@Component({
    selector: 'app-user-outlets-dialog',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatButtonModule, MatCheckboxModule, MatDialogModule, MatIconModule,
        MatProgressSpinnerModule,
    ],
    template: `
<div class="p-1">
    <div class="flex items-center space-x-3 px-4 pt-4 pb-2">
        <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow">
            <mat-icon class="text-white">store</mat-icon>
        </div>
        <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Manage Outlets</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ data.userName }}</p>
        </div>
    </div>
    <mat-dialog-content class="!p-4">
        @if (loading()) {
            <div class="flex items-center justify-center py-8">
                <mat-spinner [diameter]="32"></mat-spinner>
            </div>
        } @else {
            <p class="text-xs text-gray-500 mb-3">
                Pick the outlets this user can access. Leave empty (or check all) for tenant-wide access — Admins always have full access regardless of selection.
            </p>
            <div class="space-y-1">
                <div *ngFor="let o of outlets(); let i = index"
                     class="flex items-center p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <mat-checkbox [(ngModel)]="o.selected"></mat-checkbox>
                    <div class="ml-2 flex flex-col">
                        <span class="text-sm font-medium text-gray-900 dark:text-white">{{ o.name }}</span>
                        <span class="text-xs text-gray-500 font-mono">{{ o.code }}</span>
                    </div>
                </div>
                <p *ngIf="outlets().length === 0" class="text-sm text-gray-500 py-4 text-center">No outlets in this tenant.</p>
            </div>
        }
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!px-4 !pb-4">
        <button mat-button (click)="close()" [disabled]="saving()">Cancel</button>
        <button mat-flat-button color="primary"
                (click)="save()"
                [disabled]="loading() || saving()">
            <mat-icon class="icon-size-5 mr-2">save</mat-icon>{{ saving() ? 'Saving…' : 'Save' }}
        </button>
    </mat-dialog-actions>
</div>
    `,
})
export class UserOutletsDialogComponent implements OnInit {
    private readonly userService = inject(UserService);
    private readonly outletsService = inject(OutletsService);
    private readonly dialogRef = inject(MatDialogRef<UserOutletsDialogComponent>);

    outlets = signal<OutletPick[]>([]);
    loading = signal(true);
    saving = signal(false);

    constructor(@Inject(MAT_DIALOG_DATA) public data: UserOutletsDialogData) {}

    ngOnInit(): void {
        forkJoin({
            all: this.outletsService.getAll(),
            assigned: this.userService.getUserOutlets(this.data.userId),
        }).subscribe({
            next: ({ all, assigned }) => {
                const assignedSet = new Set<string>(assigned ?? []);
                this.outlets.set((all ?? []).map(o => ({ ...o, selected: assignedSet.size === 0 ? false : assignedSet.has(o.id) })));
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    save(): void {
        this.saving.set(true);
        const ids = this.outlets().filter(o => o.selected).map(o => o.id);
        this.userService.assignUserOutlets(this.data.userId, ids).subscribe({
            next: () => { this.saving.set(false); this.dialogRef.close(true); },
            error: () => this.saving.set(false),
        });
    }

    close(): void { this.dialogRef.close(false); }
}
