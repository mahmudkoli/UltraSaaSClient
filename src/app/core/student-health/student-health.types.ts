export enum BloodGroup {
    APositive = 0,
    ANegative = 1,
    BPositive = 2,
    BNegative = 3,
    ABPositive = 4,
    ABNegative = 5,
    OPositive = 6,
    ONegative = 7
}

export interface StudentHealthDto {
    id: string;
    studentId: string;
    studentName?: string;
    bloodGroup?: BloodGroup;
    height?: string;
    weight?: string;
    bmi?: string;
    visionLeft?: string;
    visionRight?: string;
    dentalHealth?: string;
    hearingStatus?: string;
    physicalDisabilities?: string;
    identificationMarks?: string;
    medicalConditions?: string;
    chronicDiseases?: string;
    allergies?: string;
    medications?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    lastCheckupDate?: string;
    nextCheckupDate?: string;
    vaccinationStatus?: string;
    healthInsurance?: string;
    insuranceNumber?: string;
    familyDoctor?: string;
    doctorPhone?: string;
    remarks?: string;
}

export interface CreateStudentHealthRequest {
    studentId: string;
    bloodGroup?: BloodGroup;
    height?: string;
    weight?: string;
    medicalConditions?: string;
    allergies?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    familyDoctor?: string;
    doctorPhone?: string;
    remarks?: string;
}

export interface UpdateStudentHealthRequest {
    id: string;
    studentId: string;
    bloodGroup?: BloodGroup;
    height?: string;
    weight?: string;
    medicalConditions?: string;
    allergies?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    familyDoctor?: string;
    doctorPhone?: string;
    remarks?: string;
}

export interface SearchStudentHealthsRequest {
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
    advancedSearch?: Search;
    keyword?: string;
}

export interface Search {
    fields: string[];
    keyword: string;
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

// Health Analytics interfaces
export interface HealthAnalytics {
    totalRecords: number;
    bloodGroupDistribution: BloodGroupStats[];
    bmiDistribution: BMICategory[];
    commonAllergies: AllergyStats[];
    medicalConditionsCount: number;
    emergencyContactsCount: number;
    healthAlerts: HealthAlert[];
}

export interface BloodGroupStats {
    bloodGroup: BloodGroup;
    bloodGroupLabel: string;
    count: number;
    percentage: number;
}

export interface BMICategory {
    category: string;
    range: string;
    count: number;
    percentage: number;
    color: string;
}

export interface AllergyStats {
    allergy: string;
    count: number;
    percentage: number;
}

export interface HealthAlert {
    id: string;
    studentId: string;
    studentName: string;
    type: 'missing_data' | 'checkup_due' | 'medication_alert' | 'emergency';
    message: string;
    severity: 'low' | 'medium' | 'high';
    createdAt: string;
} 