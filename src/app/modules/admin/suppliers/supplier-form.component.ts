import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SuppliersService } from 'app/core/purchasing/purchasing.service';

@Component({
    selector: 'app-supplier-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule,
    ],
    template: `
        <div class="p-6 max-w-2xl">
            <div class="flex items-center gap-2 mb-4">
                <button mat-icon-button routerLink="/suppliers"><mat-icon>arrow_back</mat-icon></button>
                <h2 class="text-2xl font-semibold">{{ id ? 'Edit Supplier' : 'New Supplier' }}</h2>
            </div>
            <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-4">
                <mat-form-field><mat-label>Name</mat-label><input matInput formControlName="name" /></mat-form-field>
                <div class="grid grid-cols-2 gap-4">
                    <mat-form-field><mat-label>Contact Person</mat-label><input matInput formControlName="contactPerson" /></mat-form-field>
                    <mat-form-field><mat-label>Tax ID</mat-label><input matInput formControlName="taxId" /></mat-form-field>
                    <mat-form-field><mat-label>Phone</mat-label><input matInput formControlName="phone" /></mat-form-field>
                    <mat-form-field><mat-label>Email</mat-label><input matInput type="email" formControlName="email" /></mat-form-field>
                </div>
                <mat-form-field><mat-label>Address</mat-label><input matInput formControlName="address" /></mat-form-field>
                <mat-form-field><mat-label>Notes</mat-label><textarea matInput formControlName="notes"></textarea></mat-form-field>
                <mat-checkbox formControlName="isActive">Active</mat-checkbox>
                <div class="flex gap-2">
                    <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving">{{ saving ? 'Saving...' : 'Save' }}</button>
                    <button mat-button type="button" routerLink="/suppliers">Cancel</button>
                </div>
            </form>
        </div>
    `,
})
export class SupplierFormComponent implements OnInit {
    private readonly api = inject(SuppliersService);
    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    id: string | null = null;
    saving = false;
    form: FormGroup = this.fb.group({
        name: ['', Validators.required],
        contactPerson: [''],
        phone: [''],
        email: [''],
        address: [''],
        taxId: [''],
        notes: [''],
        isActive: [true],
    });

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        if (this.id) {
            this.api.get(this.id).subscribe(s => {
                this.form.patchValue({
                    name: s.name, contactPerson: s.contactPerson, phone: s.phone, email: s.email,
                    address: s.address, taxId: s.taxId, notes: s.notes, isActive: s.isActive,
                });
            });
        }
    }

    save(): void {
        if (this.form.invalid) return;
        this.saving = true;
        const v = this.form.getRawValue();
        const op$ = this.id ? this.api.update(this.id, v) : this.api.create(v);
        op$.subscribe({
            next: () => { this.saving = false; this.router.navigate(['/suppliers']); },
            error: () => { this.saving = false; },
        });
    }
}
