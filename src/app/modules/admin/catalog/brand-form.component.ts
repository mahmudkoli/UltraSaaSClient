import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BrandsService } from 'app/core/catalog/catalog.service';

@Component({
    selector: 'app-brand-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule],
    template: `
        <div class="p-6 max-w-2xl">
            <div class="flex items-center gap-2 mb-4">
                <button mat-icon-button routerLink="/catalog/brands"><mat-icon>arrow_back</mat-icon></button>
                <h2 class="text-2xl font-semibold">{{ id ? 'Edit Brand' : 'New Brand' }}</h2>
            </div>
            <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-4">
                <mat-form-field><mat-label>Name</mat-label><input matInput formControlName="name" /></mat-form-field>
                <mat-form-field><mat-label>Description</mat-label><textarea matInput formControlName="description"></textarea></mat-form-field>
                <mat-checkbox formControlName="isActive">Active</mat-checkbox>
                <div class="flex gap-2">
                    <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving">{{ saving ? 'Saving...' : 'Save' }}</button>
                    <button mat-button type="button" routerLink="/catalog/brands">Cancel</button>
                </div>
            </form>
        </div>
    `,
})
export class BrandFormComponent implements OnInit {
    private readonly api = inject(BrandsService);
    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    id: string | null = null;
    saving = false;
    form: FormGroup = this.fb.group({
        name: ['', Validators.required],
        description: [''],
        isActive: [true],
    });

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        if (this.id) this.api.get(this.id).subscribe(b => this.form.patchValue({ name: b.name, description: b.description, isActive: b.isActive }));
    }

    save(): void {
        if (this.form.invalid) return;
        this.saving = true;
        const v = this.form.getRawValue();
        const op$ = this.id ? this.api.update(this.id, v) : this.api.create(v);
        op$.subscribe({
            next: () => { this.saving = false; this.router.navigate(['/catalog/brands']); },
            error: () => { this.saving = false; },
        });
    }
}
