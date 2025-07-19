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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UserService } from '../../../core/user/user.service';
import { CreateUserRequest, UpdateUserRequest, UserDetailsDto } from '../../../core/user/user.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'user-form',
    templateUrl: './user-form.component.html',
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
        MatSlideToggleModule,
        MatTabsModule,
        MatTooltipModule,
    ],
})
export class UserFormComponent implements OnInit, OnDestroy {
    userForm: FormGroup;
    isLoading = false;
    isSaving = false;
    userId: string | null = null;
    isEditMode = false;
    user: UserDetailsDto | null = null;
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _userService: UserService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _notificationService: NotificationService
    ) {
        this.userForm = this._formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            userName: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
            phoneNumber: [''],
            address: [''],
            gender: [''],
            dateOfBirth: ['']
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit(): void {
        this.userId = this._route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.userId;
        
        if (this.isEditMode) {
            this.loadUser();
            this.setupEditMode();
        } else {
            this.setupCreateMode();
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadUser(): void {
        if (!this.userId) return;

        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        this._userService.getUserById(this.userId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (user) => {
                    this.user = user;
                    this.populateForm(user);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading user:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    setupCreateMode(): void {
        // Remove password validators for edit mode
        this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
        this.userForm.updateValueAndValidity();
    }

    setupEditMode(): void {
        // Remove password validators for edit mode since API doesn't support password updates
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('confirmPassword')?.clearValidators();
        this.userForm.updateValueAndValidity();
    }

    populateForm(user: UserDetailsDto): void {
        this.userForm.patchValue({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            userName: user.userName || '',
            phoneNumber: user.phoneNumber || '',
            address: user.address || '',
            gender: user.gender || '',
            dateOfBirth: user.dateOfBirth || ''
        });
    }

    passwordMatchValidator(form: FormGroup): { [key: string]: any } | null {
        const password = form.get('password');
        const confirmPassword = form.get('confirmPassword');
        
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            return { passwordMismatch: true };
        }
        return null;
    }

    save(): void {
        if (this.userForm.invalid) {
            return;
        }

        this.isSaving = true;
        this._changeDetectorRef.markForCheck();

        if (this.isEditMode) {
            this.updateUser();
        } else {
            this.createUser();
        }
    }

    createUser(): void {
        const formValue = this.userForm.value;
        console.log('Form values:', formValue);
        
        // Convert date to ISO string if provided
        let dateOfBirth = null;
        if (formValue.dateOfBirth) {
            dateOfBirth = this.formatDateForAPI(formValue.dateOfBirth);
        }
        
        const request: CreateUserRequest = {
            firstName: formValue.firstName,
            lastName: formValue.lastName,
            email: formValue.email,
            userName: formValue.userName,
            password: formValue.password,
            confirmPassword: formValue.confirmPassword,
            phoneNumber: formValue.phoneNumber,
            address: formValue.address,
            gender: formValue.gender,
            dateOfBirth: dateOfBirth
        };

        console.log('Create user request:', request);

        this._userService.createUser(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    console.log('User created successfully with response:', response);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('User created successfully');
                    this._router.navigate(['/users']);
                },
                error: (error) => {
                    console.error('Create user error details:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error creating user');
                }
            });
    }

    updateUser(): void {
        if (!this.userId) return;

        const formValue = this.userForm.value;
        
        // Convert date to ISO string if provided
        let dateOfBirth = null;
        if (formValue.dateOfBirth) {
            dateOfBirth = this.formatDateForAPI(formValue.dateOfBirth);
        }
        
        const request: UpdateUserRequest = {
            id: this.userId,
            firstName: formValue.firstName,
            lastName: formValue.lastName,
            email: formValue.email,
            phoneNumber: formValue.phoneNumber,
            address: formValue.address,
            gender: formValue.gender,
            dateOfBirth: dateOfBirth
        };

        console.log('Update user request:', request);

        this._userService.updateUser(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    console.log('User updated successfully with response:', response);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('User updated successfully');
                    this._router.navigate(['/users']);
                },
                error: (error) => {
                    console.error('Update user error details:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error updating user');
                }
            });
    }

    cancel(): void {
        this._router.navigate(['/users']);
    }

    /**
     * Format date to prevent timezone issues
     * Ensures the date selected by user is preserved exactly
     */
    private formatDateForAPI(date: Date | string): string {
        if (!date) return '';
        
        const dateObj = new Date(date);
        
        // Get the date components in local timezone
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        
        // Return date in YYYY-MM-DD format to avoid timezone issues
        return `${year}-${month}-${day}`;
    }

    getPageTitle(): string {
        return this.isEditMode ? 'Edit User' : 'Create User';
    }

    getSaveButtonText(): string {
        return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update User' : 'Create User');
    }
}