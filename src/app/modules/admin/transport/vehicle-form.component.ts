import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { VehiclesService } from '../../../core/transport/transport.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';

@Component({
    selector: 'vehicle-form',
    templateUrl: './vehicle-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, ListPageComponent],
})
export class VehicleFormComponent implements OnInit {
    form: FormGroup;
    saving = false; loading = false;
    editingId?: string;

    constructor(private _svc: VehiclesService, private _fb: FormBuilder, private _route: ActivatedRoute, private _router: Router, private _cdr: ChangeDetectorRef, private _notify: NotificationService) {
        this.form = this._fb.group({
            vehicleNumber: ['', [Validators.required]],
            vehicleType: ['Bus', [Validators.required]],
            make: ['', [Validators.required]],
            model: ['', [Validators.required]],
            year: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
            capacity: [40, [Validators.required, Validators.min(1)]],
            color: [''],
            registrationNumber: [''],
            insuranceNumber: [''],
            insuranceExpiryDate: [''],
            fitnessExpiryDate: [''],
            isActive: [true],
            driverName: [''],
            driverPhone: [''],
            conductorName: [''],
            conductorPhone: [''],
            remarks: [''],
        });
    }

    ngOnInit(): void {
        const id = this._route.snapshot.paramMap.get('id');
        if (id) {
            this.editingId = id;
            this.loading = true;
            this._svc.getById(id).subscribe({
                next: (v) => {
                    this.form.patchValue({
                        ...v,
                        insuranceExpiryDate: v.insuranceExpiryDate?.slice(0, 10),
                        fitnessExpiryDate: v.fitnessExpiryDate?.slice(0, 10),
                    });
                    this.loading = false; this._cdr.markForCheck();
                },
                error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load vehicle.'); },
            });
        }
    }

    save(): void {
        if (this.form.invalid) return;
        this.saving = true;
        // Empty date inputs come through as '' which the API can't bind to DateTime? —
        // send null instead so an optional expiry can be left blank.
        const v = {
            ...this.form.value,
            insuranceExpiryDate: this.form.value.insuranceExpiryDate || null,
            fitnessExpiryDate: this.form.value.fitnessExpiryDate || null,
        };
        const obs = this.editingId ? this._svc.update(this.editingId, { id: this.editingId, ...v }) : this._svc.create(v);
        obs.subscribe({
            next: () => { this.saving = false; this._notify.success('Saved.'); this._router.navigate(['/transport/vehicles']); },
            error: () => { this.saving = false; this._cdr.markForCheck(); this._notify.error('Save failed.'); },
        });
    }

    cancel(): void { this._router.navigate(['/transport/vehicles']); }
}
