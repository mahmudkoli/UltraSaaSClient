import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PayrollService } from '../../../core/payroll/payroll.service';
import { EmployeesService } from '../../../core/employees/employees.service';
import { EmployeeDto } from '../../../core/employees/employees.types';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { TenantCurrencyPipe } from '../../../shared/pipes/currency.pipe';

@Component({
    selector: 'payroll-form',
    templateUrl: './payroll-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, ListPageComponent, TenantCurrencyPipe],
})
export class PayrollFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    employees: EmployeeDto[] = [];
    saving = false;
    months = [1,2,3,4,5,6,7,8,9,10,11,12];
    monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    years: number[];
    private _destroyed$ = new Subject<void>();

    constructor(
        private _fb: FormBuilder,
        private _svc: PayrollService,
        private _employeesSvc: EmployeesService,
        private _router: Router,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
    ) {
        const now = new Date();
        this.years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];
        this.form = this._fb.group({
            employeeId: ['', Validators.required],
            periodYear: [now.getFullYear(), Validators.required],
            periodMonth: [now.getMonth() + 1, Validators.required],
            basic: [0, [Validators.required, Validators.min(0)]],
            houseAllowance: [0, [Validators.required, Validators.min(0)]],
            medicalAllowance: [0, [Validators.required, Validators.min(0)]],
            transportAllowance: [0, [Validators.required, Validators.min(0)]],
            otherAllowance: [0, [Validators.required, Validators.min(0)]],
            bonus: [0, [Validators.required, Validators.min(0)]],
            providentFund: [0, [Validators.required, Validators.min(0)]],
            tax: [0, [Validators.required, Validators.min(0)]],
            loanDeduction: [0, [Validators.required, Validators.min(0)]],
            otherDeduction: [0, [Validators.required, Validators.min(0)]],
            workingDays: [22, [Validators.required, Validators.min(0)]],
            leavesTaken: [0, [Validators.required, Validators.min(0)]],
            leavesUnpaid: [0, [Validators.required, Validators.min(0)]],
            remarks: [''],
        });
    }

    ngOnInit(): void {
        this._employeesSvc.search({ pageNumber: 1, pageSize: 500 } as any).pipe(takeUntil(this._destroyed$)).subscribe({
            next: (resp) => { this.employees = resp.data; this._cdr.markForCheck(); },
        });
    }

    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    get grossPreview(): number {
        const v = this.form.value;
        return Number(v.basic) + Number(v.houseAllowance) + Number(v.medicalAllowance) + Number(v.transportAllowance) + Number(v.otherAllowance) + Number(v.bonus);
    }
    get deductionsPreview(): number {
        const v = this.form.value;
        return Number(v.providentFund) + Number(v.tax) + Number(v.loanDeduction) + Number(v.otherDeduction);
    }
    get netPreview(): number {
        return this.grossPreview - this.deductionsPreview;
    }

    submit(): void {
        if (this.form.invalid) return;
        this.saving = true;
        this._svc.generate(this.form.value).pipe(takeUntil(this._destroyed$)).subscribe({
            next: () => { this._notify.success('Payslip generated.'); this._router.navigate(['/payroll']); },
            error: () => { this.saving = false; this._notify.error('Could not generate payslip.'); this._cdr.markForCheck(); },
        });
    }
}
