// Enums from API documentation  
export enum Designation {
    Principal = 1,
    VicePrincipal = 2,
    HeadOfDepartment = 3,
    SeniorTeacher = 4,
    Teacher = 5,
    AssistantTeacher = 6,
    Lecturer = 7,
    SeniorLecturer = 8,
    AssistantProfessor = 9,
    AssociateProfessor = 10,
    Professor = 11,
    VisitingProfessor = 12,
    AdjunctProfessor = 13,
    ResearchScholar = 14,
    TeachingAssistant = 15,
    LabAssistant = 16,
    Librarian = 17,
    AssistantLibrarian = 18,
    SportsTeacher = 19,
    MusicTeacher = 20,
    ArtTeacher = 21,
    ComputerTeacher = 22,
    Counselor = 23,
    Administrator = 24,
    AccountsOfficer = 25,
    DataEntryOperator = 26,
    Peon = 27,
    SecurityGuard = 28,
    Driver = 29,
    Other = 30
}

export enum Department {
    Mathematics = 1,
    Science = 2,
    English = 3,
    History = 4,
    Geography = 5,
    Physics = 6,
    Chemistry = 7,
    Biology = 8,
    Computer = 9,
    Commerce = 10,
    Arts = 11,
    Sports = 12,
    Music = 13,
    Library = 14,
    Administration = 15
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

export interface TeacherDto {
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
    subject?: string;
    specialization?: string;
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
    teachingExperience?: number;
    previousEmployers?: string;
    previousPositions?: string;
    previousSchools?: string;
    experienceDetails?: string;
    achievements?: string;
    awards?: string;
    publications?: string;
    researchWork?: string;
    
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
    
    // Organizational Information
    reportingTo?: string;
    subordinates?: string;
    roles?: string;
    responsibilities?: string;
    committees?: string;
    projects?: string;
    
    // Teaching Information
    isClassTeacher?: boolean;
    assignedClasses?: string;
    assignedSubjects?: string;
    maxStudents?: number;
    currentStudents?: number;
    
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

export interface CreateTeacherRequest {
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
    subject?: string;
    specialization?: string;
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
    teachingExperience?: number;
    previousEmployers?: string;
    previousPositions?: string;
    previousSchools?: string;
    experienceDetails?: string;
    achievements?: string;
    awards?: string;
    publications?: string;
    researchWork?: string;
    
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
    
    // Organizational Information
    reportingTo?: string;
    subordinates?: string;
    roles?: string;
    responsibilities?: string;
    committees?: string;
    projects?: string;
    
    // Teaching Information
    isClassTeacher?: boolean;
    assignedClasses?: string;
    assignedSubjects?: string;
    maxStudents?: number;
    currentStudents?: number;
    
    // Personal Information
    languagesKnown?: string;
    hobbies?: string;
    specialSkills?: string;
    interests?: string;
    remarks?: string;
    notes?: string;
    
    password: string;
}

export interface UpdateTeacherRequest {
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
    subject?: string;
    specialization?: string;
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
    teachingExperience?: number;
    previousEmployers?: string;
    previousPositions?: string;
    previousSchools?: string;
    experienceDetails?: string;
    achievements?: string;
    awards?: string;
    publications?: string;
    researchWork?: string;
    
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
    
    // Organizational Information
    reportingTo?: string;
    subordinates?: string;
    roles?: string;
    responsibilities?: string;
    committees?: string;
    projects?: string;
    
    // Teaching Information
    isClassTeacher?: boolean;
    assignedClasses?: string;
    assignedSubjects?: string;
    maxStudents?: number;
    currentStudents?: number;
    
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

export interface SearchTeachersRequest {
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
    advancedSearch?: Search;
    keyword?: string;
    id?: string;
    isActive?: boolean;
}

// New interfaces for teacher random generation
export interface GenerateRandomTeacherRequest {
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