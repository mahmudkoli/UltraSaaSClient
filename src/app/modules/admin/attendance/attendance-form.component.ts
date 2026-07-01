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
import { AttendancesService } from '../../../core/attendances/attendances.service';
import { AttendanceDto, AttendanceStatus, CreateAttendanceRequest, UpdateAttendanceRequest } from '../../../core/attendances/attendances.types';
import { StudentClassesService } from '../../../core/student-classes/student-classes.service';
import { ClassesService } from '../../../core/classes/classes.service';
import { ClassDto } from '../../../core/classes/classes.types';
import { SubjectsService } from '../../../core/subjects/subjects.service';
import { SubjectDto } from '../../../core/subjects/subjects.types';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtils } from '../../../core/utils/date.utils';
import { UserService } from '../../../core/user/user.service';

@Component({
    selector: 'attendance-form',
    templateUrl: './attendance-form.component.html',
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
export class AttendanceFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isEditMode = false;
    isLoading = false;
    isSaving = false;
    itemId: string | null = null;

    // Students enrolled in the currently-selected class (Class drives Student).
    classStudents: { id: string; name: string }[] = [];
    classes: ClassDto[] = [];
    subjects: SubjectDto[] = [];
    isLoadingStudents = false;

    currentUserId: string = '00000000-0000-0000-0000-000000000000';

    statusOptions = [
        { value: AttendanceStatus.Present, label: 'Present' },
        { value: AttendanceStatus.Absent, label: 'Absent' },
        { value: AttendanceStatus.Late, label: 'Late' },
        { value: AttendanceStatus.HalfDay, label: 'Half Day' },
        { value: AttendanceStatus.Excused, label: 'Excused' },
        { value: AttendanceStatus.Medical, label: 'Medical' },
        { value: AttendanceStatus.Holiday, label: 'Holiday' },
        { value: AttendanceStatus.Weekend, label: 'Weekend' }
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _service: AttendancesService,
        private _studentClassesService: StudentClassesService,
        private _classesService: ClassesService,
        private _subjectsService: SubjectsService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _notificationService: NotificationService,
        private _dateUtils: DateUtils,
        private _userService: UserService
    ) {
        this.form = this.createForm();
    }

    ngOnInit(): void {
        this.itemId = this._route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.itemId;
        this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe(user => {
            if (user?.id) { this.currentUserId = user.id; }
            // Auto-fill "Marked By" with the logged-in user (create mode, if untouched).
            if (user?.name) {
                const ctrl = this.form.get('markedByName');
                if (!this.isEditMode && ctrl && !ctrl.value) { ctrl.setValue(user.name); }
            }
            this._cdr.markForCheck();
        });
        // Class drives Student: picking a class loads its roster and clears any
        // previously-chosen student so you can't record against the wrong class.
        if (!this.isEditMode) {
            this.form.get('classId')?.valueChanges
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((classId: string) => {
                    this.form.get('studentId')?.setValue('');
                    this.loadClassStudents(classId);
                });
        }
        this.loadDropdowns();
        if (this.isEditMode) { this.loadItem(); }
    }

    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

    /** Load the students enrolled in a class into classStudents (via StudentClasses). */
    loadClassStudents(classId: string): void {
        if (!classId) { this.classStudents = []; this._cdr.markForCheck(); return; }
        this.isLoadingStudents = true;
        this._cdr.markForCheck();
        this._studentClassesService.search({ pageNumber: 1, pageSize: 500, classId })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (r) => {
                    this.classStudents = r.data.map(e => ({ id: e.studentId, name: e.studentName }));
                    this.isLoadingStudents = false;
                    this._cdr.markForCheck();
                },
                error: () => { this.isLoadingStudents = false; this._cdr.markForCheck(); }
            });
    }

    /** Check-In/Out only make sense when the student was physically present. */
    get showTimeFields(): boolean {
        const s = this.form.get('status')?.value;
        return s === AttendanceStatus.Present || s === AttendanceStatus.Late || s === AttendanceStatus.HalfDay;
    }

    createForm(): FormGroup {
        return this._formBuilder.group({
            studentId: ['', [Validators.required]],
            classId: ['', [Validators.required]],
            subjectId: [''],
            date: [new Date(), [Validators.required]],
            status: [AttendanceStatus.Present, [Validators.required]],
            remarks: [''],
            checkInTime: [''],
            checkOutTime: [''],
            markedByName: ['']
        });
    }

    loadDropdowns(): void {
        this._classesService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.classes = r.data; this._cdr.markForCheck(); }, error: () => {} });
        this._subjectsService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.subjects = r.data; this._cdr.markForCheck(); }, error: () => {} });
    }

    loadItem(): void {
        if (!this.itemId) return;
        this.isLoading = true;
        this._cdr.markForCheck();
        this._service.getById(this.itemId).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item: AttendanceDto) => {
                this.form.patchValue({
                    studentId: item.studentId,
                    classId: item.classId,
                    subjectId: item.subjectId,
                    date: item.date ? new Date(item.date) : null,
                    status: item.status,
                    remarks: item.remarks,
                    checkInTime: item.checkInTime,
                    checkOutTime: item.checkOutTime,
                    markedByName: item.markedByName
                });
                // Populate the roster so the (disabled) student select can display the name.
                this.loadClassStudents(item.classId);
                this.form.get('studentId')?.disable();
                this.form.get('classId')?.disable();
                this.form.get('subjectId')?.disable();
                this.form.get('date')?.disable();
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: () => { this._notificationService.error('Error loading attendance record'); this.isLoading = false; this._cdr.markForCheck(); }
        });
    }

    save(): void {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        this.isSaving = true;
        this._cdr.markForCheck();

        if (this.isEditMode) {
            const request: UpdateAttendanceRequest = {
                id: this.itemId!,
                status: this.form.get('status')?.value,
                remarks: this.form.get('remarks')?.value || undefined,
                checkInTime: this.form.get('checkInTime')?.value || undefined,
                checkOutTime: this.form.get('checkOutTime')?.value || undefined
            };
            this._service.update(this.itemId!, request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: () => { this.isSaving = false; this._notificationService.success('Attendance updated'); this._router.navigate(['/attendances']); },
                error: () => { this.isSaving = false; this._cdr.markForCheck(); this._notificationService.error('Error updating attendance'); }
            });
        } else {
            const fv = this.form.value;
            const request: CreateAttendanceRequest = {
                studentId: fv.studentId,
                classId: fv.classId,
                subjectId: fv.subjectId || undefined,
                date: this._dateUtils.formatDateForAPI(fv.date),
                status: fv.status,
                markedBy: this.currentUserId,
                remarks: fv.remarks || undefined,
                checkInTime: fv.checkInTime || undefined,
                checkOutTime: fv.checkOutTime || undefined,
                markedByName: fv.markedByName || undefined
            };
            this._service.create(request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: () => { this.isSaving = false; this._notificationService.success('Attendance marked'); this._router.navigate(['/attendances']); },
                error: () => { this.isSaving = false; this._cdr.markForCheck(); this._notificationService.error('Error marking attendance'); }
            });
        }
    }

    cancel(): void { this._router.navigate(['/attendances']); }
    getPageTitle(): string { return this.isEditMode ? 'Edit Attendance' : 'Mark Attendance'; }
    getSaveButtonText(): string { return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update' : 'Save'); }
}
