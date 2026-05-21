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
import { BooksService } from '../../../core/library/library.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'book-form',
    templateUrl: './book-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule],
})
export class BookFormComponent implements OnInit {
    form: FormGroup;
    saving = false;
    loading = false;
    editingId?: string;

    constructor(private _svc: BooksService, private _fb: FormBuilder, private _route: ActivatedRoute, private _router: Router, private _cdr: ChangeDetectorRef, private _notify: NotificationService) {
        this.form = this._fb.group({
            title: ['', [Validators.required, Validators.maxLength(200)]],
            isbn: ['', [Validators.required, Validators.maxLength(20)]],
            author: ['', [Validators.required, Validators.maxLength(150)]],
            publisher: [''],
            publicationDate: [''],
            edition: [''],
            category: [''],
            subject: [''],
            totalCopies: [1, [Validators.required, Validators.min(0)]],
            availableCopies: [1, [Validators.required, Validators.min(0)]],
            isActive: [true],
            description: [''],
            location: [''],
            price: [null],
        });
    }

    ngOnInit(): void {
        const id = this._route.snapshot.paramMap.get('id');
        if (id) {
            this.editingId = id;
            this.loading = true;
            this._svc.getById(id).subscribe({
                next: (b) => {
                    this.form.patchValue(b);
                    this.loading = false;
                    this._cdr.markForCheck();
                },
                error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load book.'); },
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
            next: () => { this.saving = false; this._notify.success('Saved.'); this._router.navigate(['/library/books']); },
            error: () => { this.saving = false; this._cdr.markForCheck(); this._notify.error('Save failed.'); },
        });
    }

    cancel(): void { this._router.navigate(['/library/books']); }
}
