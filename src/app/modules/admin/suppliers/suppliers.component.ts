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
import { SuppliersService } from 'app/core/purchasing/purchasing.service';
import { SupplierDto } from 'app/core/purchasing/purchasing.types';

@Component({
    selector: 'app-supplier-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatCheckboxModule],
    template: `
        <h2 mat-dialog-title>{{ row?.id ? 'Edit' : 'New' }} Supplier</h2>
        <div mat-dialog-content class="grid grid-cols-2 gap-3 pt-2">
            <mat-form-field appearance="outline" class="col-span-2"><mat-label>Name</mat-label><input matInput [(ngModel)]="model.name" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Contact Person</mat-label><input matInput [(ngModel)]="model.contactPerson" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Phone</mat-label><input matInput [(ngModel)]="model.phone" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput [(ngModel)]="model.email" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Tax ID</mat-label><input matInput [(ngModel)]="model.taxId" /></mat-form-field>
            <mat-form-field appearance="outline" class="col-span-2"><mat-label>Address</mat-label><input matInput [(ngModel)]="model.address" /></mat-form-field>
            <mat-form-field appearance="outline" class="col-span-2"><mat-label>Notes</mat-label><textarea matInput [(ngModel)]="model.notes"></textarea></mat-form-field>
            <mat-checkbox class="col-span-2" [(ngModel)]="model.isActive">Active</mat-checkbox>
        </div>
        <div mat-dialog-actions align="end">
            <button mat-button (click)="ref.close()">Cancel</button>
            <button mat-raised-button color="primary" [disabled]="saving()" (click)="save()">Save</button>
        </div>
    `,
})
export class SupplierDialogComponent {
    private readonly api = inject(SuppliersService);
    readonly ref = inject(MatDialogRef<SupplierDialogComponent>);
    row?: SupplierDto;
    model: Partial<SupplierDto>;
    saving = signal(false);
    constructor(@Inject(MAT_DIALOG_DATA) data: { row?: SupplierDto }) {
        this.row = data.row;
        this.model = data.row ? { ...data.row } : { name: '', isActive: true };
    }
    save(): void {
        if (!this.model.name) return;
        this.saving.set(true);
        const op = this.row?.id ? this.api.update(this.row.id, this.model) : this.api.create(this.model);
        op.subscribe({ next: () => this.ref.close(true), error: () => this.saving.set(false) });
    }
}

@Component({
    selector: 'app-suppliers',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule, MatIconModule, MatTableModule],
    template: `
        <div class="p-6">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-semibold">Suppliers</h2>
                <button mat-raised-button color="primary" (click)="open()"><mat-icon>add</mat-icon> New</button>
            </div>
            <table mat-table [dataSource]="rows()" class="w-full">
                <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Name</th><td mat-cell *matCellDef="let r">{{ r.name }}</td></ng-container>
                <ng-container matColumnDef="contact"><th mat-header-cell *matHeaderCellDef>Contact</th><td mat-cell *matCellDef="let r">{{ r.contactPerson || '-' }}</td></ng-container>
                <ng-container matColumnDef="phone"><th mat-header-cell *matHeaderCellDef>Phone</th><td mat-cell *matCellDef="let r">{{ r.phone || '-' }}</td></ng-container>
                <ng-container matColumnDef="email"><th mat-header-cell *matHeaderCellDef>Email</th><td mat-cell *matCellDef="let r">{{ r.email || '-' }}</td></ng-container>
                <ng-container matColumnDef="active"><th mat-header-cell *matHeaderCellDef>Active</th><td mat-cell *matCellDef="let r">{{ r.isActive ? 'Yes' : 'No' }}</td></ng-container>
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
export class SuppliersComponent implements OnInit {
    private readonly api = inject(SuppliersService);
    private readonly dialog = inject(MatDialog);
    rows = signal<SupplierDto[]>([]);
    cols = ['name', 'contact', 'phone', 'email', 'active', 'actions'];
    ngOnInit(): void { this.load(); }
    load(): void { this.api.getAll().subscribe(d => this.rows.set(d)); }
    open(row?: SupplierDto): void {
        this.dialog.open(SupplierDialogComponent, { data: { row }, width: '600px' })
            .afterClosed().subscribe(saved => { if (saved) this.load(); });
    }
    remove(r: SupplierDto): void {
        if (!confirm(`Delete "${r.name}"?`)) return;
        this.api.delete(r.id).subscribe(() => this.load());
    }
}
