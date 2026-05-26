import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { PersonalService } from '../../../core/personal/personal.service';
import { PersonalProfileDto, UpdatePersonalProfileRequest, ChangePasswordRequest } from '../../../core/personal/personal.types';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtils } from '../../../core/utils/date.utils';
import { LanguageService } from '../../../core/i18n/language.service';
import { TenantInfoService } from '../../../core/auth/tenant-info.service';

@Component({
    selector: 'profile',
    templateUrl: './profile.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatNativeDateModule,
        MatProgressBarModule,
        MatSelectModule,
        MatTabsModule,
        TranslocoModule,
    ],
})
export class ProfileComponent implements OnInit, OnDestroy {
    profileForm: FormGroup;
    passwordForm: FormGroup;
    profile: PersonalProfileDto | null = null;
    isLoading = false;
    isSaving = false;
    isChangingPassword = false;
    activeTab = 0;
    forcePasswordChange = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private readonly _transloco = inject(TranslocoService);
    private readonly _languageService = inject(LanguageService);
    private readonly _tenantInfo = inject(TenantInfoService);

    constructor(
        private _formBuilder: FormBuilder,
        private _personalService: PersonalService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _notificationService: NotificationService,
        private _dateUtils: DateUtils,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
    ) {
        this.profileForm = this._formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            email: [{ value: '', disabled: true }],
            phoneNumber: [''],
            address: [''],
            gender: [''],
            dateOfBirth: [''],
            // Phase 2.58 — null = inherit tenant default, else 'en' / 'bn'
            preferredLanguage: [null as string | null],
        });

        this.passwordForm = this._formBuilder.group({
            password: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmNewPassword: ['', [Validators.required]],
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit(): void {
        // Sign-in component routes here with `?force_password_change=true` when
        // the user is on the seed password. Pin them on the Change Password tab
        // and surface a banner so they know what's expected.
        if (this._activatedRoute.snapshot.queryParamMap.get('force_password_change') === 'true') {
            this.forcePasswordChange = true;
            this.activeTab = 1;
        }
        this.loadProfile();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadProfile(): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        this._personalService.getPersonalProfile()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (profile) => {
                    this.profile = profile;
                    this.profileForm.patchValue({
                        firstName: profile.firstName || '',
                        lastName: profile.lastName || '',
                        email: profile.email || '',
                        phoneNumber: profile.phoneNumber || '',
                        address: profile.address || '',
                        gender: profile.gender || '',
                        dateOfBirth: profile.dateOfBirth || '',
                        preferredLanguage: profile.preferredLanguage ?? null,
                    });
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this._notificationService.error(this._transloco.translate('ADMIN.PROFILE.TOAST_LOAD_ERROR'));
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
            });
    }

    saveProfile(): void {
        if (this.profileForm.invalid) return;

        this.isSaving = true;
        this._changeDetectorRef.markForCheck();

        const formValue = this.profileForm.getRawValue();
        let dateOfBirth = null;
        if (formValue.dateOfBirth) {
            dateOfBirth = this._dateUtils.formatDateForAPI(formValue.dateOfBirth);
        }

        const newPreferredLanguage: string | null = formValue.preferredLanguage ?? null;

        const request: UpdatePersonalProfileRequest = {
            id: this.profile.id,
            firstName: formValue.firstName,
            lastName: formValue.lastName,
            phoneNumber: formValue.phoneNumber,
            email: formValue.email,
            address: formValue.address,
            gender: formValue.gender,
            dateOfBirth: dateOfBirth,
            preferredLanguage: newPreferredLanguage,
        };

        this._personalService.updatePersonalProfile(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success(this._transloco.translate('ADMIN.PROFILE.TOAST_UPDATED'));

                    // Phase 2.58 — apply language change immediately
                    if (newPreferredLanguage) {
                        this._languageService.setActiveLang(newPreferredLanguage);
                    } else {
                        const tenantDefault = this._tenantInfo.info()?.defaultLanguage ?? null;
                        this._languageService.applyFromServer(null, tenantDefault);
                    }
                },
                error: () => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error(this._transloco.translate('ADMIN.PROFILE.TOAST_UPDATE_FAILED'));
                },
            });
    }

    changePassword(): void {
        if (this.passwordForm.invalid) return;

        this.isChangingPassword = true;
        this._changeDetectorRef.markForCheck();

        const formValue = this.passwordForm.value;
        const request: ChangePasswordRequest = {
            password: formValue.password,
            newPassword: formValue.newPassword,
            confirmNewPassword: formValue.confirmNewPassword,
        };

        this._personalService.changePassword(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    this.isChangingPassword = false;
                    this.passwordForm.reset();
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success(this._transloco.translate('ADMIN.PROFILE.TOAST_PASSWORD_CHANGED'));

                    // If we got here via the forced-change flow, drop the
                    // banner and route the user into the app proper. The next
                    // token they get (refresh or re-login) won't carry the
                    // claim anymore — backend already cleared the flag.
                    if (this.forcePasswordChange) {
                        this.forcePasswordChange = false;
                        this._router.navigateByUrl('/signed-in-redirect');
                    }
                },
                error: () => {
                    this.isChangingPassword = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error(this._transloco.translate('ADMIN.PROFILE.TOAST_PASSWORD_FAILED'));
                },
            });
    }

    passwordMatchValidator(form: FormGroup): { [key: string]: any } | null {
        const newPassword = form.get('newPassword');
        const confirmNewPassword = form.get('confirmNewPassword');
        if (newPassword && confirmNewPassword && newPassword.value !== confirmNewPassword.value) {
            return { passwordMismatch: true };
        }
        return null;
    }
}
