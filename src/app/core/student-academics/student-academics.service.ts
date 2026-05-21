import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
    StudentAcademicDto,
    CreateStudentAcademicRequest,
    UpdateStudentAcademicRequest,
    SearchStudentAcademicsRequest,
    PaginationResponse,
    AcademicAnalytics
} from './student-academics.types';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class StudentAcademicsService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/studentacademics`;

    constructor(private http: HttpClient) {}

    /**
     * Search student academic records
     */
    search(request: SearchStudentAcademicsRequest): Observable<PaginationResponse<StudentAcademicDto>> {
        return this.http.post<PaginationResponse<StudentAcademicDto>>(`${this.baseUrl}/search`, request);
    }

    /**
     * Get student academic record by ID
     */
    getById(id: string): Observable<StudentAcademicDto> {
        return this.http.get<StudentAcademicDto>(`${this.baseUrl}/${id}`);
    }


    /**
     * Create new student academic record
     */
    create(request: CreateStudentAcademicRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    /**
     * Update student academic record
     */
    update(id: string, request: UpdateStudentAcademicRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    /**
     * Delete student academic record
     */
    delete(id: string): Observable<string> {
        return this.http.delete<string>(`${this.baseUrl}/${id}`);
    }

    /**
     * Get academic analytics (computed from search results)
     */
    getAnalytics(): Observable<AcademicAnalytics> {
        return this.search({
            pageNumber: 1,
            pageSize: 1000 // Get all records for analytics
        }).pipe(
            map(response => this.computeAnalytics(response.data))
        );
    }

    /**
     * Compute analytics from academic records
     */
    private computeAnalytics(records: StudentAcademicDto[]): AcademicAnalytics {
        if (records.length === 0) {
            return {
                averageCGPA: 0,
                averageAttendance: 0,
                totalStudents: 0,
                scholarshipHolders: 0,
                gradeDistribution: [],
                attendanceDistribution: [],
                topPerformers: []
            };
        }

        // Calculate averages
        const validCGPAs = records.filter(r => r.cgpa !== null && r.cgpa !== undefined).map(r => r.cgpa!);
        const validAttendance = records.filter(r => r.attendancePercentage !== null && r.attendancePercentage !== undefined).map(r => r.attendancePercentage!);
        
        const averageCGPA = validCGPAs.length > 0 ? validCGPAs.reduce((sum, cgpa) => sum + cgpa, 0) / validCGPAs.length : 0;
        const averageAttendance = validAttendance.length > 0 ? validAttendance.reduce((sum, att) => sum + att, 0) / validAttendance.length : 0;

        // Grade distribution
        const gradeCount = records.reduce((acc, record) => {
            if (record.grade) {
                acc[record.grade] = (acc[record.grade] || 0) + 1;
            }
            return acc;
        }, {} as { [key: string]: number });

        const gradeDistribution = Object.entries(gradeCount).map(([grade, count]) => ({
            grade,
            count,
            percentage: (count / records.length) * 100
        }));

        // Attendance distribution
        const attendanceRanges = [
            { range: '90-100%', min: 90, max: 100 },
            { range: '80-89%', min: 80, max: 89 },
            { range: '70-79%', min: 70, max: 79 },
            { range: '60-69%', min: 60, max: 69 },
            { range: 'Below 60%', min: 0, max: 59 }
        ];

        const attendanceDistribution = attendanceRanges.map(range => {
            const count = records.filter(r => 
                r.attendancePercentage !== null && 
                r.attendancePercentage !== undefined &&
                r.attendancePercentage >= range.min && 
                r.attendancePercentage <= range.max
            ).length;
            
            return {
                range: range.range,
                count,
                percentage: records.length > 0 ? (count / records.length) * 100 : 0
            };
        });

        // Top performers (highest CGPA)
        const topPerformers = records
            .filter(r => r.cgpa !== null && r.cgpa !== undefined)
            .sort((a, b) => (b.cgpa || 0) - (a.cgpa || 0))
            .slice(0, 10);

        return {
            averageCGPA: Math.round(averageCGPA * 100) / 100,
            averageAttendance: Math.round(averageAttendance * 100) / 100,
            totalStudents: records.length,
            scholarshipHolders: records.filter(r => r.isScholarshipHolder).length,
            gradeDistribution,
            attendanceDistribution,
            topPerformers
        };
    }
} 