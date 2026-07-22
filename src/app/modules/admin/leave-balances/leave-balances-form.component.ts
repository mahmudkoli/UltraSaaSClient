import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { LeaveBalancesService } from '../../../core/leave-balances/leave-balances.service';
import { EmployeesService } from '../../../core/employees/employees.service';
import { EmployeeDto } from '../../../core/employees/employees.types';
import { LeaveTypesService } from '../../../core/leave-types/leave-types.service';
import { LeaveTypeDto } from '../../../core/leave-types/leave-types.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'leave-balances-form',
    templateUrl: './leave-balances-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, ListPageComponent,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, MatSelectModule,
    ],
})
export class LeaveBalancesFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    employees: EmployeeDto[] = [];
    leaveTypes: LeaveTypeDto[] = [];
    isSaving = false;
    isAdjust = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _service: LeaveBalancesService,
        private _employeesService: EmployeesService,
        private _leaveTypesService: LeaveTypesService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _route: ActivatedRoute,
        private _notificationService: NotificationService,
    ) {
        this.form = this._formBuilder.group({
            employeeId: ['', Validators.required],
            leaveTypeId: ['', Validators.required],
            year: [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
            entitled: [0, [Validators.required, Validators.min(0)]],
        });
    }

    ngOnInit(): void {
        this._employeesService.search({ pageNumber: 1, pageSize: 1000, keyword: '' })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.employees = r.data || []; this._changeDetectorRef.markForCheck(); }, error: () => {} });
        this._leaveTypesService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.leaveTypes = r.data || []; this._changeDetectorRef.markForCheck(); }, error: () => {} });

        const q = this._route.snapshot.queryParamMap;
        if (q.get('employeeId')) {
            this.isAdjust = true;
            this.form.patchValue({
                employeeId: q.get('employeeId'),
                leaveTypeId: q.get('leaveTypeId'),
                year: +(q.get('year') || new Date().getFullYear()),
                entitled: +(q.get('entitled') || 0),
            });
            // Key fields fixed when adjusting an existing balance (upsert key).
            this.form.get('employeeId')?.disable();
            this.form.get('leaveTypeId')?.disable();
            this.form.get('year')?.disable();
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.isSaving = true;
        this._changeDetectorRef.markForCheck();
        const v = this.form.getRawValue();
        this._service.set({
            employeeId: v.employeeId, leaveTypeId: v.leaveTypeId, year: +v.year, entitled: +v.entitled,
        }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: () => {
                this.isSaving = false;
                this._notificationService.success('Leave balance saved');
                this._router.navigate(['/leave-balances']);
            },
            error: () => {
                this.isSaving = false;
                this._changeDetectorRef.markForCheck();
                this._notificationService.error('Failed to save leave balance');
            },
        });
    }

    cancel(): void {
        this._router.navigate(['/leave-balances']);
    }
}
