import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
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
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { PersonalService } from '../../../core/personal/personal.service';
import { PersonalProfileDto, UpdatePersonalProfileRequest, ChangePasswordRequest } from '../../../core/personal/personal.types';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtils } from '../../../core/utils/date.utils';

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

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _personalService: PersonalService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _notificationService: NotificationService,
        private _dateUtils: DateUtils,
    ) {
        this.profileForm = this._formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            email: [{ value: '', disabled: true }],
            phoneNumber: [''],
            address: [''],
            gender: [''],
            dateOfBirth: [''],
        });

        this.passwordForm = this._formBuilder.group({
            password: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmNewPassword: ['', [Validators.required]],
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit(): void {
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
                    });
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this._notificationService.error('Error loading profile');
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

        const request: UpdatePersonalProfileRequest = {
            id: this.profile.id,
            firstName: formValue.firstName,
            lastName: formValue.lastName,
            phoneNumber: formValue.phoneNumber,
            email: formValue.email,
            address: formValue.address,
            gender: formValue.gender,
            dateOfBirth: dateOfBirth,
        };

        this._personalService.updatePersonalProfile(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('Profile updated successfully');
                },
                error: () => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error updating profile');
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
                    this._notificationService.success('Password changed successfully');
                },
                error: () => {
                    this.isChangingPassword = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error changing password');
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
