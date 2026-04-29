import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoriesService } from 'app/core/catalog/catalog.service';
import { CategoryDto } from 'app/core/catalog/catalog.types';

@Component({
    selector: 'app-category-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatCheckboxModule],
    template: `
        <div class="p-6 max-w-2xl">
            <div class="flex items-center gap-2 mb-4">
                <button mat-icon-button routerLink="/catalog/categories"><mat-icon>arrow_back</mat-icon></button>
                <h2 class="text-2xl font-semibold">{{ id ? 'Edit Category' : 'New Category' }}</h2>
            </div>
            <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-4">
                <mat-form-field><mat-label>Name</mat-label><input matInput formControlName="name" /></mat-form-field>
                <mat-form-field><mat-label>Description</mat-label><textarea matInput formControlName="description"></textarea></mat-form-field>
                <div class="grid grid-cols-2 gap-4">
                    <mat-form-field>
                        <mat-label>Parent (optional)</mat-label>
                        <mat-select formControlName="parentCategoryId">
                            <mat-option [value]="undefined">— None —</mat-option>
                            @for (c of others(); track c.id) {
                                <mat-option [value]="c.id">{{ c.name }}</mat-option>
                            }
                        </mat-select>
                    </mat-form-field>
                    <mat-form-field><mat-label>Display Order</mat-label><input matInput type="number" formControlName="displayOrder" /></mat-form-field>
                </div>
                <mat-checkbox formControlName="isActive">Active</mat-checkbox>
                <div class="flex gap-2">
                    <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving">{{ saving ? 'Saving...' : 'Save' }}</button>
                    <button mat-button type="button" routerLink="/catalog/categories">Cancel</button>
                </div>
            </form>
        </div>
    `,
})
export class CategoryFormComponent implements OnInit {
    private readonly api = inject(CategoriesService);
    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    id: string | null = null;
    saving = false;
    others = signal<CategoryDto[]>([]);
    form: FormGroup = this.fb.group({
        name: ['', Validators.required],
        description: [''],
        parentCategoryId: [undefined],
        displayOrder: [0],
        isActive: [true],
    });

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        this.api.getAll().subscribe(all => {
            this.others.set(all.filter(c => c.id !== this.id));
        });
        if (this.id) this.api.get(this.id).subscribe(c => this.form.patchValue({
            name: c.name, description: c.description, parentCategoryId: c.parentCategoryId,
            displayOrder: c.displayOrder, isActive: c.isActive,
        }));
    }

    save(): void {
        if (this.form.invalid) return;
        this.saving = true;
        const v = this.form.getRawValue();
        const op$ = this.id ? this.api.update(this.id, v) : this.api.create(v);
        op$.subscribe({
            next: () => { this.saving = false; this.router.navigate(['/catalog/categories']); },
            error: () => { this.saving = false; },
        });
    }
}
