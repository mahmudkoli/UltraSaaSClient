import { CommonModule } from '@angular/common';
import { Component, Inject, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CategoriesService } from 'app/core/catalog/catalog.service';
import { CategoryDto } from 'app/core/catalog/catalog.types';

@Component({
    selector: 'app-category-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule],
    template: `
        <h2 mat-dialog-title>{{ row?.id ? 'Edit' : 'New' }} Category</h2>
        <div mat-dialog-content class="flex flex-col gap-3 pt-2">
            <mat-form-field appearance="outline">
                <mat-label>Name</mat-label>
                <input matInput [(ngModel)]="model.name" />
            </mat-form-field>
            <mat-form-field appearance="outline">
                <mat-label>Description</mat-label>
                <input matInput [(ngModel)]="model.description" />
            </mat-form-field>
            <mat-form-field appearance="outline">
                <mat-label>Parent (optional)</mat-label>
                <mat-select [(ngModel)]="model.parentCategoryId">
                    <mat-option [value]="undefined">— None —</mat-option>
                    @for (c of others(); track c.id) {
                        <mat-option [value]="c.id">{{ c.name }}</mat-option>
                    }
                </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
                <mat-label>Display Order</mat-label>
                <input matInput type="number" [(ngModel)]="model.displayOrder" />
            </mat-form-field>
            <mat-checkbox [(ngModel)]="model.isActive">Active</mat-checkbox>
        </div>
        <div mat-dialog-actions align="end">
            <button mat-button (click)="ref.close()">Cancel</button>
            <button mat-raised-button color="primary" [disabled]="saving()" (click)="save()">
                {{ saving() ? 'Saving...' : 'Save' }}
            </button>
        </div>
    `,
})
export class CategoryDialogComponent {
    private readonly api = inject(CategoriesService);
    readonly ref = inject(MatDialogRef<CategoryDialogComponent>);
    row?: CategoryDto;
    model: Partial<CategoryDto>;
    others = signal<CategoryDto[]>([]);
    saving = signal(false);

    constructor(@Inject(MAT_DIALOG_DATA) data: { row?: CategoryDto; all: CategoryDto[] }) {
        this.row = data.row;
        this.model = data.row
            ? { ...data.row }
            : { name: '', description: '', displayOrder: 0, isActive: true };
        this.others.set(data.all.filter(c => c.id !== data.row?.id));
    }

    save(): void {
        if (!this.model.name) return;
        this.saving.set(true);
        const op = this.row?.id
            ? this.api.update(this.row.id, this.model)
            : this.api.create(this.model);
        op.subscribe({
            next: () => { this.saving.set(false); this.ref.close(true); },
            error: () => this.saving.set(false),
        });
    }
}
