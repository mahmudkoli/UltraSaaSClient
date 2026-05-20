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
import { LeavesService } from '../../../core/leaves/leaves.service';
import { LeaveType } from '../../../core/leaves/leaves.types';
import { TeachersService } from '../../../core/teachers/teachers.service';
import { TeacherDto } from '../../../core/teachers/teachers.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'leave-form',
    templateUrl: './leave-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
})
export class LeaveFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    teachers: TeacherDto[] = [];
    saving = false;
    types: LeaveType[] = ['Casual', 'Sick', 'Earned', 'Maternity', 'Paternity', 'Unpaid', 'Compensatory', 'Other'];
    private _destroyed$ = new Subject<void>();

    constructor(
        private _fb: FormBuilder,
        private _svc: LeavesService,
        private _teachersSvc: TeachersService,
        private _router: Router,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
    ) {
        const today = new Date().toISOString().slice(0, 10);
        this.form = this._fb.group({
            teacherId: ['', Validators.required],
            type: ['Casual' as LeaveType, Validators.required],
            fromDate: [today, Validators.required],
            toDate: [today, Validators.required],
            reason: ['', [Validators.required, Validators.maxLength(500)]],
        });
    }

    ngOnInit(): void {
        this._teachersSvc.search({ pageNumber: 1, pageSize: 500 } as any).pipe(takeUntil(this._destroyed$)).subscribe({
            next: (resp) => { this.teachers = resp.data; this._cdr.markForCheck(); },
        });
    }

    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    submit(): void {
        if (this.form.invalid) return;
        this.saving = true;
        const v = this.form.value;
        this._svc.apply({
            teacherId: v.teacherId,
            type: v.type,
            fromDate: new Date(v.fromDate).toISOString(),
            toDate: new Date(v.toDate).toISOString(),
            reason: v.reason,
        }).pipe(takeUntil(this._destroyed$)).subscribe({
            next: () => { this._notify.success('Leave submitted.'); this._router.navigate(['/leaves']); },
            error: () => { this.saving = false; this._notify.error('Could not submit leave.'); this._cdr.markForCheck(); },
        });
    }
}
