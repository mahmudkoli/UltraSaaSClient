import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomersService } from 'app/core/sales/sales.service';

@Component({
    selector: 'app-customer-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    ],
    template: `
        <div class="p-6 max-w-2xl">
            <div class="flex items-center gap-2 mb-4">
                <button mat-icon-button routerLink="/customers"><mat-icon>arrow_back</mat-icon></button>
                <h2 class="text-2xl font-semibold">{{ id ? 'Edit Customer' : 'New Customer' }}</h2>
            </div>

            <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-4">
                <mat-form-field>
                    <mat-label>Name</mat-label>
                    <input matInput formControlName="name" />
                </mat-form-field>

                <div class="grid grid-cols-2 gap-4">
                    <mat-form-field>
                        <mat-label>Phone</mat-label>
                        <input matInput formControlName="phone" />
                    </mat-form-field>
                    <mat-form-field>
                        <mat-label>Email</mat-label>
                        <input matInput type="email" formControlName="email" />
                    </mat-form-field>
                </div>

                <mat-form-field>
                    <mat-label>Address</mat-label>
                    <input matInput formControlName="address" />
                </mat-form-field>

                <div class="grid grid-cols-3 gap-4">
                    <mat-form-field>
                        <mat-label>Type</mat-label>
                        <mat-select formControlName="customerType">
                            <mat-option value="Retail">Retail</mat-option>
                            <mat-option value="Wholesale">Wholesale</mat-option>
                            <mat-option value="Corporate">Corporate</mat-option>
                        </mat-select>
                    </mat-form-field>
                    <mat-form-field>
                        <mat-label>Credit Limit</mat-label>
                        <input matInput type="number" formControlName="creditLimit" />
                    </mat-form-field>
                    <mat-form-field>
                        <mat-label>Tax ID</mat-label>
                        <input matInput formControlName="taxId" />
                    </mat-form-field>
                </div>

                <div class="flex gap-2">
                    <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving">
                        {{ saving ? 'Saving...' : 'Save' }}
                    </button>
                    <button mat-button type="button" routerLink="/customers">Cancel</button>
                </div>
            </form>
        </div>
    `,
})
export class CustomerFormComponent implements OnInit {
    private readonly api = inject(CustomersService);
    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    id: string | null = null;
    saving = false;
    form: FormGroup = this.fb.group({
        name: ['', Validators.required],
        phone: [''],
        email: [''],
        address: [''],
        customerType: ['Retail', Validators.required],
        creditLimit: [0],
        taxId: [''],
    });

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        if (this.id) {
            this.api.get(this.id).subscribe(c => {
                this.form.patchValue({
                    name: c.name, phone: c.phone, email: c.email, address: c.address,
                    customerType: c.customerType, creditLimit: c.creditLimit, taxId: c.taxId,
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
            next: () => { this.saving = false; this.router.navigate(['/customers']); },
            error: () => { this.saving = false; },
        });
    }
}
