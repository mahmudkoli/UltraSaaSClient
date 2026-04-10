export enum FeeCategory {
    Tuition = 1, Registration = 2, Admission = 3, Examination = 4, Library = 5,
    Laboratory = 6, Development = 7, Security = 8, Caution = 9, Transport = 10,
    Hostel = 11, Sports = 12, Cultural = 13, Equipment = 14, Material = 15,
    Seminar = 16, Project = 17, Thesis = 18, CourseFee = 19, MockTestFee = 20,
    StudyMaterial = 21, Workshop = 22, Certification = 23, Technology = 24,
    Infrastructure = 25, Maintenance = 26, Insurance = 27, Medical = 28,
    Counseling = 29, Career = 30, Placement = 31, Alumni = 32, International = 33,
    Exchange = 34, Research = 35, Publication = 36, Conference = 37, Travel = 38,
    Accommodation = 39, Meal = 40, Uniform = 41, Other = 99
}

export enum FeeFrequency {
    OneTime = 1, Monthly = 2, Quarterly = 3, SemiAnnually = 4, Annually = 5,
    PerSession = 6, PerCourse = 7, PerSemester = 8, PerTrimester = 9,
    Weekly = 10, Daily = 11
}

export interface FeeTypeDto {
    id: string;
    name: string;
    code: string;
    description?: string;
    isActive: boolean;
    frequency: FeeFrequency;
    defaultAmount: number;
    isRefundable: boolean;
    category: FeeCategory;
    applicableLevel?: number;
    applicableInstitutionType?: number;
    isTaxable: boolean;
    taxPercentage?: number;
    isDiscountable: boolean;
    maxDiscountPercentage?: number;
    createdOn: string;
    lastModifiedOn?: string;
}

export interface CreateFeeTypeRequest {
    name: string;
    code: string;
    description?: string;
    frequency: FeeFrequency;
    defaultAmount: number;
    category: FeeCategory;
    isRefundable: boolean;
    applicableLevel?: number;
    applicableInstitutionType?: number;
    isTaxable: boolean;
    taxPercentage?: number;
    isDiscountable: boolean;
    maxDiscountPercentage?: number;
}

export interface UpdateFeeTypeRequest {
    id: string;
    name: string;
    code: string;
    description?: string;
    frequency: FeeFrequency;
    defaultAmount: number;
    category: FeeCategory;
    isRefundable: boolean;
    applicableLevel?: number;
    applicableInstitutionType?: number;
    isTaxable: boolean;
    taxPercentage?: number;
    isDiscountable: boolean;
    maxDiscountPercentage?: number;
}

export interface SearchFeeTypesRequest {
    pageNumber: number;
    pageSize: number;
    keyword?: string;
}

export { PaginationResponse } from '../students/students.types';
