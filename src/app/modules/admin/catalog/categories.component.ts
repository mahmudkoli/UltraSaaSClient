import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { CategoriesService } from 'app/core/catalog/catalog.service';
import { CategoryDto } from 'app/core/catalog/catalog.types';
import { CategoryDialogComponent } from './category-dialog.component';

@Component({
    selector: 'app-categories',
    standalone: true,
    imports: [
        CommonModule, FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule,
        MatIconModule, MatInputModule, MatSelectModule, MatTableModule,
    ],
    template: `
        <div class="p-6">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-semibold">Categories</h2>
                <button mat-raised-button color="primary" (click)="open()">
                    <mat-icon>add</mat-icon> New
                </button>
            </div>

            <table mat-table [dataSource]="rows()" class="w-full">
                <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Name</th>
                    <td mat-cell *matCellDef="let r">{{ r.name }}</td>
                </ng-container>
                <ng-container matColumnDef="parent">
                    <th mat-header-cell *matHeaderCellDef>Parent</th>
                    <td mat-cell *matCellDef="let r">{{ parentName(r.parentCategoryId) || '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="active">
                    <th mat-header-cell *matHeaderCellDef>Active</th>
                    <td mat-cell *matCellDef="let r">{{ r.isActive ? 'Yes' : 'No' }}</td>
                </ng-container>
                <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef></th>
                    <td mat-cell *matCellDef="let r">
                        <button mat-icon-button (click)="open(r)"><mat-icon>edit</mat-icon></button>
                        <button mat-icon-button color="warn" (click)="remove(r)"><mat-icon>delete</mat-icon></button>
                    </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="cols"></tr>
                <tr mat-row *matRowDef="let row; columns: cols"></tr>
            </table>
        </div>
    `,
})
export class CategoriesComponent implements OnInit {
    private readonly api = inject(CategoriesService);
    private readonly dialog = inject(MatDialog);
    rows = signal<CategoryDto[]>([]);
    cols = ['name', 'parent', 'active', 'actions'];

    ngOnInit(): void { this.load(); }
    load(): void { this.api.getAll().subscribe(d => this.rows.set(d)); }

    parentName(id?: string): string | undefined {
        return id ? this.rows().find(r => r.id === id)?.name : undefined;
    }

    open(row?: CategoryDto): void {
        const ref = this.dialog.open(CategoryDialogComponent, { data: { row, all: this.rows() }, width: '500px' });
        ref.afterClosed().subscribe(saved => { if (saved) this.load(); });
    }

    remove(r: CategoryDto): void {
        if (!confirm(`Delete "${r.name}"?`)) return;
        this.api.delete(r.id).subscribe(() => this.load());
    }
}
