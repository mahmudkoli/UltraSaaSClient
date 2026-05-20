import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { GradeBandDto, GradeBandsService } from '../../../core/grade-bands/grade-bands.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'grade-bands',
    templateUrl: './grade-bands.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, MatTableModule],
})
export class GradeBandsComponent implements OnInit, OnDestroy {
    bands: GradeBandDto[] = [];
    loading = false;
    saving = false;
    cols = ['label', 'range', 'gpa', 'displayOrder', 'actions'];
    form: FormGroup;
    editingId?: string;
    private _destroyed$ = new Subject<void>();

    constructor(
        private _svc: GradeBandsService,
        private _fb: FormBuilder,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
    ) {
        this.form = this._fb.group({
            label: ['', [Validators.required, Validators.maxLength(8)]],
            lowerPercent: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
            upperPercent: [100, [Validators.required, Validators.min(0), Validators.max(100)]],
            gpa: [null],
            displayOrder: [0, [Validators.required]],
        });
    }

    ngOnInit(): void { this.load(); }
    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    load(): void {
        this.loading = true;
        this._svc.list().pipe(takeUntil(this._destroyed$)).subscribe({
            next: (rows) => { this.bands = rows; this.loading = false; this._cdr.markForCheck(); },
            error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load grade bands.'); },
        });
    }

    edit(b: GradeBandDto): void {
        this.editingId = b.id;
        this.form.patchValue({
            label: b.label,
            lowerPercent: b.lowerPercent,
            upperPercent: b.upperPercent,
            gpa: b.gpa,
            displayOrder: b.displayOrder,
        });
    }

    reset(): void {
        this.editingId = undefined;
        this.form.reset({ label: '', lowerPercent: 0, upperPercent: 100, gpa: null, displayOrder: 0 });
    }

    submit(): void {
        if (this.form.invalid) return;
        this.saving = true;
        const v = this.form.value;
        const obs = this.editingId
            ? this._svc.update(this.editingId, { id: this.editingId, ...v })
            : this._svc.create(v);
        obs.pipe(takeUntil(this._destroyed$)).subscribe({
            next: () => { this.saving = false; this._notify.success('Saved.'); this.reset(); this.load(); },
            error: () => { this.saving = false; this._cdr.markForCheck(); this._notify.error('Save failed.'); },
        });
    }

    remove(b: GradeBandDto): void {
        if (!confirm(`Delete grade band "${b.label}"?`)) return;
        this._svc.delete(b.id).pipe(takeUntil(this._destroyed$)).subscribe({
            next: () => { this._notify.success('Deleted.'); this.load(); },
            error: () => this._notify.error('Delete failed.'),
        });
    }
}
