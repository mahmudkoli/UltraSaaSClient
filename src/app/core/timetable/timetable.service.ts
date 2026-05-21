import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TimeSlotDto {
    id: string;
    name: string;
    code: string;
    startTime: string;
    endTime: string;
    duration: number;
    isActive: boolean;
    description?: string;
    breakType?: string;
}

export interface TimetableEntryDto {
    id: string;
    classId: string;
    className?: string;
    subjectId: string;
    subjectName?: string;
    teacherId: string;
    teacherName?: string;
    timeSlotId: string;
    timeSlotName?: string;
    startTime?: string;
    endTime?: string;
    dayOfWeek: string;
    roomNumber?: string;
    isActive: boolean;
    remarks?: string;
    academicYearId: string;
    academicYearName?: string;
}

export interface CreateTimetableEntryRequest {
    classId: string;
    subjectId: string;
    teacherId: string;
    timeSlotId: string;
    dayOfWeek: string;
    academicYearId: string;
    roomNumber?: string;
    remarks?: string;
}

export interface UpdateTimetableEntryRequest {
    id: string;
    teacherId: string;
    timeSlotId: string;
    roomNumber?: string;
    remarks?: string;
    isActive: boolean;
}

export interface SearchTimetableEntriesRequest {
    classId?: string;
    teacherId?: string;
    studentId?: string;
    academicYearId?: string;
    dayOfWeek?: string;
}

@Injectable({ providedIn: 'root' })
export class TimetableService {
    private baseUrl = `${environment.apiUrl}/api/v1/timetableentries`;
    private timeSlotsUrl = `${environment.apiUrl}/api/v1/timeslots`;
    constructor(private http: HttpClient) {}

    search(req: SearchTimetableEntriesRequest): Observable<TimetableEntryDto[]> {
        return this.http.post<TimetableEntryDto[]>(`${this.baseUrl}/search`, req);
    }
    getById(id: string): Observable<TimetableEntryDto> { return this.http.get<TimetableEntryDto>(`${this.baseUrl}/${id}`); }
    create(req: CreateTimetableEntryRequest): Observable<string> { return this.http.post(this.baseUrl, req, { responseType: 'text' }); }
    update(id: string, req: UpdateTimetableEntryRequest): Observable<string> { return this.http.put(`${this.baseUrl}/${id}`, req, { responseType: 'text' }); }
    delete(id: string): Observable<string> { return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }); }

    listTimeSlots(): Observable<TimeSlotDto[]> {
        // The /timeslots/search endpoint returns a PaginationResponse; the
        // grid view just needs the data array. The map keeps the API surface
        // here narrow.
        return new Observable<TimeSlotDto[]>(observer => {
            this.http.post<{ data: TimeSlotDto[] }>(`${this.timeSlotsUrl}/search`, { pageNumber: 1, pageSize: 100 })
                .subscribe({
                    next: (r) => { observer.next(r.data || []); observer.complete(); },
                    error: (e) => observer.error(e),
                });
        });
    }
}

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
