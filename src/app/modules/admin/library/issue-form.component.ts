import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BookDto, BookIssuesService, BooksService } from '../../../core/library/library.service';
import { StudentsService } from '../../../core/students/students.service';
import { StudentDto } from '../../../core/students/students.types';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { EntityPickerComponent } from '../../../shared/components/entity-picker.component';

@Component({
    selector: 'issue-form',
    templateUrl: './issue-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, ListPageComponent, EntityPickerComponent],
})
export class IssueFormComponent implements OnInit {
    form: FormGroup;
    saving = false;
    loading = false;
    editingId?: string;

    searchBooks = (q: string): Observable<BookDto[]> =>
        this._books.search({ pageNumber: 1, pageSize: 10, keyword: q || undefined }).pipe(map(r => r.data ?? []), catchError(() => of([])));
    displayBook = (b: BookDto): string => `${b.title} — ${b.author}${b.isbn ? ' · ' + b.isbn : ''}`;
    resolveBook = (id: string): Observable<BookDto | null> =>
        this._books.getById(id).pipe(catchError(() => of(null)));
    searchStudents = (q: string): Observable<StudentDto[]> =>
        this._students.search({ pageNumber: 1, pageSize: 10, keyword: q || undefined } as any).pipe(map(r => r.data ?? []), catchError(() => of([])));
    displayStudent = (s: StudentDto): string =>
        `${s.firstName ?? ''} ${s.lastName ?? ''} ${s.rollNumber ? '· ' + s.rollNumber : ''}`.trim() || s.id;
    resolveStudent = (id: string): Observable<StudentDto | null> =>
        this._students.getById(id).pipe(catchError(() => of(null)));

    constructor(
        private _svc: BookIssuesService,
        private _books: BooksService,
        private _students: StudentsService,
        private _fb: FormBuilder,
        private _route: ActivatedRoute,
        private _router: Router,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
    ) {
        this.form = this._fb.group({
            bookId: ['', [Validators.required]],
            studentId: ['', [Validators.required]],
            issueDate: [new Date().toISOString().slice(0, 10), [Validators.required]],
            dueDate: ['', [Validators.required]],
            remarks: [''],
            returnDate: [''],
            isReturned: [false],
            fineAmount: [null],
            isFinePaid: [false],
            fineRemarks: [''],
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
                        bookId: r.bookId,
                        studentId: r.studentId,
                        issueDate: r.issueDate?.slice(0, 10),
                        dueDate: r.dueDate?.slice(0, 10),
                        remarks: r.remarks,
                        returnDate: r.returnDate?.slice(0, 10),
                        isReturned: r.isReturned,
                        fineAmount: r.fineAmount,
                        isFinePaid: r.isFinePaid,
                        fineRemarks: r.fineRemarks,
                    });
                    this.loading = false;
                    this._cdr.markForCheck();
                },
                error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load issue.'); },
            });
        }
    }

    save(): void {
        if (this.form.invalid) return;
        this.saving = true;
        const v = this.form.value;
        const obs = this.editingId
            ? this._svc.update(this.editingId, {
                id: this.editingId,
                returnDate: v.returnDate || undefined,
                remarks: v.remarks || undefined,
                isReturned: v.isReturned,
                fineAmount: v.fineAmount,
                isFinePaid: v.isFinePaid,
                fineRemarks: v.fineRemarks || undefined,
            })
            : this._svc.create({
                bookId: v.bookId,
                studentId: v.studentId,
                issueDate: v.issueDate,
                dueDate: v.dueDate,
                remarks: v.remarks || undefined,
            });
        obs.subscribe({
            next: () => { this.saving = false; this._notify.success('Saved.'); this._router.navigate(['/library/issues']); },
            error: () => { this.saving = false; this._cdr.markForCheck(); this._notify.error('Save failed.'); },
        });
    }

    cancel(): void { this._router.navigate(['/library/issues']); }
}
