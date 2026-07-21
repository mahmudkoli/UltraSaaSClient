import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { InstituteDto, UpdateInstituteCapacityRequest, UpdateInstituteStatisticsRequest } from '../../../core/institutes/institutes.types';
import { InstitutesService } from '../../../core/institutes/institutes.service';

/**
 * Organization capacity: employee headcount cap + document storage.
 * (Was the Edu student/teacher/classroom/course capacity — de-Edu'd in F1.)
 */
@Component({
    selector: 'institute-capacity',
    templateUrl: './institute-capacity.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
    ],
})
export class InstituteCapacityComponent implements OnInit {
    institute?: InstituteDto;
    instituteId: string;
    capacityForm: FormGroup;
    statisticsForm: FormGroup;
    loading: boolean = false;
    saving: boolean = false;

    constructor(
        private _formBuilder: FormBuilder,
        private _institutesService: InstitutesService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService
    ) {
        this.instituteId = this._route.snapshot.paramMap.get('id')!;

        this.capacityForm = this._formBuilder.group({
            maxEmployees: [100, [Validators.required, Validators.min(1), Validators.max(100000)]],
            storageLimit: [1000, [Validators.min(100), Validators.max(100000)]] // in MB
        });

        this.statisticsForm = this._formBuilder.group({
            currentEmployees: [0, [Validators.required, Validators.min(0)]],
            currentStorageUsed: [0, [Validators.min(0)]] // in MB
        });
    }

    ngOnInit(): void {
        this.loadInstitute();
    }

    loadInstitute(): void {
        this.loading = true;
        this._institutesService.getById(this.instituteId).subscribe({
            next: (institute) => {
                this.institute = institute;
                this.populateForms(institute);
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading institute:', error);
                this.loading = false;
            }
        });
    }

    populateForms(institute: InstituteDto): void {
        this.capacityForm.patchValue({
            maxEmployees: institute.maxEmployees || 100,
            storageLimit: institute.storageLimit || institute.maxStorageGB * 1024 || 1000
        });

        this.statisticsForm.patchValue({
            currentEmployees: institute.currentEmployees || institute.currentEmployeeCount || 0,
            currentStorageUsed: institute.currentStorageUsed || institute.currentStorageUsedMB || 0
        });
    }

    updateCapacity(): void {
        if (this.capacityForm.invalid) {
            return;
        }

        this.saving = true;
        const formData = this.capacityForm.getRawValue();

        const request: UpdateInstituteCapacityRequest = {
            id: this.instituteId,
            maxEmployees: formData.maxEmployees,
            storageLimit: formData.storageLimit
        };

        this._institutesService.updateCapacity(this.instituteId, request).subscribe({
            next: () => {
                this.saving = false;
                this._fuseConfirmationService.open({
                    title: 'Success',
                    message: 'Organization capacity updated successfully!',
                    actions: { confirm: { label: 'OK' } }
                });
                this.loadInstitute();
            },
            error: (error) => {
                console.error('Error updating capacity:', error);
                this.saving = false;
                this._fuseConfirmationService.open({
                    title: 'Error',
                    message: 'Failed to update capacity. Please try again.',
                    actions: { confirm: { label: 'OK' } }
                });
            }
        });
    }

    updateStatistics(): void {
        if (this.statisticsForm.invalid) {
            return;
        }

        this.saving = true;
        const formData = this.statisticsForm.getRawValue();

        const request: UpdateInstituteStatisticsRequest = {
            id: this.instituteId,
            currentEmployeeCount: formData.currentEmployees,
            currentStorageUsedMB: formData.currentStorageUsed
        };

        this._institutesService.updateStatistics(this.instituteId, request).subscribe({
            next: () => {
                this.saving = false;
                this._fuseConfirmationService.open({
                    title: 'Success',
                    message: 'Organization statistics updated successfully!',
                    actions: { confirm: { label: 'OK' } }
                });
                this.loadInstitute();
            },
            error: (error) => {
                console.error('Error updating statistics:', error);
                this.saving = false;
                this._fuseConfirmationService.open({
                    title: 'Error',
                    message: 'Failed to update statistics. Please try again.',
                    actions: { confirm: { label: 'OK' } }
                });
            }
        });
    }

    getUtilizationPercentage(current: number, max: number): number {
        return max > 0 ? Math.min((current / max) * 100, 100) : 0;
    }

    goBack(): void {
        this._router.navigate(['/institute']);
    }
}
