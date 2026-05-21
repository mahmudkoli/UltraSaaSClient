// Enums from API documentation - Updated with correct values
export enum EnrollmentStatus {
    Enrolled = 1,
    Withdrawn = 2,
    Graduated = 3,
    Suspended = 4,
    Transferred = 5,
    OnLeave = 6,
    Completed = 7,
    Dropped = 8,
    Pending = 9,
    Provisional = 10
}

export enum EducationLevel {
    Primary = 1,
    Middle = 2,
    Secondary = 3,
    HigherSecondary = 4,
    Undergraduate = 5,
    Postgraduate = 6,
    Diploma = 7,
    Coaching = 8,
    TestPreparation = 9,
    SkillDevelopment = 10,
    Doctoral = 11,
    Research = 12,
    Certificate = 13,
    Basic = 14,
    Advanced = 15,
    Professional = 16,
    Foundation = 17,
    Intermediate = 18,
    Expert = 19,
    MasterClass = 20,
    Other = 21
}

export interface StudentDto {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    userName: string;
    phoneNumber?: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
    imageUrl?: string;
    isActive: boolean;
    
    // Family Information - Required fields
    fathersName: string; // Required
    fathersPhoneNumber?: string;
    fathersEmail?: string;
    fathersOccupation?: string;
    fathersIncome?: string;
    mothersName: string; // Required
    mothersPhoneNumber?: string;
    mothersEmail?: string;
    mothersOccupation?: string;
    mothersIncome?: string;
    
    // Family (Phase F4)
    familyCode?: string;

    // Guardian Information
    guardianName?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    guardianRelationship?: string;
    guardianAddress?: string;
    guardianOccupation?: string;
    
    // Emergency Contact Information
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactEmail?: string;
    emergencyContactRelationship?: string;
    emergencyContactAddress?: string;
    
    // Academic Information
    enrollmentStatus?: EnrollmentStatus;
    currentLevel?: EducationLevel;
    enrollmentDate?: string;
    graduationDate?: string;
    studentId?: string;
    rollNumber?: string;
    admissionNumber?: string;
    
    // Personal Information
    category?: string;
    religion?: string;
    nationality?: string;
    motherTongue?: string; // Missing field
    languagesKnown?: string;
    hobbies?: string;
    specialTalents?: string;
    achievements?: string; // Missing from API
    awards?: string; // Missing from API
    remarks?: string;
    notes?: string;
    specialInstructions?: string; // Missing field
}

export interface CreateStudentRequest {
    // Required fields
    firstName: string; // maxLength: 75
    lastName: string; // maxLength: 75
    userName: string;
    phoneNumber: string; // maxLength: 15
    fathersName: string; // maxLength: 100, required
    mothersName: string; // maxLength: 100, required
    
    // Optional basic info
    email?: string; // pattern: "^[^@]+@[^@]+$"
    address?: string;
    gender?: string;
    dateOfBirth?: string;
    image?: FileUploadRequest;
    
    // Family Information
    fathersPhoneNumber?: string; // maxLength: 15, pattern: "^[+]?[0-9\\s\\-\\(\\)]+$"
    fathersEmail?: string; // maxLength: 100, pattern: "^[^@]+@[^@]+$"
    fathersOccupation?: string;
    fathersIncome?: string;
    mothersPhoneNumber?: string; // maxLength: 15, pattern: "^[+]?[0-9\\s\\-\\(\\)]+$"
    mothersEmail?: string; // maxLength: 100, pattern: "^[^@]+@[^@]+$"
    mothersOccupation?: string;
    mothersIncome?: string;
    
    // Guardian Information
    guardianName?: string;
    guardianPhone?: string; // maxLength: 15, pattern: "^[+]?[0-9\\s\\-\\(\\)]+$"
    guardianEmail?: string; // maxLength: 100, pattern: "^[^@]+@[^@]+$"
    guardianRelationship?: string;
    guardianAddress?: string;
    guardianOccupation?: string;
    
    // Emergency Contact Information
    emergencyContactName?: string;
    emergencyContactPhone?: string; // maxLength: 15, pattern: "^[+]?[0-9\\s\\-\\(\\)]+$"
    emergencyContactEmail?: string; // maxLength: 100, pattern: "^[^@]+@[^@]+$"
    emergencyContactRelationship?: string;
    emergencyContactAddress?: string;
    
    // Academic Information
    enrollmentStatus?: EnrollmentStatus;
    currentLevel?: EducationLevel;
    enrollmentDate?: string;
    studentId?: string; // maxLength: 50
    rollNumber?: string; // maxLength: 20
    admissionNumber?: string; // maxLength: 50
    
    // Personal Information
    category?: string;
    religion?: string;
    nationality?: string;
    motherTongue?: string;
    languagesKnown?: string;
    hobbies?: string;
    specialTalents?: string;
    remarks?: string; // maxLength: 1000
    notes?: string; // maxLength: 1000
    specialInstructions?: string;
    
    password: string;
}

export interface UpdateStudentRequest {
    // Required fields
    id: string;
    firstName: string; // maxLength: 75
    lastName: string; // maxLength: 75
    userName: string;
    phoneNumber: string; // maxLength: 15
    fathersName: string; // maxLength: 100, required
    mothersName: string; // maxLength: 100, required
    
    // Optional basic info
    email?: string; // pattern: "^[^@]+@[^@]+$"
    address?: string;
    gender?: string;
    dateOfBirth?: string;
    image?: FileUploadRequest;
    deleteCurrentImage?: boolean;
    
    // Family Information
    fathersPhoneNumber?: string; // maxLength: 15, pattern: "^[+]?[0-9\\s\\-\\(\\)]+$"
    fathersEmail?: string; // maxLength: 100, pattern: "^[^@]+@[^@]+$"
    fathersOccupation?: string;
    fathersIncome?: string;
    mothersPhoneNumber?: string; // maxLength: 15, pattern: "^[+]?[0-9\\s\\-\\(\\)]+$"
    mothersEmail?: string; // maxLength: 100, pattern: "^[^@]+@[^@]+$"
    mothersOccupation?: string;
    mothersIncome?: string;
    
    // Guardian Information
    guardianName?: string;
    guardianPhone?: string; // maxLength: 15, pattern: "^[+]?[0-9\\s\\-\\(\\)]+$"
    guardianEmail?: string; // maxLength: 100, pattern: "^[^@]+@[^@]+$"
    guardianRelationship?: string;
    guardianAddress?: string;
    guardianOccupation?: string;
    
    // Emergency Contact Information
    emergencyContactName?: string;
    emergencyContactPhone?: string; // maxLength: 15, pattern: "^[+]?[0-9\\s\\-\\(\\)]+$"
    emergencyContactEmail?: string; // maxLength: 100, pattern: "^[^@]+@[^@]+$"
    emergencyContactRelationship?: string;
    emergencyContactAddress?: string;
    
    // Academic Information
    enrollmentStatus?: EnrollmentStatus;
    currentLevel?: EducationLevel;
    enrollmentDate?: string;
    graduationDate?: string;
    studentId?: string; // maxLength: 50
    rollNumber?: string; // maxLength: 20
    admissionNumber?: string; // maxLength: 50
    
    // Personal Information
    category?: string;
    religion?: string;
    nationality?: string;
    motherTongue?: string;
    languagesKnown?: string;
    hobbies?: string;
    specialTalents?: string;
    remarks?: string; // maxLength: 1000
    notes?: string; // maxLength: 1000
    specialInstructions?: string;
}

export interface SearchStudentsRequest {
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
    advancedSearch?: Search;
    keyword?: string;
    id?: string;
    isActive?: boolean;
}

// New interfaces for additional APIs
export interface ExportStudentsRequest {
    advancedSearch?: Search;
    keyword?: string;
    id?: string;
}

export interface ExportOptions {
    format: 'excel' | 'csv' | 'pdf';
    includeInactive?: boolean;
    selectedFields?: string[];
}

export interface ExportProgress {
    status: 'preparing' | 'exporting' | 'completed' | 'error';
    progress: number;
    message: string;
    downloadUrl?: string;
    fileName?: string;
}

export interface Search {
    fields: string[];
    keyword: string;
}

export interface FileUploadRequest {
    name: string;
    extension: string;
    data: string;
}

export interface PaginationResponse<T> {
    data: T[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
} 