import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BroadcastsService } from '../../../core/notifications/broadcasts.service';
import { ClassesService } from '../../../core/classes/classes.service';
import { ClassDto } from '../../../core/classes/classes.types';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';

@Component({
    selector: 'broadcast',
    templateUrl: './broadcast.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, ListPageComponent],
})
export class BroadcastComponent implements OnInit, OnDestroy {
    form: FormGroup;
    classes: ClassDto[] = [];
    sending = false;
    private _destroyed$ = new Subject<void>();

    constructor(
        private _fb: FormBuilder,
        private _svc: BroadcastsService,
        private _classesSvc: ClassesService,
        private _cdr: ChangeDetectorRef,
        private _confirm: FuseConfirmationService,
        private _notify: NotificationService,
    ) {
        this.form = this._fb.group({
            classId: [''],
            message: ['', [Validators.required, Validators.maxLength(640)]],
        });
    }

    ngOnInit(): void {
        this._classesSvc.search({ pageNumber: 1, pageSize: 500 } as any).pipe(takeUntil(this._destroyed$)).subscribe({
            next: (r) => { this.classes = r.data; this._cdr.markForCheck(); },
        });
    }

    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    get charCount(): number { return (this.form.value.message ?? '').length; }
    get smsCount(): number { return Math.max(1, Math.ceil(this.charCount / 160)); }

    send(): void {
        if (this.form.invalid) return;
        const v = this.form.value;
        const target = v.classId
            ? `class "${this.classes.find(c => c.id === v.classId)?.name ?? '—'}"`
            : 'the entire school';
        const ref = this._confirm.open({
            title: 'Send SMS broadcast?',
            message: `This will send the message to all guardian phones for enrolled students in ${target}. SMS provider charges apply.`,
            actions: { confirm: { show: true, label: 'Send', color: 'primary' }, cancel: { show: true, label: 'Cancel' } },
            icon: { show: true, name: 'heroicons_outline:megaphone', color: 'primary' },
            dismissible: true,
        });
        ref.afterClosed().pipe(takeUntil(this._destroyed$)).subscribe((ok) => {
            if (ok !== 'confirmed') return;
            this.sending = true;
            this._svc.sendSms({ classId: v.classId || undefined, message: v.message }).pipe(takeUntil(this._destroyed$)).subscribe({
                next: (r) => {
                    this.sending = false;
                    this._notify.success(`Broadcast sent to ${r.recipientNumbers} guardian phones across ${r.studentsTargeted} students.`);
                    this.form.patchValue({ message: '' });
                    this._cdr.markForCheck();
                },
                error: () => {
                    this.sending = false;
                    this._notify.error('Broadcast failed. Check SMS provider config.');
                    this._cdr.markForCheck();
                },
            });
        });
    }
}
