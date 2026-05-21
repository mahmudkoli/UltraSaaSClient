import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginationResponse } from '../comms/sms-templates.service';

export interface EventDto {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    eventType: number;
    location?: string;
    isAllDay: boolean;
    isActive: boolean;
    organizer?: string;
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;
    color?: string;
    remarks?: string;
    isRecurring: boolean;
    recurrencePattern?: string;
    recurrenceInterval?: number;
    recurrenceEndDate?: string;
    applicableLevel?: number;
    applicableInstitutionType?: number;
    maxParticipants?: number;
    registrationFee?: number;
    registrationDeadline?: string;
    requiresRegistration: boolean;
    eventImage?: string;
}

export interface CreateEventRequest {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    eventType: number;
    location?: string;
    isAllDay: boolean;
    isActive: boolean;
    organizer?: string;
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;
    color?: string;
    remarks?: string;
    isRecurring: boolean;
    recurrencePattern?: string;
    recurrenceInterval?: number;
    recurrenceEndDate?: string;
    maxParticipants?: number;
    registrationFee?: number;
    registrationDeadline?: string;
    requiresRegistration: boolean;
}

export interface UpdateEventRequest extends CreateEventRequest { id: string; }

@Injectable({ providedIn: 'root' })
export class EventsService {
    private baseUrl = `${environment.apiUrl}/api/events`;
    constructor(private http: HttpClient) {}
    search(req: { pageNumber: number; pageSize: number; keyword?: string }): Observable<PaginationResponse<EventDto>> {
        return this.http.post<PaginationResponse<EventDto>>(`${this.baseUrl}/search`, req);
    }
    getById(id: string): Observable<EventDto> { return this.http.get<EventDto>(`${this.baseUrl}/${id}`); }
    create(req: CreateEventRequest): Observable<string> { return this.http.post(this.baseUrl, req, { responseType: 'text' }); }
    update(id: string, req: UpdateEventRequest): Observable<string> { return this.http.put(`${this.baseUrl}/${id}`, req, { responseType: 'text' }); }
    delete(id: string): Observable<string> { return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }); }
}

export const EVENT_TYPES = [
    { v: 1, l: 'Academic' }, { v: 2, l: 'Sports' }, { v: 3, l: 'Cultural' },
    { v: 4, l: 'Holiday' }, { v: 5, l: 'Exam' }, { v: 6, l: 'Meeting' },
    { v: 7, l: 'Workshop' }, { v: 8, l: 'Other' },
];
