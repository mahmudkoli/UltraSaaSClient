import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export enum StudentDocumentType {
    Other = 0,
    Photo = 1,
    BirthCertificate = 2,
    NationalIdCopy = 3,
    PassportCopy = 4,
    AcademicCertificate = 5,
    Transcript = 6,
    ParentIdCopy = 7,
    AddressProof = 8,
    MedicalReport = 9,
    VaccinationRecord = 10,
}

export const STUDENT_DOCUMENT_TYPE_LABELS: Record<StudentDocumentType, string> = {
    [StudentDocumentType.Other]: 'Other',
    [StudentDocumentType.Photo]: 'Photo',
    [StudentDocumentType.BirthCertificate]: 'Birth Certificate',
    [StudentDocumentType.NationalIdCopy]: 'National ID Copy',
    [StudentDocumentType.PassportCopy]: 'Passport Copy',
    [StudentDocumentType.AcademicCertificate]: 'Academic Certificate',
    [StudentDocumentType.Transcript]: 'Transcript',
    [StudentDocumentType.ParentIdCopy]: 'Parent ID Copy',
    [StudentDocumentType.AddressProof]: 'Address Proof',
    [StudentDocumentType.MedicalReport]: 'Medical Report',
    [StudentDocumentType.VaccinationRecord]: 'Vaccination Record',
};

export interface StudentDocumentDto {
    id: string;
    studentId: string;
    fileName: string;
    fileUrl: string;
    fileExtension: string;
    fileSizeBytes: number;
    documentType: StudentDocumentType;
    description?: string;
    createdOn: string;
}

export interface CreateStudentDocumentRequest {
    studentId: string;
    documentType: StudentDocumentType;
    description?: string;
    file: {
        name: string;
        extension: string;
        data: string; // base64 data-URI
    };
}

@Injectable({ providedIn: 'root' })
export class StudentDocumentsService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/students`;
    constructor(private http: HttpClient) {}

    list(studentId: string): Observable<StudentDocumentDto[]> {
        return this.http.get<StudentDocumentDto[]>(`${this.baseUrl}/${studentId}/documents`);
    }

    create(req: CreateStudentDocumentRequest): Observable<string> {
        return this.http.post(`${this.baseUrl}/${req.studentId}/documents`, req, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete(`${this.baseUrl}/documents/${id}`, { responseType: 'text' });
    }
}
