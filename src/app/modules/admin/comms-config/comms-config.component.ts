import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { Subject, takeUntil } from 'rxjs';
import { MailConfigService, SMSConfigService } from '../../../core/comms/config.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'comms-config',
    templateUrl: './comms-config.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, MatTabsModule],
})
export class CommsConfigComponent implements OnInit, OnDestroy {
    smsForm: FormGroup;
    mailForm: FormGroup;
    loadingSms = false;
    loadingMail = false;
    savingSms = false;
    savingMail = false;
    private _destroyed$ = new Subject<void>();

    constructor(
        private _sms: SMSConfigService,
        private _mail: MailConfigService,
        private _fb: FormBuilder,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
    ) {
        this.smsForm = this._fb.group({
            apiUrl: ['', [Validators.required, Validators.maxLength(500)]],
            sid: [''],
            userId: ['', [Validators.required, Validators.maxLength(100)]],
            password: ['', [Validators.required, Validators.maxLength(200)]],
        });
        this.mailForm = this._fb.group({
            host: ['', [Validators.required, Validators.maxLength(200)]],
            port: [587, [Validators.required]],
            displayName: ['', [Validators.required, Validators.maxLength(100)]],
            from: ['', [Validators.required, Validators.email]],
            userName: ['', [Validators.required, Validators.maxLength(100)]],
            password: ['', [Validators.required, Validators.maxLength(200)]],
        });
    }

    ngOnInit(): void { this.loadSms(); this.loadMail(); }
    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    loadSms(): void {
        this.loadingSms = true;
        this._sms.get().pipe(takeUntil(this._destroyed$)).subscribe({
            next: (c) => {
                if (c) this.smsForm.patchValue({ apiUrl: c.apiUrl, sid: c.sid, userId: c.userId, password: c.password });
                this.loadingSms = false; this._cdr.markForCheck();
            },
            error: () => { this.loadingSms = false; this._cdr.markForCheck(); },
        });
    }

    loadMail(): void {
        this.loadingMail = true;
        this._mail.get().pipe(takeUntil(this._destroyed$)).subscribe({
            next: (c) => {
                if (c) this.mailForm.patchValue({ host: c.host, port: c.port, displayName: c.displayName, from: c.from, userName: c.userName, password: c.password });
                this.loadingMail = false; this._cdr.markForCheck();
            },
            error: () => { this.loadingMail = false; this._cdr.markForCheck(); },
        });
    }

    saveSms(): void {
        if (this.smsForm.invalid) return;
        this.savingSms = true;
        this._sms.upsert(this.smsForm.value).pipe(takeUntil(this._destroyed$)).subscribe({
            next: () => { this.savingSms = false; this._notify.success('SMS provider saved.'); this._cdr.markForCheck(); },
            error: () => { this.savingSms = false; this._cdr.markForCheck(); this._notify.error('SMS save failed.'); },
        });
    }

    saveMail(): void {
        if (this.mailForm.invalid) return;
        this.savingMail = true;
        this._mail.upsert(this.mailForm.value).pipe(takeUntil(this._destroyed$)).subscribe({
            next: () => { this.savingMail = false; this._notify.success('Mail provider saved.'); this._cdr.markForCheck(); },
            error: () => { this.savingMail = false; this._cdr.markForCheck(); this._notify.error('Mail save failed.'); },
        });
    }
}
