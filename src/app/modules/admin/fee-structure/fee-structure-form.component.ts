import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FeeStructuresService } from '../../../core/fee-structures/fee-structures.service';
import { FeeStructureDto, CreateFeeStructureRequest, UpdateFeeStructureRequest } from '../../../core/fee-structures/fee-structures.types';
import { FeeFrequency } from '../../../core/fee-types/fee-types.types';
import { AcademicYearsService } from '../../../core/academic-years/academic-years.service';
import { AcademicYearDto } from '../../../core/academic-years/academic-years.types';
import { ClassesService } from '../../../core/classes/classes.service';
import { ClassDto } from '../../../core/classes/classes.types';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtils } from '../../../core/utils/date.utils';

@Component({
    selector: 'fee-structure-form',
    templateUrl: './fee-structure-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatSelectModule, MatDatepickerModule, MatNativeDateModule,
        MatProgressSpinnerModule, MatTooltipModule, MatCheckboxModule
    ]
})
export class FeeStructureFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isEditMode = false;
    isLoading = false;
    isSaving = false;
    itemId: string | null = null;
    academicYears: AcademicYearDto[] = [];
    classes: ClassDto[] = [];

    frequencyOptions = [
        { value: FeeFrequency.OneTime, label: 'One-Time' }, { value: FeeFrequency.Monthly, label: 'Monthly' },
        { value: FeeFrequency.Quarterly, label: 'Quarterly' }, { value: FeeFrequency.SemiAnnually, label: 'Semi-Annually' },
        { value: FeeFrequency.Annually, label: 'Annually' }, { value: FeeFrequency.PerSemester, label: 'Per Semester' },
        { value: FeeFrequency.PerSession, label: 'Per Session' }, { value: FeeFrequency.PerCourse, label: 'Per Course' },
        { value: FeeFrequency.Weekly, label: 'Weekly' }, { value: FeeFrequency.Daily, label: 'Daily' }
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _service: FeeStructuresService,
        private _academicYearsService: AcademicYearsService,
        private _classesService: ClassesService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _notificationService: NotificationService,
        private _dateUtils: DateUtils
    ) {
        this.form = this.createForm();
    }

    ngOnInit(): void {
        this.itemId = this._route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.itemId;
        this.loadDropdowns();
        if (this.isEditMode) { this.loadItem(); }
    }

    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

    createForm(): FormGroup {
        return this._formBuilder.group({
            name: ['', [Validators.required, Validators.maxLength(256)]],
            code: ['', [Validators.required, Validators.maxLength(50)]],
            description: [''],
            academicYearId: ['', [Validators.required]],
            classId: ['', [Validators.required]],
            effectiveFrom: [null, [Validators.required]],
            effectiveTo: [null],
            feeFrequency: [FeeFrequency.Annually, [Validators.required]],
            isDefault: [false]
        });
    }

    loadDropdowns(): void {
        this._academicYearsService.search({ pageNumber: 1, pageSize: 200, isActive: true })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.academicYears = r.data; this._cdr.markForCheck(); }, error: () => {} });
        this._classesService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.classes = r.data; this._cdr.markForCheck(); }, error: () => {} });
    }

    loadItem(): void {
        if (!this.itemId) return;
        this.isLoading = true;
        this._cdr.markForCheck();
        this._service.getById(this.itemId).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item: FeeStructureDto) => {
                this.form.patchValue({
                    name: item.name,
                    code: item.code,
                    description: item.description,
                    academicYearId: item.academicYearId,
                    classId: item.classId,
                    effectiveFrom: item.effectiveFrom ? new Date(item.effectiveFrom) : null,
                    effectiveTo: item.effectiveTo ? new Date(item.effectiveTo) : null,
                    feeFrequency: item.feeFrequency,
                    isDefault: item.isDefault
                });
                this.form.get('academicYearId')?.disable();
                this.form.get('classId')?.disable();
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: () => { this._notificationService.error('Error loading fee structure'); this.isLoading = false; this._cdr.markForCheck(); }
        });
    }

    save(): void {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        this.isSaving = true;
        this._cdr.markForCheck();

        if (this.isEditMode) {
            const fv = this.form.getRawValue();
            const request: UpdateFeeStructureRequest = {
                id: this.itemId!,
                name: fv.name,
                code: fv.code,
                description: fv.description || undefined,
                effectiveFrom: this._dateUtils.formatDateForAPI(fv.effectiveFrom),
                effectiveTo: fv.effectiveTo ? this._dateUtils.formatDateForAPI(fv.effectiveTo) : undefined,
                feeFrequency: fv.feeFrequency,
                isDefault: fv.isDefault
            };
            this._service.update(this.itemId!, request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: () => { this.isSaving = false; this._notificationService.success('Fee structure updated'); this._router.navigate(['/fee-structures']); },
                error: () => { this.isSaving = false; this._cdr.markForCheck(); this._notificationService.error('Error updating fee structure'); }
            });
        } else {
            const fv = this.form.value;
            const request: CreateFeeStructureRequest = {
                name: fv.name,
                code: fv.code,
                description: fv.description || undefined,
                academicYearId: fv.academicYearId,
                classId: fv.classId,
                effectiveFrom: this._dateUtils.formatDateForAPI(fv.effectiveFrom),
                effectiveTo: fv.effectiveTo ? this._dateUtils.formatDateForAPI(fv.effectiveTo) : undefined,
                feeFrequency: fv.feeFrequency,
                isDefault: fv.isDefault
            };
            this._service.create(request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: () => { this.isSaving = false; this._notificationService.success('Fee structure created'); this._router.navigate(['/fee-structures']); },
                error: () => { this.isSaving = false; this._cdr.markForCheck(); this._notificationService.error('Error creating fee structure'); }
            });
        }
    }

    cancel(): void { this._router.navigate(['/fee-structures']); }
    getPageTitle(): string { return this.isEditMode ? 'Edit Fee Structure' : 'Create Fee Structure'; }
    getSaveButtonText(): string { return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update' : 'Save'); }
}
