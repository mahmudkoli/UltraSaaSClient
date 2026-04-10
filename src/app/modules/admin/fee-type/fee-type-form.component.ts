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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FeeTypesService } from '../../../core/fee-types/fee-types.service';
import { FeeTypeDto, FeeCategory, FeeFrequency, CreateFeeTypeRequest, UpdateFeeTypeRequest } from '../../../core/fee-types/fee-types.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'fee-type-form',
    templateUrl: './fee-type-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatSelectModule, MatProgressSpinnerModule, MatTooltipModule, MatCheckboxModule
    ]
})
export class FeeTypeFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isEditMode = false;
    isLoading = false;
    isSaving = false;
    itemId: string | null = null;

    categoryOptions = [
        { value: FeeCategory.Tuition, label: 'Tuition' }, { value: FeeCategory.Registration, label: 'Registration' },
        { value: FeeCategory.Admission, label: 'Admission' }, { value: FeeCategory.Examination, label: 'Examination' },
        { value: FeeCategory.Library, label: 'Library' }, { value: FeeCategory.Laboratory, label: 'Laboratory' },
        { value: FeeCategory.Development, label: 'Development' }, { value: FeeCategory.Security, label: 'Security' },
        { value: FeeCategory.Transport, label: 'Transport' }, { value: FeeCategory.Hostel, label: 'Hostel' },
        { value: FeeCategory.Sports, label: 'Sports' }, { value: FeeCategory.Equipment, label: 'Equipment' },
        { value: FeeCategory.Technology, label: 'Technology' }, { value: FeeCategory.Infrastructure, label: 'Infrastructure' },
        { value: FeeCategory.Maintenance, label: 'Maintenance' }, { value: FeeCategory.Insurance, label: 'Insurance' },
        { value: FeeCategory.Medical, label: 'Medical' }, { value: FeeCategory.Uniform, label: 'Uniform' },
        { value: FeeCategory.Other, label: 'Other' }
    ];

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
        private _service: FeeTypesService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _notificationService: NotificationService
    ) {
        this.form = this.createForm();
    }

    ngOnInit(): void {
        this.itemId = this._route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.itemId;
        if (this.isEditMode) { this.loadItem(); }
    }

    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

    createForm(): FormGroup {
        return this._formBuilder.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            code: ['', [Validators.required, Validators.maxLength(20)]],
            description: ['', [Validators.maxLength(500)]],
            frequency: [FeeFrequency.OneTime, [Validators.required]],
            defaultAmount: [0, [Validators.required, Validators.min(0.01)]],
            category: [FeeCategory.Tuition, [Validators.required]],
            isRefundable: [false],
            isTaxable: [false],
            taxPercentage: [null],
            isDiscountable: [false],
            maxDiscountPercentage: [null]
        });
    }

    loadItem(): void {
        if (!this.itemId) return;
        this.isLoading = true;
        this._cdr.markForCheck();
        this._service.getById(this.itemId).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item: FeeTypeDto) => {
                this.form.patchValue({
                    name: item.name,
                    code: item.code,
                    description: item.description,
                    frequency: item.frequency,
                    defaultAmount: item.defaultAmount,
                    category: item.category,
                    isRefundable: item.isRefundable,
                    isTaxable: item.isTaxable,
                    taxPercentage: item.taxPercentage,
                    isDiscountable: item.isDiscountable,
                    maxDiscountPercentage: item.maxDiscountPercentage
                });
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: () => { this._notificationService.error('Error loading fee type'); this.isLoading = false; this._cdr.markForCheck(); }
        });
    }

    save(): void {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        this.isSaving = true;
        this._cdr.markForCheck();
        const fv = this.form.value;

        if (this.isEditMode) {
            const request: UpdateFeeTypeRequest = {
                id: this.itemId!,
                name: fv.name,
                code: fv.code,
                description: fv.description || undefined,
                frequency: fv.frequency,
                defaultAmount: fv.defaultAmount,
                category: fv.category,
                isRefundable: fv.isRefundable,
                isTaxable: fv.isTaxable,
                taxPercentage: fv.isTaxable ? fv.taxPercentage : undefined,
                isDiscountable: fv.isDiscountable,
                maxDiscountPercentage: fv.isDiscountable ? fv.maxDiscountPercentage : undefined
            };
            this._service.update(this.itemId!, request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: () => { this.isSaving = false; this._notificationService.success('Fee type updated'); this._router.navigate(['/fee-types']); },
                error: () => { this.isSaving = false; this._cdr.markForCheck(); this._notificationService.error('Error updating fee type'); }
            });
        } else {
            const request: CreateFeeTypeRequest = {
                name: fv.name,
                code: fv.code,
                description: fv.description || undefined,
                frequency: fv.frequency,
                defaultAmount: fv.defaultAmount,
                category: fv.category,
                isRefundable: fv.isRefundable,
                isTaxable: fv.isTaxable,
                taxPercentage: fv.isTaxable ? fv.taxPercentage : undefined,
                isDiscountable: fv.isDiscountable,
                maxDiscountPercentage: fv.isDiscountable ? fv.maxDiscountPercentage : undefined
            };
            this._service.create(request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: () => { this.isSaving = false; this._notificationService.success('Fee type created'); this._router.navigate(['/fee-types']); },
                error: () => { this.isSaving = false; this._cdr.markForCheck(); this._notificationService.error('Error creating fee type'); }
            });
        }
    }

    cancel(): void { this._router.navigate(['/fee-types']); }
    getPageTitle(): string { return this.isEditMode ? 'Edit Fee Type' : 'Create Fee Type'; }
    getSaveButtonText(): string { return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update' : 'Save'); }
}
