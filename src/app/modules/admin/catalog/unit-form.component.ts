import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UnitsService } from 'app/core/catalog/catalog.service';

@Component({
    selector: 'app-unit-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule],
    template: `
        <div class="p-6 max-w-2xl">
            <div class="flex items-center gap-2 mb-4">
                <button mat-icon-button routerLink="/catalog/units"><mat-icon>arrow_back</mat-icon></button>
                <h2 class="text-2xl font-semibold">{{ id ? 'Edit Unit' : 'New Unit' }}</h2>
            </div>
            <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-4">
                <div class="grid grid-cols-2 gap-4">
                    <mat-form-field><mat-label>Code</mat-label><input matInput formControlName="code" placeholder="e.g. KG, EA" /></mat-form-field>
                    <mat-form-field><mat-label>Name</mat-label><input matInput formControlName="name" /></mat-form-field>
                </div>
                <mat-form-field class="w-1/2"><mat-label>Decimal places</mat-label><input matInput type="number" formControlName="decimalPlaces" /></mat-form-field>
                <mat-checkbox formControlName="isWeight">Weight-based unit (uses scale at POS)</mat-checkbox>
                <mat-checkbox formControlName="isActive">Active</mat-checkbox>
                <div class="flex gap-2">
                    <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving">{{ saving ? 'Saving...' : 'Save' }}</button>
                    <button mat-button type="button" routerLink="/catalog/units">Cancel</button>
                </div>
            </form>
        </div>
    `,
})
export class UnitFormComponent implements OnInit {
    private readonly api = inject(UnitsService);
    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    id: string | null = null;
    saving = false;
    form: FormGroup = this.fb.group({
        code: ['', Validators.required],
        name: ['', Validators.required],
        isWeight: [false],
        decimalPlaces: [0],
        isActive: [true],
    });

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        if (this.id) this.api.get(this.id).subscribe(u => this.form.patchValue(u));
    }
    save(): void {
        if (this.form.invalid) return;
        this.saving = true;
        const v = this.form.getRawValue();
        const op$ = this.id ? this.api.update(this.id, v) : this.api.create(v);
        op$.subscribe({
            next: () => { this.saving = false; this.router.navigate(['/catalog/units']); },
            error: () => { this.saving = false; },
        });
    }
}
