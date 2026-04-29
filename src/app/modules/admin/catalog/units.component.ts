import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { UnitsService } from 'app/core/catalog/catalog.service';
import { UnitDto } from 'app/core/catalog/catalog.types';

@Component({
    selector: 'app-unit-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatCheckboxModule],
    template: `
        <h2 mat-dialog-title>{{ row?.id ? 'Edit' : 'New' }} Unit</h2>
        <div mat-dialog-content class="flex flex-col gap-3 pt-2">
            <mat-form-field appearance="outline"><mat-label>Code</mat-label><input matInput [(ngModel)]="model.code" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Name</mat-label><input matInput [(ngModel)]="model.name" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Decimal places</mat-label><input matInput type="number" [(ngModel)]="model.decimalPlaces" /></mat-form-field>
            <mat-checkbox [(ngModel)]="model.isWeight">Is weight (e.g. kg, g)</mat-checkbox>
            <mat-checkbox [(ngModel)]="model.isActive">Active</mat-checkbox>
        </div>
        <div mat-dialog-actions align="end">
            <button mat-button (click)="ref.close()">Cancel</button>
            <button mat-raised-button color="primary" [disabled]="saving()" (click)="save()">Save</button>
        </div>
    `,
})
export class UnitDialogComponent {
    private readonly api = inject(UnitsService);
    readonly ref = inject(MatDialogRef<UnitDialogComponent>);
    row?: UnitDto;
    model: Partial<UnitDto>;
    saving = signal(false);
    constructor(@Inject(MAT_DIALOG_DATA) data: { row?: UnitDto }) {
        this.row = data.row;
        this.model = data.row ? { ...data.row } : { code: '', name: '', isWeight: false, decimalPlaces: 0, isActive: true };
    }
    save(): void {
        if (!this.model.code || !this.model.name) return;
        this.saving.set(true);
        const op = this.row?.id ? this.api.update(this.row.id, this.model) : this.api.create(this.model);
        op.subscribe({ next: () => this.ref.close(true), error: () => this.saving.set(false) });
    }
}

@Component({
    selector: 'app-units',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule, MatIconModule, MatTableModule],
    template: `
        <div class="p-6">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-semibold">Units</h2>
                <button mat-raised-button color="primary" (click)="open()"><mat-icon>add</mat-icon> New</button>
            </div>
            <table mat-table [dataSource]="rows()" class="w-full">
                <ng-container matColumnDef="code"><th mat-header-cell *matHeaderCellDef>Code</th>
                    <td mat-cell *matCellDef="let r">{{ r.code }}</td></ng-container>
                <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Name</th>
                    <td mat-cell *matCellDef="let r">{{ r.name }}</td></ng-container>
                <ng-container matColumnDef="weight"><th mat-header-cell *matHeaderCellDef>Weight?</th>
                    <td mat-cell *matCellDef="let r">{{ r.isWeight ? 'Yes' : 'No' }}</td></ng-container>
                <ng-container matColumnDef="dp"><th mat-header-cell *matHeaderCellDef>Decimals</th>
                    <td mat-cell *matCellDef="let r">{{ r.decimalPlaces }}</td></ng-container>
                <ng-container matColumnDef="active"><th mat-header-cell *matHeaderCellDef>Active</th>
                    <td mat-cell *matCellDef="let r">{{ r.isActive ? 'Yes' : 'No' }}</td></ng-container>
                <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef></th>
                    <td mat-cell *matCellDef="let r">
                        <button mat-icon-button (click)="open(r)"><mat-icon>edit</mat-icon></button>
                        <button mat-icon-button color="warn" (click)="remove(r)"><mat-icon>delete</mat-icon></button>
                    </td></ng-container>
                <tr mat-header-row *matHeaderRowDef="cols"></tr>
                <tr mat-row *matRowDef="let row; columns: cols"></tr>
            </table>
        </div>
    `,
})
export class UnitsComponent implements OnInit {
    private readonly api = inject(UnitsService);
    private readonly dialog = inject(MatDialog);
    rows = signal<UnitDto[]>([]);
    cols = ['code', 'name', 'weight', 'dp', 'active', 'actions'];
    ngOnInit(): void { this.load(); }
    load(): void { this.api.getAll().subscribe(d => this.rows.set(d)); }
    open(row?: UnitDto): void {
        this.dialog.open(UnitDialogComponent, { data: { row }, width: '480px' })
            .afterClosed().subscribe(saved => { if (saved) this.load(); });
    }
    remove(r: UnitDto): void {
        if (!confirm(`Delete "${r.name}"?`)) return;
        this.api.delete(r.id).subscribe(() => this.load());
    }
}
