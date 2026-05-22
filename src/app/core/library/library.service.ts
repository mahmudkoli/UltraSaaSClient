import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginationResponse } from '../comms/sms-templates.service';

export interface BookDto {
    id: string;
    title: string;
    isbn: string;
    author: string;
    publisher?: string;
    publicationDate?: string;
    edition?: string;
    category?: string;
    subject?: string;
    totalCopies: number;
    availableCopies: number;
    isActive: boolean;
    description?: string;
    location?: string;
    price?: number;
}

export interface CreateBookRequest {
    title: string;
    isbn: string;
    author: string;
    publisher?: string;
    publicationDate?: string;
    edition?: string;
    category?: string;
    subject?: string;
    totalCopies: number;
    availableCopies: number;
    isActive: boolean;
    description?: string;
    location?: string;
    price?: number;
}

export interface UpdateBookRequest extends CreateBookRequest { id: string; }

export interface BookIssueDto {
    id: string;
    bookId: string;
    bookTitle: string;
    bookISBN: string;
    studentId: string;
    studentName: string;
    issueDate: string;
    dueDate: string;
    returnDate?: string;
    remarks?: string;
    isReturned: boolean;
    isOverdue: boolean;
    daysOverdue: number;
    fineAmount?: number;
    isFinePaid: boolean;
    finePaidDate?: string;
    fineRemarks?: string;
    isActive: boolean;
}

export interface CreateBookIssueRequest {
    bookId: string;
    studentId: string;
    issueDate: string;
    dueDate: string;
    remarks?: string;
}

export interface UpdateBookIssueRequest {
    id: string;
    returnDate?: string;
    remarks?: string;
    isReturned: boolean;
    fineAmount?: number;
    isFinePaid: boolean;
    fineRemarks?: string;
}

@Injectable({ providedIn: 'root' })
export class BooksService {
    private baseUrl = `${environment.apiUrl}/api/v1/books`;
    constructor(private http: HttpClient) {}
    search(req: { pageNumber: number; pageSize: number; keyword?: string }): Observable<PaginationResponse<BookDto>> {
        return this.http.post<PaginationResponse<BookDto>>(`${this.baseUrl}/search`, req);
    }
    getById(id: string): Observable<BookDto> { return this.http.get<BookDto>(`${this.baseUrl}/${id}`); }
    create(req: CreateBookRequest): Observable<string> { return this.http.post(this.baseUrl, req, { responseType: 'text' }); }
    update(id: string, req: UpdateBookRequest): Observable<string> { return this.http.put(`${this.baseUrl}/${id}`, req, { responseType: 'text' }); }
    delete(id: string): Observable<string> { return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }); }
}

@Injectable({ providedIn: 'root' })
export class BookIssuesService {
    private baseUrl = `${environment.apiUrl}/api/v1/bookissues`;
    constructor(private http: HttpClient) {}
    search(req: { pageNumber: number; pageSize: number; keyword?: string }): Observable<PaginationResponse<BookIssueDto>> {
        return this.http.post<PaginationResponse<BookIssueDto>>(`${this.baseUrl}/search`, req);
    }
    getById(id: string): Observable<BookIssueDto> { return this.http.get<BookIssueDto>(`${this.baseUrl}/${id}`); }
    create(req: CreateBookIssueRequest): Observable<string> { return this.http.post(this.baseUrl, req, { responseType: 'text' }); }
    update(id: string, req: UpdateBookIssueRequest): Observable<string> { return this.http.put(`${this.baseUrl}/${id}`, req, { responseType: 'text' }); }
    delete(id: string): Observable<string> { return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }); }
}
