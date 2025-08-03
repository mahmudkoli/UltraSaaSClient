export interface PersonalProfileDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    address?: string;
    profilePicture?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdatePersonalProfileRequest {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    address?: string;
    profilePicture?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
} 