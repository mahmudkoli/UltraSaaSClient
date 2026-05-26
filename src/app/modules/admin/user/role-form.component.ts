import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RolesService } from 'app/core/roles/roles.service';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
    selector: 'app-role-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        TranslocoModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-xl shadow-lg"><mat-icon class="text-white">{{ id ? 'edit' : 'add' }}</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ (id ? 'ADMIN.ROLE.FORM.TITLE_EDIT' : 'ADMIN.ROLE.FORM.TITLE_NEW') | transloco }}</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ 'ADMIN.ROLE.FORM.SUBTITLE' | transloco }}</p>
                </div>
            </div>
            <button mat-stroked-button class="h-12 px-6 rounded-lg" routerLink="/users/roles"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>{{ 'COMMON.CANCEL' | transloco }}</span></button>
        </div>
        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <form [formGroup]="form" (ngSubmit)="save()" class="p-6 sm:p-8">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <mat-form-field class="w-full" appearance="outline">
                            <mat-label>{{ 'ADMIN.ROLE.FORM.NAME_LABEL' | transloco }}</mat-label>
                            <input matInput formControlName="name" [placeholder]="'ADMIN.ROLE.FORM.NAME_PLACEHOLDER' | transloco">
                            <mat-error *ngIf="form.get('name')?.hasError('required')">{{ 'ADMIN.ROLE.FORM.NAME_REQUIRED' | transloco }}</mat-error>
                        </mat-form-field>
                        <mat-form-field class="w-full" appearance="outline">
                            <mat-label>{{ 'ADMIN.ROLE.FORM.DESCRIPTION_LABEL' | transloco }}</mat-label>
                            <input matInput formControlName="description">
                        </mat-form-field>
                    </div>
                    <div class="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button mat-button type="button" routerLink="/users/roles">{{ 'COMMON.CANCEL' | transloco }}</button>
                        <button mat-flat-button color="primary" type="submit" class="h-12 px-6 rounded-lg shadow-lg" [disabled]="form.invalid || saving">
                            <mat-icon class="icon-size-5 mr-2">save</mat-icon><span>{{ (saving ? 'ADMIN.ROLE.FORM.SAVING' : 'COMMON.SAVE') | transloco }}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
    `,
})
export class RoleFormComponent implements OnInit {
    private readonly api = inject(RolesService);
    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    id: string | null = null;
    saving = false;
    form: FormGroup = this.fb.group({
        name: ['', Validators.required],
        description: [''],
    });

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        if (this.id) this.api.get(this.id).subscribe(r => this.form.patchValue(r));
    }

    save(): void {
        if (this.form.invalid) return;
        this.saving = true;
        const v = this.form.getRawValue();
        this.api.createOrUpdate({ id: this.id ?? undefined, name: v.name, description: v.description }).subscribe({
            next: () => { this.saving = false; this.router.navigate(['/users/roles']); },
            error: () => { this.saving = false; },
        });
    }
}
