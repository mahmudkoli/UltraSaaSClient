import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginationResponse } from '../comms/sms-templates.service';

export interface HostelDto {
    id: string; name: string; code: string; description?: string;
    address: string; contactNumber?: string; email?: string;
    wardenName?: string; wardenPhone?: string;
    totalRooms: number; occupiedRooms: number; availableRooms: number;
    isActive: boolean; facilities?: string; rules?: string;
    monthlyFee: number; remarks?: string;
}

export interface CreateHostelRequest {
    name: string; code: string; description?: string; address: string;
    contactNumber?: string; email?: string; wardenName?: string; wardenPhone?: string;
    totalRooms: number; isActive: boolean; facilities?: string;
    rules?: string; monthlyFee: number; remarks?: string;
}

export interface UpdateHostelRequest extends CreateHostelRequest { id: string; }

export interface StudentHostelDto {
    id: string; studentId: string; hostelId: string;
    roomNumber: string; checkInDate: string; checkOutDate?: string;
    status: number; monthlyFee: number;
    bedNumber?: string; floor?: string; block?: string;
    emergencyContact?: string; emergencyPhone?: string;
    remarks?: string;
    wardenName?: string; wardenPhone?: string;
    checkInRemarks?: string; checkOutRemarks?: string;
    checkedInBy?: string; checkedOutBy?: string;
}

export interface CreateStudentHostelRequest {
    studentId: string; hostelId: string; roomNumber: string;
    checkInDate: string; status: number; monthlyFee: number;
    bedNumber?: string; floor?: string; block?: string;
    emergencyContact?: string; emergencyPhone?: string;
    remarks?: string;
}

export interface UpdateStudentHostelRequest extends CreateStudentHostelRequest {
    id: string;
    checkOutDate?: string;
    checkOutRemarks?: string;
}

@Injectable({ providedIn: 'root' })
export class HostelsService {
    private baseUrl = `${environment.apiUrl}/api/v1/hostels`;
    constructor(private http: HttpClient) {}
    search(req: { pageNumber: number; pageSize: number; keyword?: string }): Observable<PaginationResponse<HostelDto>> {
        return this.http.post<PaginationResponse<HostelDto>>(`${this.baseUrl}/search`, req);
    }
    getById(id: string): Observable<HostelDto> { return this.http.get<HostelDto>(`${this.baseUrl}/${id}`); }
    create(req: CreateHostelRequest): Observable<string> { return this.http.post(this.baseUrl, req, { responseType: 'text' }); }
    update(id: string, req: UpdateHostelRequest): Observable<string> { return this.http.put(`${this.baseUrl}/${id}`, req, { responseType: 'text' }); }
    delete(id: string): Observable<string> { return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }); }
}

@Injectable({ providedIn: 'root' })
export class StudentHostelsService {
    private baseUrl = `${environment.apiUrl}/api/v1/studenthostels`;
    constructor(private http: HttpClient) {}
    search(req: { pageNumber: number; pageSize: number; keyword?: string }): Observable<PaginationResponse<StudentHostelDto>> {
        return this.http.post<PaginationResponse<StudentHostelDto>>(`${this.baseUrl}/search`, req);
    }
    getById(id: string): Observable<StudentHostelDto> { return this.http.get<StudentHostelDto>(`${this.baseUrl}/${id}`); }
    create(req: CreateStudentHostelRequest): Observable<string> { return this.http.post(this.baseUrl, req, { responseType: 'text' }); }
    update(id: string, req: UpdateStudentHostelRequest): Observable<string> { return this.http.put(`${this.baseUrl}/${id}`, req, { responseType: 'text' }); }
    delete(id: string): Observable<string> { return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }); }
}
