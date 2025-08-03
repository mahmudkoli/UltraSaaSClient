import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
    TeacherQualificationDto,
    CreateTeacherQualificationRequest,
    UpdateTeacherQualificationRequest,
    SearchTeacherQualificationsRequest,
    PaginationResponse,
    QualificationAnalytics,
    QualificationLevel,
    UniversityStats,
    ExperienceRange,
    SubjectStats,
    CertificationStats,
    QualificationTrend
} from './teacher-qualifications.types';

@Injectable({
    providedIn: 'root'
})
export class TeacherQualificationsService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/teacherqualifications`;

    constructor(private http: HttpClient) {}

    /**
     * Search teacher qualification records
     */
    search(request: SearchTeacherQualificationsRequest): Observable<PaginationResponse<TeacherQualificationDto>> {
        return this.http.post<PaginationResponse<TeacherQualificationDto>>(`${this.baseUrl}/search`, request);
    }

    /**
     * Get teacher qualification record by ID
     */
    getById(id: string): Observable<TeacherQualificationDto> {
        return this.http.get<TeacherQualificationDto>(`${this.baseUrl}/${id}`);
    }

    /**
     * Get qualifications by teacher ID
     */
    getByTeacherId(teacherId: string): Observable<TeacherQualificationDto[]> {
        return this.search({
            pageNumber: 1,
            pageSize: 100,
            advancedSearch: {
                fields: ['teacherId'],
                keyword: teacherId
            }
        }).pipe(
            map(response => response.data)
        );
    }

    /**
     * Create new teacher qualification record
     */
    create(request: CreateTeacherQualificationRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    /**
     * Update teacher qualification record
     */
    update(id: string, request: UpdateTeacherQualificationRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    /**
     * Delete teacher qualification record
     */
    delete(id: string): Observable<string> {
        return this.http.delete<string>(`${this.baseUrl}/${id}`);
    }

    /**
     * Get qualification analytics
     */
    getAnalytics(): Observable<QualificationAnalytics> {
        return this.search({
            pageNumber: 1,
            pageSize: 1000 // Get all records for analytics
        }).pipe(
            map(response => this.computeQualificationAnalytics(response.data))
        );
    }

    /**
     * Compute qualification analytics
     */
    private computeQualificationAnalytics(records: TeacherQualificationDto[]): QualificationAnalytics {
        if (records.length === 0) {
            return {
                totalRecords: 0,
                qualificationDistribution: [],
                universityDistribution: [],
                experienceDistribution: [],
                subjectSpecialization: [],
                averageExperience: 0,
                averagePercentage: 0,
                certificationStats: [],
                qualificationTrends: []
            };
        }

        // Qualification level distribution
        const qualificationCount = records.reduce((acc, record) => {
            if (record.highestQualification) {
                const level = this.normalizeQualification(record.highestQualification);
                acc[level] = (acc[level] || 0) + 1;
            }
            return acc;
        }, {} as { [key: string]: number });

        const qualificationDistribution: QualificationLevel[] = Object.entries(qualificationCount).map(([level, count]) => ({
            level,
            count,
            percentage: (count / records.length) * 100,
            color: this.getQualificationColor(level)
        }));

        // University distribution
        const universityCount = records.reduce((acc, record) => {
            if (record.university) {
                const uni = record.university.trim();
                if (!acc[uni]) {
                    acc[uni] = { count: 0, totalPercentage: 0 };
                }
                acc[uni].count++;
                acc[uni].totalPercentage += record.percentage || 0;
            }
            return acc;
        }, {} as { [key: string]: { count: number; totalPercentage: number } });

        const universityDistribution: UniversityStats[] = Object.entries(universityCount)
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 10)
            .map(([university, data]) => ({
                university,
                count: data.count,
                percentage: (data.count / records.length) * 100,
                averagePercentage: data.count > 0 ? data.totalPercentage / data.count : 0
            }));

        // Experience distribution
        const experienceRanges = [
            { range: '0-2 years', min: 0, max: 2 },
            { range: '3-5 years', min: 3, max: 5 },
            { range: '6-10 years', min: 6, max: 10 },
            { range: '11-15 years', min: 11, max: 15 },
            { range: '15+ years', min: 16, max: 100 }
        ];

        const experienceDistribution: ExperienceRange[] = experienceRanges.map(range => {
            const count = records.filter(r => {
                const exp = r.teachingExperience || 0;
                return exp >= range.min && exp <= range.max;
            }).length;

            return {
                range: range.range,
                count,
                percentage: records.length > 0 ? (count / records.length) * 100 : 0,
                minYears: range.min,
                maxYears: range.max
            };
        });

        // Subject specialization
        const subjects = records
            .filter(r => r.subject)
            .map(r => r.subject!.trim());

        const subjectCount = subjects.reduce((acc, subject) => {
            acc[subject] = (acc[subject] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        const subjectSpecialization: SubjectStats[] = Object.entries(subjectCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([subject, count]) => {
                const subjectRecords = records.filter(r => r.subject === subject);
                const avgExp = subjectRecords.reduce((sum, r) => sum + (r.teachingExperience || 0), 0) / subjectRecords.length;
                
                return {
                    subject,
                    count,
                    percentage: (count / records.length) * 100,
                    averageExperience: Math.round(avgExp * 10) / 10
                };
            });

        // Calculate averages
        const validExperience = records.filter(r => r.teachingExperience).map(r => r.teachingExperience!);
        const validPercentages = records.filter(r => r.percentage).map(r => r.percentage!);

        const averageExperience = validExperience.length > 0 
            ? validExperience.reduce((sum, exp) => sum + exp, 0) / validExperience.length 
            : 0;

        const averagePercentage = validPercentages.length > 0 
            ? validPercentages.reduce((sum, pct) => sum + pct, 0) / validPercentages.length 
            : 0;

        // Certification stats
        const certifications = records
            .filter(r => r.certifications)
            .flatMap(r => r.certifications!.split(',').map(c => c.trim()))
            .filter(c => c.length > 0);

        const certificationCount = certifications.reduce((acc, cert) => {
            acc[cert] = (acc[cert] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        const certificationStats: CertificationStats[] = Object.entries(certificationCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([certification, count]) => ({
                certification,
                count,
                percentage: (count / records.length) * 100
            }));

        // Qualification trends by year
        const yearData = records.reduce((acc, record) => {
            if (record.yearOfPassing) {
                if (!acc[record.yearOfPassing]) {
                    acc[record.yearOfPassing] = { count: 0, totalPercentage: 0 };
                }
                acc[record.yearOfPassing].count++;
                acc[record.yearOfPassing].totalPercentage += record.percentage || 0;
            }
            return acc;
        }, {} as { [key: number]: { count: number; totalPercentage: number } });

        const qualificationTrends: QualificationTrend[] = Object.entries(yearData)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .slice(-10) // Last 10 years
            .map(([year, data]) => ({
                year: parseInt(year),
                count: data.count,
                averagePercentage: data.count > 0 ? data.totalPercentage / data.count : 0
            }));

        return {
            totalRecords: records.length,
            qualificationDistribution,
            universityDistribution,
            experienceDistribution,
            subjectSpecialization,
            averageExperience: Math.round(averageExperience * 10) / 10,
            averagePercentage: Math.round(averagePercentage * 100) / 100,
            certificationStats,
            qualificationTrends
        };
    }

    /**
     * Normalize qualification names
     */
    private normalizeQualification(qualification: string): string {
        const qual = qualification.toLowerCase().trim();
        
        if (qual.includes('phd') || qual.includes('doctorate')) return 'PhD/Doctorate';
        if (qual.includes('master') || qual.includes('m.')) return 'Masters';
        if (qual.includes('bachelor') || qual.includes('b.')) return 'Bachelors';
        if (qual.includes('diploma')) return 'Diploma';
        if (qual.includes('certificate')) return 'Certificate';
        
        return 'Other';
    }

    /**
     * Get color for qualification levels
     */
    private getQualificationColor(level: string): string {
        switch (level) {
            case 'PhD/Doctorate': return 'purple';
            case 'Masters': return 'blue';
            case 'Bachelors': return 'green';
            case 'Diploma': return 'yellow';
            case 'Certificate': return 'orange';
            default: return 'gray';
        }
    }
} 