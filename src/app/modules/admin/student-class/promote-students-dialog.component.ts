import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { takeUntil, Subject, forkJoin } from 'rxjs';
import { AcademicYearsService } from '../../../core/academic-years/academic-years.service';
import { AcademicYearDto } from '../../../core/academic-years/academic-years.types';
import { ClassesService } from '../../../core/classes/classes.service';
import { ClassDto } from '../../../core/classes/classes.types';
import { PromoteStudentsRequest, StudentClassesService } from '../../../core/student-classes/student-classes.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'promote-students-dialog',
    templateUrl: './promote-students-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, MatButtonModule, MatDialogModule,
        MatFormFieldModule, MatIconModule, MatSelectModule,
    ],
})
export class PromoteStudentsDialogComponent implements OnInit {
    form: FormGroup;
    classes: ClassDto[] = [];
    years: AcademicYearDto[] = [];
    saving = false;
    private _destroyed$ = new Subject<void>();

    constructor(
        private _fb: FormBuilder,
        private _classesSvc: ClassesService,
        private _yearsSvc: AcademicYearsService,
        private _scSvc: StudentClassesService,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
        public dialogRef: MatDialogRef<PromoteStudentsDialogComponent, boolean>,
    ) {
        this.form = this._fb.group({
            sourceClassId: ['', Validators.required],
            targetClassId: ['', Validators.required],
            targetAcademicYearId: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        forkJoin({
            classes: this._classesSvc.search({ pageNumber: 1, pageSize: 500 } as any),
            years: this._yearsSvc.search({ pageNumber: 1, pageSize: 50 } as any),
        }).pipe(takeUntil(this._destroyed$)).subscribe({
            next: ({ classes, years }) => {
                this.classes = classes.data ?? [];
                this.years = years.data ?? [];
                this._cdr.markForCheck();
            },
        });
    }

    submit(): void {
        if (this.form.invalid) return;
        this.saving = true;
        const v = this.form.value;
        const req: PromoteStudentsRequest = {
            sourceClassId: v.sourceClassId,
            targetClassId: v.targetClassId,
            targetAcademicYearId: v.targetAcademicYearId,
            holdBackStudentIds: [],
        };
        this._scSvc.promote(req).pipe(takeUntil(this._destroyed$)).subscribe({
            next: (resp) => {
                this._notify.success(`Promoted ${resp.promoted} students.`);
                this.dialogRef.close(true);
            },
            error: () => {
                this.saving = false;
                this._notify.error('Promotion failed.');
                this._cdr.markForCheck();
            },
        });
    }

    cancel(): void { this.dialogRef.close(false); }
}
