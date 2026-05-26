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
    /** Phase 2.58 — user's preferred UI language ("en" / "bn"). Null = inherit from tenant default. */
    preferredLanguage?: string | null;
}

export interface UpdatePersonalProfileRequest {
    id: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
    /** Phase 2.58 — user's preferred UI language ("en" / "bn"). Null = inherit from tenant default. */
    preferredLanguage?: string | null;
}

export interface ChangePasswordRequest {
    password: string;
    newPassword: string;
    confirmNewPassword: string;
} 