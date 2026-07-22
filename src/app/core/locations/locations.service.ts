import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    LocationDto,
    CreateLocationRequest,
    UpdateLocationRequest,
    SearchLocationsRequest,
    PaginationResponse,
} from './locations.types';

@Injectable({ providedIn: 'root' })
export class LocationsService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/locations`;

    constructor(private http: HttpClient) {}

    search(request: SearchLocationsRequest): Observable<PaginationResponse<LocationDto>> {
        return this.http.post<PaginationResponse<LocationDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<LocationDto> {
        return this.http.get<LocationDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateLocationRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateLocationRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
    }
}
