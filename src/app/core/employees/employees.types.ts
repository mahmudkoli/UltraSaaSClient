// Generic HR enums — values MUST match the BE (Core/Domain/Common/Enums).
export enum Designation {
    ChiefExecutive = 1,
    Director = 2,
    GeneralManager = 3,
    Manager = 4,
    DeputyManager = 5,
    AssistantManager = 6,
    TeamLead = 7,
    SeniorExecutive = 8,
    Executive = 9,
    Officer = 10,
    Assistant = 11,
    Trainee = 12,
    Intern = 13,
    Consultant = 14,
    Other = 15
}

export enum Department {
    HumanResources = 1,
    Finance = 2,
    Accounts = 3,
    InformationTechnology = 4,
    Operations = 5,
    Sales = 6,
    Marketing = 7,
    CustomerSupport = 8,
    Administration = 9,
    Procurement = 10,
    Legal = 11,
    ResearchAndDevelopment = 12,
    Production = 13,
    QualityAssurance = 14,
    Logistics = 15,
    Other = 16
}

export enum EmploymentStatus {
    Active = 1,
    Inactive = 2,
    Resigned = 3,
    Terminated = 4,
    Retired = 5,
    OnLeave = 6,
    Suspended = 7
}

export enum EmploymentType {
    FullTime = 1,
    PartTime = 2,
    Contract = 3,
    Temporary = 4,
    Intern = 5,
    Consultant = 6,
    Volunteer = 7
}

export enum WorkShift {
    Morning = 1,
    Afternoon = 2,
    Evening = 3,
    Night = 4,
    Split = 5,
    Flexible = 6
}

export enum PerformanceRating {
    Excellent = 1,
    VeryGood = 2,
    Good = 3,
    Satisfactory = 4,
    NeedsImprovement = 5,
    Unsatisfactory = 6
}

export interface EmployeeDto {
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
    
    // Professional Information
    designation?: Designation;
    department?: Department;
    employeeId?: string;
    employeeCode?: string;
    joiningDate?: string;
    confirmationDate?: string;
    resignationDate?: string;
    lastWorkingDate?: string;
    employmentStatus?: EmploymentStatus;
    employmentType?: EmploymentType;
    workLocation?: string;
    workShift?: WorkShift;
    workingHours?: number;
    
    // Experience Information
    totalExperience?: number;
    previousEmployers?: string;
    previousPositions?: string;
    experienceDetails?: string;
    achievements?: string;
    awards?: string;
    
    // Salary Information
    basicSalary?: number;
    grossSalary?: number;
    netSalary?: number;
    salaryStructure?: string;
    allowances?: string;
    benefits?: string;
    
    // Financial Information
    bankName?: string;
    bankAccountNumber?: string;
    ifsCode?: string;
    panNumber?: string;
    aadharNumber?: string;
    pfNumber?: string;
    esiNumber?: string;

    // Mobile financial service (BD: bKash / Nagad / Rocket)
    mfsProvider?: string;
    mfsAccountNumber?: string;

    // Org assignment (S1.2/S1.3 org-config entity refs)
    reportsToId?: string;
    locationId?: string;
    costCentreId?: string;
    departmentId?: string;
    designationId?: string;

    // Organizational Information
    reportingTo?: string;
    subordinates?: string;
    roles?: string;
    responsibilities?: string;
    committees?: string;
    projects?: string;

    // Teaching Information

    // Performance Information
    performanceRating?: PerformanceRating;
    lastAppraisalDate?: string;
    appraisalComments?: string;
    improvementAreas?: string;
    trainingNeeds?: string;
    careerGoals?: string;
    isProbationPeriod?: boolean;
    probationEndDate?: string;
    
    // Emergency Contact Information
    emergencyContact?: string;
    emergencyPhone?: string;
    emergencyEmail?: string;
    emergencyAddress?: string;
    emergencyRelationship?: string;
    
    // Document Information
    resume?: string;
    appointmentLetter?: string;
    joiningReport?: string;
    relievingLetter?: string;
    experienceCertificate?: string;
    salarySlips?: string;
    form16?: string;
    taxDocuments?: string;
    medicalCertificate?: string;
    characterCertificate?: string;
    policeVerification?: string;
    addressProof?: string;
    educationalCertificates?: string;
    
    // Personal Information
    languagesKnown?: string;
    hobbies?: string;
    specialSkills?: string;
    interests?: string;
    remarks?: string;
    notes?: string;
    deactivationReason?: string;
    deactivationDate?: string;
}

export interface CreateEmployeeRequest {
    firstName: string;
    lastName: string;
    email?: string;
    userName: string;
    phoneNumber: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
    image?: FileUploadRequest;
    
    // Professional Information
    designation?: Designation;
    department?: Department;
    employeeId?: string;
    employeeCode?: string;
    joiningDate?: string;
    confirmationDate?: string;
    employmentStatus?: EmploymentStatus;
    employmentType?: EmploymentType;
    workLocation?: string;
    workShift?: WorkShift;
    workingHours?: number;
    
    // Experience Information
    totalExperience?: number;
    previousEmployers?: string;
    previousPositions?: string;
    experienceDetails?: string;
    achievements?: string;
    awards?: string;
    
    // Salary Information
    basicSalary?: number;
    grossSalary?: number;
    netSalary?: number;
    salaryStructure?: string;
    allowances?: string;
    benefits?: string;
    
    // Financial Information
    bankName?: string;
    bankAccountNumber?: string;
    ifsCode?: string;
    panNumber?: string;
    aadharNumber?: string;
    pfNumber?: string;
    esiNumber?: string;

    // Mobile financial service (BD: bKash / Nagad / Rocket)
    mfsProvider?: string;
    mfsAccountNumber?: string;

    // Org assignment (S1.2/S1.3 org-config entity refs)
    reportsToId?: string;
    locationId?: string;
    costCentreId?: string;
    departmentId?: string;
    designationId?: string;

    // Organizational Information
    reportingTo?: string;
    subordinates?: string;
    roles?: string;
    responsibilities?: string;
    committees?: string;
    projects?: string;

    // Teaching Information

    // Personal Information
    languagesKnown?: string;
    hobbies?: string;
    specialSkills?: string;
    interests?: string;
    remarks?: string;
    notes?: string;

    password: string;
}

export interface UpdateEmployeeRequest {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    userName: string;
    phoneNumber: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
    image?: FileUploadRequest;
    deleteCurrentImage?: boolean;
    
    // Professional Information
    designation?: Designation;
    department?: Department;
    employeeId?: string;
    employeeCode?: string;
    joiningDate?: string;
    confirmationDate?: string;
    resignationDate?: string;
    lastWorkingDate?: string;
    employmentStatus?: EmploymentStatus;
    employmentType?: EmploymentType;
    workLocation?: string;
    workShift?: WorkShift;
    workingHours?: number;
    
    // Experience Information
    totalExperience?: number;
    previousEmployers?: string;
    previousPositions?: string;
    experienceDetails?: string;
    achievements?: string;
    awards?: string;
    
    // Salary Information
    basicSalary?: number;
    grossSalary?: number;
    netSalary?: number;
    salaryStructure?: string;
    allowances?: string;
    benefits?: string;
    
    // Financial Information
    bankName?: string;
    bankAccountNumber?: string;
    ifsCode?: string;
    panNumber?: string;
    aadharNumber?: string;
    pfNumber?: string;
    esiNumber?: string;

    // Mobile financial service (BD: bKash / Nagad / Rocket)
    mfsProvider?: string;
    mfsAccountNumber?: string;

    // Org assignment (S1.2/S1.3 org-config entity refs)
    reportsToId?: string;
    locationId?: string;
    costCentreId?: string;
    departmentId?: string;
    designationId?: string;

    // Organizational Information
    reportingTo?: string;
    subordinates?: string;
    roles?: string;
    responsibilities?: string;
    committees?: string;
    projects?: string;

    // Teaching Information

    // Performance Information
    performanceRating?: PerformanceRating;
    lastAppraisalDate?: string;
    appraisalComments?: string;
    improvementAreas?: string;
    trainingNeeds?: string;
    careerGoals?: string;
    isProbationPeriod?: boolean;
    probationEndDate?: string;
    
    // Personal Information
    languagesKnown?: string;
    hobbies?: string;
    specialSkills?: string;
    interests?: string;
    remarks?: string;
    notes?: string;
}

export interface SearchEmployeesRequest {
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
    advancedSearch?: Search;
    keyword?: string;
    // Server-side name filter — matches (FirstName + " " + LastName).Contains on UserProfile.
    name?: string;
    id?: string;
    isActive?: boolean;
}

// New interfaces for employee random generation
export interface GenerateRandomEmployeeRequest {
    nSeed?: number;
}

export interface GenerationProgress {
    status: 'generating' | 'completed' | 'error';
    progress: number;
    message: string;
    generatedCount?: number;
    totalCount?: number;
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
// --- Org chart (S1.3) ---
export interface EmployeeOrgChartNode {
    id: string;
    employeeName: string;
    employeeCode?: string;
    designation?: string;
    department?: string;
    reportsToId?: string;
    reports: EmployeeOrgChartNode[];
}

// --- Employee documents (S1.3) ---
export interface EmployeeDocumentDto {
    id: string;
    employeeId: string;
    title: string;
    documentType: string;
    fileUrl: string;
    expiryDate?: string;
    isActive: boolean;
    createdOn: string;
}

export interface AddEmployeeDocumentRequest {
    employeeId: string;
    title: string;
    documentType: string;
    fileUrl: string;
    expiryDate?: string;
}
