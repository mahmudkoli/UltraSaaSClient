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
import { SMSTemplateDto, SMSTemplatesService } from '../../../core/comms/sms-templates.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'sms-templates',
    templateUrl: './sms-templates.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, MatTableModule, MatTooltipModule, ListPageComponent],
})
export class SmsTemplatesComponent implements OnInit, OnDestroy {
    rows: SMSTemplateDto[] = [];
    loading = false;
    saving = false;
    cols = ['title', 'message', 'actions'];
    form: FormGroup;
    editingId?: string;
    private _destroyed$ = new Subject<void>();

    constructor(private _svc: SMSTemplatesService, private _fb: FormBuilder, private _cdr: ChangeDetectorRef, private _notify: NotificationService) {
        this.form = this._fb.group({
            title: ['', [Validators.required, Validators.maxLength(100)]],
            message: ['', [Validators.required, Validators.maxLength(1000)]],
        });
    }

    ngOnInit(): void { this.load(); }
    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    load(): void {
        this.loading = true;
        this._svc.search({ pageNumber: 1, pageSize: 200 }).pipe(takeUntil(this._destroyed$)).subscribe({
            next: (r) => { this.rows = r.data; this.loading = false; this._cdr.markForCheck(); },
            error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load SMS templates.'); },
        });
    }

    edit(t: SMSTemplateDto): void { this.editingId = t.id; this.form.patchValue({ title: t.title, message: t.message }); }
    reset(): void { this.editingId = undefined; this.form.reset({ title: '', message: '' }); }

    save(): void {
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

    remove(t: SMSTemplateDto): void {
        if (!confirm(`Delete template "${t.title}"?`)) return;
        this._svc.delete(t.id).pipe(takeUntil(this._destroyed$)).subscribe({
            next: () => { this._notify.success('Deleted.'); this.load(); },
            error: () => this._notify.error('Delete failed.'),
        });
    }

    truncate(s: string, n = 80): string { return s && s.length > n ? s.slice(0, n) + '…' : s; }
}
