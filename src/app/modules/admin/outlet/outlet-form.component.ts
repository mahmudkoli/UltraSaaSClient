import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletType } from 'app/core/outlets/outlets.types';

@Component({
    selector: 'app-outlet-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    ],
    template: `
        <div class="p-6 max-w-2xl">
            <div class="flex items-center gap-2 mb-4">
                <button mat-icon-button routerLink="/outlet">
                    <mat-icon>arrow_back</mat-icon>
                </button>
                <h2 class="text-2xl font-semibold">{{ id ? 'Edit Outlet' : 'New Outlet' }}</h2>
            </div>

            <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-4">
                <mat-form-field>
                    <mat-label>Code</mat-label>
                    <input matInput formControlName="code" placeholder="e.g. DHN-01" />
                </mat-form-field>

                <mat-form-field>
                    <mat-label>Name</mat-label>
                    <input matInput formControlName="name" />
                </mat-form-field>

                <mat-form-field>
                    <mat-label>Type</mat-label>
                    <mat-select formControlName="type">
                        <mat-option value="Retail">Retail</mat-option>
                        <mat-option value="Warehouse">Warehouse</mat-option>
                        <mat-option value="HQ">HQ</mat-option>
                    </mat-select>
                </mat-form-field>

                <mat-form-field *ngIf="!id">
                    <mat-label>Tenant ID</mat-label>
                    <input matInput formControlName="tenantId" />
                </mat-form-field>

                <mat-form-field>
                    <mat-label>Contact Email</mat-label>
                    <input matInput type="email" formControlName="contactEmail" />
                </mat-form-field>

                <mat-form-field>
                    <mat-label>Contact Phone</mat-label>
                    <input matInput formControlName="contactPhone" />
                </mat-form-field>

                <mat-form-field>
                    <mat-label>Address</mat-label>
                    <input matInput formControlName="addressLine" />
                </mat-form-field>

                <div class="grid grid-cols-2 gap-4">
                    <mat-form-field>
                        <mat-label>City</mat-label>
                        <input matInput formControlName="city" />
                    </mat-form-field>
                    <mat-form-field>
                        <mat-label>State</mat-label>
                        <input matInput formControlName="state" />
                    </mat-form-field>
                    <mat-form-field>
                        <mat-label>Country</mat-label>
                        <input matInput formControlName="country" placeholder="BD / IN / US" />
                    </mat-form-field>
                    <mat-form-field>
                        <mat-label>Postal Code</mat-label>
                        <input matInput formControlName="postalCode" />
                    </mat-form-field>
                </div>

                <div class="flex gap-2">
                    <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving">
                        {{ saving ? 'Saving...' : 'Save' }}
                    </button>
                    <button mat-button type="button" routerLink="/outlet">Cancel</button>
                </div>
            </form>
        </div>
    `,
})
export class OutletFormComponent implements OnInit {
    private readonly api = inject(OutletsService);
    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    id: string | null = null;
    saving = false;
    form: FormGroup = this.fb.group({
        code: ['', Validators.required],
        name: ['', Validators.required],
        tenantId: [''],
        type: ['Retail' as OutletType, Validators.required],
        contactEmail: [''],
        contactPhone: [''],
        addressLine: [''],
        city: [''],
        state: [''],
        country: [''],
        postalCode: [''],
    });

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        if (this.id) {
            this.api.get(this.id).subscribe((o) => {
                this.form.patchValue({
                    code: o.code,
                    name: o.name,
                    type: o.type,
                    contactEmail: o.contactEmail,
                    contactPhone: o.contactPhone,
                    addressLine: o.addressLine,
                    city: o.city,
                    state: o.state,
                    country: o.country,
                    postalCode: o.postalCode,
                });
                this.form.get('code')?.disable();
                this.form.get('tenantId')?.disable();
            });
        }
    }

    save(): void {
        if (this.form.invalid) return;
        this.saving = true;
        const v = this.form.getRawValue();
        const op$ = this.id
            ? this.api.update(this.id, { id: this.id, ...v })
            : this.api.create(v);

        op$.subscribe({
            next: () => { this.saving = false; this.router.navigate(['/outlet']); },
            error: () => { this.saving = false; },
        });
    }
}
