import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { environment } from 'environments/environment';

export interface ManagerOverrideResult {
    authorizedUserId: string;
    authorizedUserName: string;
    permission: string;
}

@Component({
    selector: 'app-manager-override-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule],
    template: `
<div class="p-6 min-w-[420px]">
    <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <mat-icon class="text-amber-600">key</mat-icon>
        </div>
        <div>
            <h2 class="text-lg font-semibold">Manager Approval Required</h2>
            <p class="text-xs text-gray-500">{{ data?.reason || 'A manager with discount permission must approve this action.' }}</p>
        </div>
    </div>
    <mat-form-field appearance="outline" class="w-full">
        <mat-label>Manager email</mat-label>
        <input matInput type="email" [(ngModel)]="email" autocomplete="off">
    </mat-form-field>
    <mat-form-field appearance="outline" class="w-full">
        <mat-label>Manager password</mat-label>
        <input matInput type="password" [(ngModel)]="password" autocomplete="off" (keyup.enter)="verify()">
    </mat-form-field>
    <p class="text-xs text-rose-600 mt-1" *ngIf="error()">{{ error() }}</p>
    <div class="flex justify-end gap-2 mt-4">
        <button mat-button (click)="ref.close(null)">Cancel</button>
        <button mat-flat-button color="primary" (click)="verify()" [disabled]="busy() || !email || !password">
            <mat-icon class="icon-size-5 mr-1">verified_user</mat-icon>
            <span>{{ busy() ? 'Verifying…' : 'Authorize' }}</span>
        </button>
    </div>
</div>
    `,
})
export class ManagerOverrideDialogComponent {
    private readonly http = inject(HttpClient);
    email = '';
    password = '';
    busy = signal(false);
    error = signal<string | null>(null);

    constructor(
        public ref: MatDialogRef<ManagerOverrideDialogComponent, ManagerOverrideResult | null>,
        @Inject(MAT_DIALOG_DATA) public data: { requiredPermission: string; reason?: string },
    ) {}

    verify(): void {
        if (!this.email || !this.password) return;
        this.busy.set(true);
        this.error.set(null);
        this.http.post<ManagerOverrideResult>(`${environment.apiUrl}/api/personal/verify-override`, {
            email: this.email,
            password: this.password,
            requiredPermission: this.data.requiredPermission,
        }).subscribe({
            next: r => { this.busy.set(false); this.ref.close(r); },
            error: err => {
                this.busy.set(false);
                const status = err?.status;
                const msg = status === 401 ? 'Invalid manager credentials.'
                    : status === 403 ? 'Manager does not hold the required permission.'
                    : err?.error?.message ?? err?.error?.exception ?? 'Verification failed.';
                this.error.set(msg);
            },
        });
    }
}
