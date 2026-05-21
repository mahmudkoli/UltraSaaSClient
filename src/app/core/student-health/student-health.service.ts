import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
    StudentHealthDto,
    CreateStudentHealthRequest,
    UpdateStudentHealthRequest,
    SearchStudentHealthsRequest,
    PaginationResponse,
    HealthAnalytics,
    BloodGroup,
    BloodGroupStats,
    BMICategory,
    AllergyStats,
    HealthAlert
} from './student-health.types';

@Injectable({
    providedIn: 'root'
})
export class StudentHealthService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/studenthealths`;

    constructor(private http: HttpClient) {}

    /**
     * Search student health records
     */
    search(request: SearchStudentHealthsRequest): Observable<PaginationResponse<StudentHealthDto>> {
        return this.http.post<PaginationResponse<StudentHealthDto>>(`${this.baseUrl}/search`, request);
    }

    /**
     * Get student health record by ID
     */
    getById(id: string): Observable<StudentHealthDto> {
        return this.http.get<StudentHealthDto>(`${this.baseUrl}/${id}`);
    }

    /**
     * Create new student health record
     */
    create(request: CreateStudentHealthRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    /**
     * Update student health record
     */
    update(id: string, request: UpdateStudentHealthRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    /**
     * Delete student health record
     */
    delete(id: string): Observable<string> {
        return this.http.delete<string>(`${this.baseUrl}/${id}`);
    }

    /**
     * Get health analytics
     */
    getAnalytics(): Observable<HealthAnalytics> {
        return this.search({
            pageNumber: 1,
            pageSize: 1000 // Get all records for analytics
        }).pipe(
            map(response => this.computeHealthAnalytics(response.data))
        );
    }

    /**
     * Get blood group label
     */
    getBloodGroupLabel(bloodGroup: BloodGroup): string {
        const labels = {
            [BloodGroup.APositive]: 'A+',
            [BloodGroup.ANegative]: 'A-',
            [BloodGroup.BPositive]: 'B+',
            [BloodGroup.BNegative]: 'B-',
            [BloodGroup.ABPositive]: 'AB+',
            [BloodGroup.ABNegative]: 'AB-',
            [BloodGroup.OPositive]: 'O+',
            [BloodGroup.ONegative]: 'O-'
        };
        return labels[bloodGroup] || 'Unknown';
    }

    /**
     * Calculate BMI category
     */
    calculateBMICategory(height: string, weight: string): { category: string; bmi: number; color: string } {
        if (!height || !weight) {
            return { category: 'Unknown', bmi: 0, color: 'gray' };
        }

        // Convert height to meters and weight to kg
        const heightNum = parseFloat(height);
        const weightNum = parseFloat(weight);
        
        if (heightNum <= 0 || weightNum <= 0) {
            return { category: 'Invalid Data', bmi: 0, color: 'gray' };
        }

        const bmi = weightNum / ((heightNum / 100) * (heightNum / 100));
        
        if (bmi < 18.5) return { category: 'Underweight', bmi, color: 'blue' };
        if (bmi < 25) return { category: 'Normal', bmi, color: 'green' };
        if (bmi < 30) return { category: 'Overweight', bmi, color: 'yellow' };
        return { category: 'Obese', bmi, color: 'red' };
    }

    /**
     * Compute health analytics from records
     */
    private computeHealthAnalytics(records: StudentHealthDto[]): HealthAnalytics {
        if (records.length === 0) {
            return {
                totalRecords: 0,
                bloodGroupDistribution: [],
                bmiDistribution: [],
                commonAllergies: [],
                medicalConditionsCount: 0,
                emergencyContactsCount: 0,
                healthAlerts: []
            };
        }

        // Blood group distribution
        const bloodGroupCount = records.reduce((acc, record) => {
            if (record.bloodGroup !== null && record.bloodGroup !== undefined) {
                acc[record.bloodGroup] = (acc[record.bloodGroup] || 0) + 1;
            }
            return acc;
        }, {} as { [key: number]: number });

        const bloodGroupDistribution: BloodGroupStats[] = Object.entries(bloodGroupCount).map(([group, count]) => {
            const bloodGroup = parseInt(group) as BloodGroup;
            return {
                bloodGroup,
                bloodGroupLabel: this.getBloodGroupLabel(bloodGroup),
                count,
                percentage: (count / records.length) * 100
            };
        });

        // BMI distribution
        const bmiCategories = records.map(record => {
            if (record.height && record.weight) {
                return this.calculateBMICategory(record.height, record.weight);
            }
            return { category: 'Unknown', bmi: 0, color: 'gray' };
        });

        const bmiCount = bmiCategories.reduce((acc, { category }) => {
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        const bmiDistribution: BMICategory[] = Object.entries(bmiCount).map(([category, count]) => {
            const sample = bmiCategories.find(b => b.category === category);
            return {
                category,
                range: this.getBMIRange(category),
                count,
                percentage: (count / records.length) * 100,
                color: sample?.color || 'gray'
            };
        });

        // Common allergies
        const allergies = records
            .filter(r => r.allergies)
            .flatMap(r => r.allergies!.split(',').map(a => a.trim().toLowerCase()))
            .filter(a => a.length > 0);

        const allergyCount = allergies.reduce((acc, allergy) => {
            acc[allergy] = (acc[allergy] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        const commonAllergies: AllergyStats[] = Object.entries(allergyCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([allergy, count]) => ({
                allergy: allergy.charAt(0).toUpperCase() + allergy.slice(1),
                count,
                percentage: (count / records.length) * 100
            }));

        // Generate health alerts
        const healthAlerts: HealthAlert[] = [];
        records.forEach(record => {
            // Missing blood group alert
            if (!record.bloodGroup) {
                healthAlerts.push({
                    id: `missing-blood-${record.id}`,
                    studentId: record.studentId,
                    studentName: record.studentName || 'Unknown',
                    type: 'missing_data',
                    message: 'Blood group information missing',
                    severity: 'medium',
                    createdAt: new Date().toISOString()
                });
            }

            // Missing emergency contact alert
            if (!record.emergencyContact || !record.emergencyPhone) {
                healthAlerts.push({
                    id: `missing-emergency-${record.id}`,
                    studentId: record.studentId,
                    studentName: record.studentName || 'Unknown',
                    type: 'missing_data',
                    message: 'Emergency contact information incomplete',
                    severity: 'high',
                    createdAt: new Date().toISOString()
                });
            }

            // Medical conditions alert
            if (record.chronicDiseases || record.medicalConditions) {
                healthAlerts.push({
                    id: `medical-${record.id}`,
                    studentId: record.studentId,
                    studentName: record.studentName || 'Unknown',
                    type: 'medication_alert',
                    message: 'Student has medical conditions requiring attention',
                    severity: 'medium',
                    createdAt: new Date().toISOString()
                });
            }
        });

        return {
            totalRecords: records.length,
            bloodGroupDistribution,
            bmiDistribution,
            commonAllergies,
            medicalConditionsCount: records.filter(r => r.medicalConditions || r.chronicDiseases).length,
            emergencyContactsCount: records.filter(r => r.emergencyContact && r.emergencyPhone).length,
            healthAlerts: healthAlerts.slice(0, 20) // Limit to 20 alerts
        };
    }

    /**
     * Get BMI range description
     */
    private getBMIRange(category: string): string {
        switch (category) {
            case 'Underweight': return '< 18.5';
            case 'Normal': return '18.5 - 24.9';
            case 'Overweight': return '25.0 - 29.9';
            case 'Obese': return '≥ 30.0';
            default: return 'N/A';
        }
    }
} 