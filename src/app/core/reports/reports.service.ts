import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportsService {
    private baseUrl = `${environment.apiUrl}/api/v1/reports`;
    constructor(private http: HttpClient) {}

    studentTranscript(studentId: string): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/students/${studentId}/transcript.pdf`, { responseType: 'blob' });
    }

    feeCollection(from: string, to: string): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/fees/collection.pdf?from=${from}&to=${to}`, { responseType: 'blob' });
    }

    attendanceSummary(from: string, to: string, classId?: string): Observable<Blob> {
        const cls = classId ? `&classId=${classId}` : '';
        return this.http.get(`${this.baseUrl}/attendance/summary.pdf?from=${from}&to=${to}${cls}`, { responseType: 'blob' });
    }

    /** Phase G3 — printable class roster (paper attendance sheet). */
    classRoster(classId: string, date?: string): Observable<Blob> {
        const qs = date ? `?date=${date}` : '';
        return this.http.get(`${this.baseUrl}/classes/${classId}/roster.pdf${qs}`, { responseType: 'blob' });
    }

    static downloadBlob(blob: Blob, fileName: string): void {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}
