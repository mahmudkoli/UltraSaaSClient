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
import { FeeInvoicesService } from '../../../core/fee-invoices/fee-invoices.service';
import { FeeInvoiceDto, CreateFeeInvoiceRequest, UpdateFeeInvoiceRequest } from '../../../core/fee-invoices/fee-invoices.types';
import { StudentsService } from '../../../core/students/students.service';
import { StudentDto } from '../../../core/students/students.types';
import { ClassesService } from '../../../core/classes/classes.service';
import { ClassDto } from '../../../core/classes/classes.types';
import { AcademicYearsService } from '../../../core/academic-years/academic-years.service';
import { AcademicYearDto } from '../../../core/academic-years/academic-years.types';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtils } from '../../../core/utils/date.utils';

@Component({
    selector: 'fee-invoice-form',
    templateUrl: './fee-invoice-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatSelectModule, MatDatepickerModule, MatNativeDateModule,
        MatProgressSpinnerModule, MatTooltipModule
    ]
})
export class FeeInvoiceFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isEditMode = false;
    isLoading = false;
    isSaving = false;
    itemId: string | null = null;
    currentInvoice: FeeInvoiceDto | null = null;

    students: StudentDto[] = [];
    classes: ClassDto[] = [];
    academicYears: AcademicYearDto[] = [];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _service: FeeInvoicesService,
        private _studentsService: StudentsService,
        private _classesService: ClassesService,
        private _academicYearsService: AcademicYearsService,
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
        if (!this.isEditMode) { this.loadDropdowns(); }
        if (this.isEditMode) { this.loadItem(); }
    }

    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

    createForm(): FormGroup {
        return this._formBuilder.group({
            // Create fields
            invoiceNumber: ['', [Validators.required, Validators.maxLength(50)]],
            studentId: ['', [Validators.required]],
            classId: ['', [Validators.required]],
            academicYearId: ['', [Validators.required]],
            invoiceDate: [new Date(), [Validators.required]],
            dueDate: [null, [Validators.required]],
            totalAmount: [0, [Validators.required, Validators.min(0.01)]],
            discountAmount: [null],
            taxAmount: [null],
            lateFeeAmount: [null],
            // Update (payment) fields
            paidAmount: [0],
            paymentMethod: [''],
            transactionId: [''],
            paidBy: [''],
            receiptNumber: [''],
            remarks: ['']
        });
    }

    loadDropdowns(): void {
        this._studentsService.search({ pageNumber: 1, pageSize: 200, isActive: true })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.students = r.data; this._cdr.markForCheck(); }, error: () => {} });
        this._classesService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.classes = r.data; this._cdr.markForCheck(); }, error: () => {} });
        this._academicYearsService.search({ pageNumber: 1, pageSize: 200, isActive: true })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.academicYears = r.data; this._cdr.markForCheck(); }, error: () => {} });
    }

    loadItem(): void {
        if (!this.itemId) return;
        this.isLoading = true;
        this._cdr.markForCheck();
        this._service.getById(this.itemId).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item: FeeInvoiceDto) => {
                this.currentInvoice = item;
                this.form.patchValue({
                    invoiceNumber: item.invoiceNumber,
                    totalAmount: item.totalAmount,
                    paidAmount: 0,
                    paymentMethod: '',
                    remarks: item.remarks,
                    transactionId: '',
                    paidBy: '',
                    receiptNumber: ''
                });
                // In edit mode, set validators for payment fields
                this.form.get('paidAmount')?.setValidators([Validators.required, Validators.min(0.01)]);
                this.form.get('paymentMethod')?.setValidators([Validators.required, Validators.maxLength(50)]);
                this.form.get('paidAmount')?.updateValueAndValidity();
                this.form.get('paymentMethod')?.updateValueAndValidity();
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: () => { this._notificationService.error('Error loading invoice'); this.isLoading = false; this._cdr.markForCheck(); }
        });
    }

    save(): void {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        this.isSaving = true;
        this._cdr.markForCheck();

        if (this.isEditMode) {
            const fv = this.form.value;
            const request: UpdateFeeInvoiceRequest = {
                id: this.itemId!,
                paidAmount: fv.paidAmount,
                paymentMethod: fv.paymentMethod,
                remarks: fv.remarks || undefined,
                transactionId: fv.transactionId || undefined,
                paidBy: fv.paidBy || undefined,
                receiptNumber: fv.receiptNumber || undefined
            };
            this._service.update(this.itemId!, request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: () => { this.isSaving = false; this._notificationService.success('Payment recorded'); this._router.navigate(['/fee-invoices']); },
                error: () => { this.isSaving = false; this._cdr.markForCheck(); this._notificationService.error('Error recording payment'); }
            });
        } else {
            const fv = this.form.value;
            const request: CreateFeeInvoiceRequest = {
                invoiceNumber: fv.invoiceNumber,
                studentId: fv.studentId,
                classId: fv.classId,
                academicYearId: fv.academicYearId,
                invoiceDate: this._dateUtils.formatDateForAPI(fv.invoiceDate),
                dueDate: this._dateUtils.formatDateForAPI(fv.dueDate),
                totalAmount: fv.totalAmount,
                remarks: fv.remarks || undefined,
                discountAmount: fv.discountAmount || undefined,
                taxAmount: fv.taxAmount || undefined,
                lateFeeAmount: fv.lateFeeAmount || undefined
            };
            this._service.create(request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: () => { this.isSaving = false; this._notificationService.success('Invoice created'); this._router.navigate(['/fee-invoices']); },
                error: () => { this.isSaving = false; this._cdr.markForCheck(); this._notificationService.error('Error creating invoice'); }
            });
        }
    }

    cancel(): void { this._router.navigate(['/fee-invoices']); }
    getPageTitle(): string { return this.isEditMode ? 'Record Payment' : 'Create Invoice'; }
    getSaveButtonText(): string { return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Record Payment' : 'Create'); }
    getStudentDisplayName(s: StudentDto): string { return `${s.firstName} ${s.lastName}`.trim(); }

    get netInvoiceAmount(): number {
        const fv = this.form.value;
        const total = Number(fv.totalAmount) || 0;
        const discount = Number(fv.discountAmount) || 0;
        const tax = Number(fv.taxAmount) || 0;
        const lateFee = Number(fv.lateFeeAmount) || 0;
        return total - discount + tax + lateFee;
    }

    get balanceAfterPayment(): number {
        if (!this.currentInvoice) return 0;
        const paid = Number(this.form.get('paidAmount')?.value) || 0;
        return Math.max(0, (this.currentInvoice.balanceAmount ?? 0) - paid);
    }

    get isOverpayment(): boolean {
        if (!this.currentInvoice) return false;
        const paid = Number(this.form.get('paidAmount')?.value) || 0;
        return paid > (this.currentInvoice.balanceAmount ?? 0);
    }
}
