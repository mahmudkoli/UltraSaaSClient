import { CommonModule } from '@angular/common';
import { Component, Inject, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from 'app/core/user/user.service';

export interface UserAdminResetPasswordDialogData {
    userId: string;
    userName: string;
}

@Component({
    selector: 'app-user-admin-reset-password-dialog',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule,
        MatInputModule, MatProgressSpinnerModule,
    ],
    template: `
<div class="p-1">
    <div class="flex items-center space-x-3 px-4 pt-4 pb-2">
        <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 shadow">
            <mat-icon class="text-white">lock_reset</mat-icon>
        </div>
        <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Reset Password</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ data.userName }}</p>
        </div>
    </div>
    <mat-dialog-content class="!p-4">
        <div class="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 mb-4 text-xs text-amber-900 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-200">
            The user will be required to change this password on next sign-in. Communicate it through a secure channel — chat / SMS / in person — not the same email channel they're already locked out of.
        </div>

        <mat-form-field appearance="outline" class="w-full">
            <mat-label>New password</mat-label>
            <input matInput
                   [type]="showPassword() ? 'text' : 'password'"
                   [(ngModel)]="password"
                   placeholder="Min 8 characters"
                   autocomplete="new-password"
                   (input)="error.set('')">
            <button matSuffix mat-icon-button type="button"
                    (click)="showPassword.set(!showPassword())"
                    [matTooltip]="showPassword() ? 'Hide' : 'Show'">
                <mat-icon class="icon-size-5">{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
        </mat-form-field>

        <button mat-stroked-button class="!mt-1" (click)="generate()" [disabled]="saving()">
            <mat-icon class="icon-size-5 mr-1">casino</mat-icon>Generate strong password
        </button>

        <div *ngIf="error()" class="mt-3 text-sm text-rose-600 dark:text-rose-400">
            {{ error() }}
        </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!px-4 !pb-4">
        <button mat-button (click)="close()" [disabled]="saving()">Cancel</button>
        <button mat-flat-button color="warn"
                (click)="save()"
                [disabled]="saving() || password.length < 8">
            <mat-icon class="icon-size-5 mr-2">lock_reset</mat-icon>{{ saving() ? 'Resetting…' : 'Reset Password' }}
        </button>
    </mat-dialog-actions>
</div>
    `,
})
export class UserAdminResetPasswordDialogComponent {
    private readonly userService = inject(UserService);
    private readonly dialogRef = inject(MatDialogRef<UserAdminResetPasswordDialogComponent>);

    password = '';
    showPassword = signal(false);
    saving = signal(false);
    error = signal('');

    constructor(@Inject(MAT_DIALOG_DATA) public data: UserAdminResetPasswordDialogData) {}

    generate(): void {
        // Browser-side strong password — 16 chars base64-ish, not perfect entropy
        // but plenty for a one-time temp password the user must rotate anyway.
        const buf = new Uint8Array(12);
        crypto.getRandomValues(buf);
        this.password = btoa(String.fromCharCode(...buf))
            .replace(/[+/=]/g, '')
            .substring(0, 16);
        this.showPassword.set(true);
        this.error.set('');
    }

    save(): void {
        if (this.password.length < 8) {
            this.error.set('Password must be at least 8 characters.');
            return;
        }
        this.saving.set(true);
        this.userService.adminResetPassword(this.data.userId, this.password).subscribe({
            next: () => { this.saving.set(false); this.dialogRef.close(true); },
            error: (err) => {
                this.saving.set(false);
                this.error.set(err?.error?.message || err?.message || 'Reset failed.');
            },
        });
    }

    close(): void { this.dialogRef.close(false); }
}
