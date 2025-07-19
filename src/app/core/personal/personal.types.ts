export interface PersonalProfileDto {
    id: string;
    userName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    isActive: boolean;
    emailConfirmed: boolean;
    phoneNumber?: string;
    imageUrl?: string;
    phoneNumberConfirmed: boolean;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
}

export interface UpdatePersonalProfileRequest {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
}

export interface ChangePasswordRequest {
    password: string;
    newPassword: string;
    confirmNewPassword?: string;
}

export interface ForgotPasswordRequest {
    email: string;
    userName?: string;
}

export interface ResetPasswordRequest {
    email: string;
    token: string;
    password: string;
    confirmPassword: string;
}

export interface ConfirmEmailRequest {
    userId: string;
    code: string;
    changedEmail?: string;
}

export interface ConfirmPhoneNumberRequest {
    userId: string;
    code: string;
    phoneNumber?: string;
} 