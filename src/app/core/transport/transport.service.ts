import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginationResponse } from '../comms/sms-templates.service';

export interface RouteDto {
    id: string; name: string; code: string; description?: string;
    startLocation: string; endLocation: string; distance: number;
    estimatedTime: string; fare: number; isActive: boolean;
    stops?: string; remarks?: string;
}
export interface CreateRouteRequest {
    name: string; code: string; description?: string;
    startLocation: string; endLocation: string; distance: number;
    estimatedTime: string; fare: number; isActive: boolean;
    stops?: string; remarks?: string;
}
export interface UpdateRouteRequest extends CreateRouteRequest { id: string; }

export interface VehicleDto {
    id: string; vehicleNumber: string; vehicleType: string; make: string; model: string;
    year: number; capacity: number; color?: string; registrationNumber?: string;
    insuranceNumber?: string; insuranceExpiryDate?: string; fitnessExpiryDate?: string;
    isActive: boolean; driverName?: string; driverPhone?: string;
    conductorName?: string; conductorPhone?: string; remarks?: string;
}
export interface CreateVehicleRequest {
    vehicleNumber: string; vehicleType: string; make: string; model: string;
    year: number; capacity: number; color?: string; registrationNumber?: string;
    insuranceNumber?: string; insuranceExpiryDate?: string; fitnessExpiryDate?: string;
    isActive: boolean; driverName?: string; driverPhone?: string;
    conductorName?: string; conductorPhone?: string; remarks?: string;
}
export interface UpdateVehicleRequest extends CreateVehicleRequest { id: string; }

export interface StudentTransportDto {
    id: string; studentId: string; studentName: string;
    routeId: string; routeName: string;
    vehicleId?: string; vehicleName?: string;
    startDate: string; endDate?: string;
    status: number; monthlyFee: number;
    pickupLocation?: string; dropLocation?: string;
    pickupTime?: string; dropTime?: string;
    remarks?: string;
    conductorName?: string; conductorPhone?: string;
    distance?: number;
    emergencyContact?: string; emergencyPhone?: string;
}
export interface CreateStudentTransportRequest {
    studentId: string; routeId: string; vehicleId?: string;
    startDate: string; status: number; monthlyFee: number;
    pickupLocation?: string; dropLocation?: string;
    pickupTime?: string; dropTime?: string;
    remarks?: string;
    conductorName?: string; conductorPhone?: string;
    distance?: number;
    emergencyContact?: string; emergencyPhone?: string;
}
export interface UpdateStudentTransportRequest extends CreateStudentTransportRequest {
    id: string;
    endDate?: string;
}

@Injectable({ providedIn: 'root' })
export class RoutesService {
    private baseUrl = `${environment.apiUrl}/api/v1/routes`;
    constructor(private http: HttpClient) {}
    search(req: { pageNumber: number; pageSize: number; keyword?: string }): Observable<PaginationResponse<RouteDto>> {
        return this.http.post<PaginationResponse<RouteDto>>(`${this.baseUrl}/search`, req);
    }
    getById(id: string): Observable<RouteDto> { return this.http.get<RouteDto>(`${this.baseUrl}/${id}`); }
    create(req: CreateRouteRequest): Observable<string> { return this.http.post(this.baseUrl, req, { responseType: 'text' }); }
    update(id: string, req: UpdateRouteRequest): Observable<string> { return this.http.put(`${this.baseUrl}/${id}`, req, { responseType: 'text' }); }
    delete(id: string): Observable<string> { return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }); }
}

@Injectable({ providedIn: 'root' })
export class VehiclesService {
    private baseUrl = `${environment.apiUrl}/api/v1/vehicles`;
    constructor(private http: HttpClient) {}
    search(req: { pageNumber: number; pageSize: number; keyword?: string }): Observable<PaginationResponse<VehicleDto>> {
        return this.http.post<PaginationResponse<VehicleDto>>(`${this.baseUrl}/search`, req);
    }
    getById(id: string): Observable<VehicleDto> { return this.http.get<VehicleDto>(`${this.baseUrl}/${id}`); }
    create(req: CreateVehicleRequest): Observable<string> { return this.http.post(this.baseUrl, req, { responseType: 'text' }); }
    update(id: string, req: UpdateVehicleRequest): Observable<string> { return this.http.put(`${this.baseUrl}/${id}`, req, { responseType: 'text' }); }
    delete(id: string): Observable<string> { return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }); }
}

@Injectable({ providedIn: 'root' })
export class StudentTransportsService {
    private baseUrl = `${environment.apiUrl}/api/v1/studenttransports`;
    constructor(private http: HttpClient) {}
    search(req: { pageNumber: number; pageSize: number; keyword?: string; studentId?: string }): Observable<PaginationResponse<StudentTransportDto>> {
        return this.http.post<PaginationResponse<StudentTransportDto>>(`${this.baseUrl}/search`, req);
    }
    getById(id: string): Observable<StudentTransportDto> { return this.http.get<StudentTransportDto>(`${this.baseUrl}/${id}`); }
    create(req: CreateStudentTransportRequest): Observable<string> { return this.http.post(this.baseUrl, req, { responseType: 'text' }); }
    update(id: string, req: UpdateStudentTransportRequest): Observable<string> { return this.http.put(`${this.baseUrl}/${id}`, req, { responseType: 'text' }); }
    delete(id: string): Observable<string> { return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }); }
}
