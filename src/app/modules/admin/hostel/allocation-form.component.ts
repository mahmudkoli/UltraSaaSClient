import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HostelDto, HostelsService, StudentHostelsService } from '../../../core/hostel/hostel.service';
import { StudentsService } from '../../../core/students/students.service';
import { StudentDto } from '../../../core/students/students.types';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { EntityPickerComponent } from '../../../shared/components/entity-picker.component';

@Component({
    selector: 'allocation-form',
    templateUrl: './allocation-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, MatSelectModule, ListPageComponent, EntityPickerComponent],
})
export class AllocationFormComponent implements OnInit {
    form: FormGroup;
    saving = false;
    loading = false;
    editingId?: string;
    statuses = [{ v: 1, l: 'Active' }, { v: 2, l: 'CheckedOut' }, { v: 3, l: 'Suspended' }, { v: 4, l: 'Inactive' }];

    // Phase v1-O (carry-forward) — entity-picker bindings.
    searchStudents = (q: string): Observable<StudentDto[]> =>
        this._students.search({ pageNumber: 1, pageSize: 10, keyword: q || undefined } as any).pipe(map(r => r.data ?? []), catchError(() => of([])));
    displayStudent = (s: StudentDto): string =>
        `${s.firstName ?? ''} ${s.lastName ?? ''} ${s.rollNumber ? '· ' + s.rollNumber : ''}`.trim() || s.id;
    resolveStudent = (id: string): Observable<StudentDto | null> =>
        this._students.getById(id).pipe(catchError(() => of(null)));
    searchHostels = (q: string): Observable<HostelDto[]> =>
        this._hostels.search({ pageNumber: 1, pageSize: 10, keyword: q || undefined }).pipe(map(r => r.data ?? []), catchError(() => of([])));
    displayHostel = (h: HostelDto): string => `${h.name} (${h.code})`;
    resolveHostel = (id: string): Observable<HostelDto | null> =>
        this._hostels.getById(id).pipe(catchError(() => of(null)));

    constructor(
        private _svc: StudentHostelsService,
        private _students: StudentsService,
        private _hostels: HostelsService,
        private _fb: FormBuilder,
        private _route: ActivatedRoute,
        private _router: Router,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
    ) {
        this.form = this._fb.group({
            studentId: ['', [Validators.required]],
            hostelId: ['', [Validators.required]],
            roomNumber: ['', [Validators.required]],
            checkInDate: [new Date().toISOString().slice(0, 10), [Validators.required]],
            checkOutDate: [''],
            status: [1, [Validators.required]],
            monthlyFee: [0, [Validators.required]],
            bedNumber: [''],
            floor: [''],
            block: [''],
            emergencyContact: [''],
            emergencyPhone: [''],
            remarks: [''],
            checkOutRemarks: [''],
        });
    }

    ngOnInit(): void {
        const id = this._route.snapshot.paramMap.get('id');
        if (id) {
            this.editingId = id;
            this.loading = true;
            this._svc.getById(id).subscribe({
                next: (r) => {
                    this.form.patchValue({
                        ...r,
                        checkInDate: r.checkInDate?.slice(0, 10),
                        checkOutDate: r.checkOutDate?.slice(0, 10),
                    });
                    this.loading = false; this._cdr.markForCheck();
                },
                error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load allocation.'); },
            });
        }
    }

    save(): void {
        if (this.form.invalid) return;
        this.saving = true;
        const v = this.form.value;
        const obs = this.editingId
            ? this._svc.update(this.editingId, { id: this.editingId, ...v })
            : this._svc.create(v);
        obs.subscribe({
            next: () => { this.saving = false; this._notify.success('Saved.'); this._router.navigate(['/hostels/allocations']); },
            error: () => { this.saving = false; this._cdr.markForCheck(); this._notify.error('Save failed.'); },
        });
    }

    cancel(): void { this._router.navigate(['/hostels/allocations']); }
}
