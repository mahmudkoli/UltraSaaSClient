import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AcademicYearsService } from '../../../core/academic-years/academic-years.service';
import { AcademicYearDto, CreateAcademicYearRequest, UpdateAcademicYearRequest } from '../../../core/academic-years/academic-years.types';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtils } from '../../../core/utils/date.utils';

@Component({
    selector: 'academic-year-form',
    templateUrl: './academic-year-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatProgressSpinnerModule,
        MatTooltipModule
    ]
})
export class AcademicYearFormComponent implements OnInit, OnDestroy {
    academicYearForm: FormGroup;
    isEditMode = false;
    isLoading = false;
    isSaving = false;
    academicYearId: string | null = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _academicYearsService: AcademicYearsService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _notificationService: NotificationService,
        private _dateUtils: DateUtils
    ) {
        this.academicYearForm = this.createForm();
    }

    ngOnInit(): void {
        this.academicYearId = this._route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.academicYearId;

        if (this.isEditMode) {
            this.loadAcademicYear();
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    createForm(): FormGroup {
        return this._formBuilder.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            code: ['', [Validators.required, Validators.maxLength(20)]],
            startDate: ['', [Validators.required]],
            endDate: ['', [Validators.required]],
            description: ['', [Validators.maxLength(500)]]
        }, { validators: this.dateRangeValidator });
    }

    dateRangeValidator(group: AbstractControl): ValidationErrors | null {
        const startDate = group.get('startDate')?.value;
        const endDate = group.get('endDate')?.value;

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (end <= start) {
                return { dateRange: true };
            }
        }
        return null;
    }

    loadAcademicYear(): void {
        if (!this.academicYearId) return;

        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        this._academicYearsService.getById(this.academicYearId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (academicYear: AcademicYearDto) => {
                    this.academicYearForm.patchValue({
                        name: academicYear.name,
                        code: academicYear.code,
                        startDate: academicYear.startDate ? new Date(academicYear.startDate) : null,
                        endDate: academicYear.endDate ? new Date(academicYear.endDate) : null,
                        description: academicYear.description
                    });
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading academic year:', error);
                    this._notificationService.error('Error loading academic year details');
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    save(): void {
        if (this.academicYearForm.invalid) {
            this.academicYearForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        this._changeDetectorRef.markForCheck();

        if (this.isEditMode) {
            this.updateAcademicYear();
        } else {
            this.createAcademicYear();
        }
    }

    createAcademicYear(): void {
        const formValue = this.academicYearForm.value;

        const request: CreateAcademicYearRequest = {
            name: formValue.name,
            code: formValue.code,
            startDate: this._dateUtils.formatDateForAPI(formValue.startDate),
            endDate: this._dateUtils.formatDateForAPI(formValue.endDate),
            description: formValue.description || undefined
        };

        this._academicYearsService.create(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('Academic year created successfully');
                    this._router.navigate(['/academic-years']);
                },
                error: (error) => {
                    console.error('Error creating academic year:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error creating academic year');
                }
            });
    }

    updateAcademicYear(): void {
        if (!this.academicYearId) return;

        const formValue = this.academicYearForm.value;

        const request: UpdateAcademicYearRequest = {
            id: this.academicYearId,
            name: formValue.name,
            code: formValue.code,
            startDate: this._dateUtils.formatDateForAPI(formValue.startDate),
            endDate: this._dateUtils.formatDateForAPI(formValue.endDate),
            description: formValue.description || undefined
        };

        this._academicYearsService.update(this.academicYearId, request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('Academic year updated successfully');
                    this._router.navigate(['/academic-years']);
                },
                error: (error) => {
                    console.error('Error updating academic year:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error updating academic year');
                }
            });
    }

    cancel(): void {
        this._router.navigate(['/academic-years']);
    }

    getPageTitle(): string {
        return this.isEditMode ? 'Edit Academic Year' : 'Add Academic Year';
    }

    getSaveButtonText(): string {
        return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update Academic Year' : 'Create Academic Year');
    }
}
