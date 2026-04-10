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
import { FeeStructureDetailsService } from '../../../core/fee-structure-details/fee-structure-details.service';
import { FeeStructureDetailDto, CreateFeeStructureDetailRequest, UpdateFeeStructureDetailRequest } from '../../../core/fee-structure-details/fee-structure-details.types';
import { FeeStructuresService } from '../../../core/fee-structures/fee-structures.service';
import { FeeStructureDto } from '../../../core/fee-structures/fee-structures.types';
import { FeeTypesService } from '../../../core/fee-types/fee-types.service';
import { FeeTypeDto } from '../../../core/fee-types/fee-types.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'fee-structure-detail-form',
    templateUrl: './fee-structure-detail-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatSelectModule, MatProgressSpinnerModule, MatTooltipModule
    ]
})
export class FeeStructureDetailFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isEditMode = false;
    isLoading = false;
    isSaving = false;
    itemId: string | null = null;

    feeStructures: FeeStructureDto[] = [];
    feeTypes: FeeTypeDto[] = [];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _service: FeeStructureDetailsService,
        private _feeStructuresService: FeeStructuresService,
        private _feeTypesService: FeeTypesService,
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
        this.loadDropdowns();
        if (this.isEditMode) { this.loadItem(); }
    }

    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

    createForm(): FormGroup {
        return this._formBuilder.group({
            feeStructureId: ['', [Validators.required]],
            feeTypeId: ['', [Validators.required]],
            amount: [0, [Validators.required, Validators.min(0.01)]],
            remarks: ['']
        });
    }

    loadDropdowns(): void {
        this._feeStructuresService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.feeStructures = r.data; this._cdr.markForCheck(); }, error: () => {} });
        this._feeTypesService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.feeTypes = r.data; this._cdr.markForCheck(); }, error: () => {} });
    }

    loadItem(): void {
        if (!this.itemId) return;
        this.isLoading = true;
        this._cdr.markForCheck();
        this._service.getById(this.itemId).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item: FeeStructureDetailDto) => {
                this.form.patchValue({
                    feeStructureId: item.feeStructureId,
                    feeTypeId: item.feeTypeId,
                    amount: item.amount,
                    remarks: item.remarks || ''
                });
                this.form.get('feeStructureId')?.disable();
                this.form.get('feeTypeId')?.disable();
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: () => { this._notificationService.error('Error loading fee structure detail'); this.isLoading = false; this._cdr.markForCheck(); }
        });
    }

    save(): void {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        this.isSaving = true;
        this._cdr.markForCheck();

        if (this.isEditMode) {
            const fv = this.form.getRawValue();
            const request: UpdateFeeStructureDetailRequest = {
                id: this.itemId!,
                amount: fv.amount,
                remarks: fv.remarks || undefined
            };
            this._service.update(this.itemId!, request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: () => { this.isSaving = false; this._notificationService.success('Fee line item updated'); this._router.navigate(['/fee-structure-details']); },
                error: () => { this.isSaving = false; this._cdr.markForCheck(); this._notificationService.error('Error updating fee line item'); }
            });
        } else {
            const fv = this.form.value;
            const request: CreateFeeStructureDetailRequest = {
                feeStructureId: fv.feeStructureId,
                feeTypeId: fv.feeTypeId,
                amount: fv.amount,
                remarks: fv.remarks || undefined
            };
            this._service.create(request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: () => { this.isSaving = false; this._notificationService.success('Fee line item created'); this._router.navigate(['/fee-structure-details']); },
                error: () => { this.isSaving = false; this._cdr.markForCheck(); this._notificationService.error('Error creating fee line item'); }
            });
        }
    }

    cancel(): void { this._router.navigate(['/fee-structure-details']); }
    getPageTitle(): string { return this.isEditMode ? 'Edit Fee Line Item' : 'Add Fee Line Item'; }
    getSaveButtonText(): string { return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update' : 'Create'); }
}
