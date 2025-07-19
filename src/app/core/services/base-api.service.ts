import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export abstract class BaseApiService
{
    protected _httpClient = inject(HttpClient);
    protected readonly baseUrl = environment.apiUrl;

    // -----------------------------------------------------------------------------------------------------
    // @ Protected methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get headers with authentication and tenant information
     */
    protected getHeaders(): HttpHeaders
    {
        const token = localStorage.getItem('access_token');
        const tenant = localStorage.getItem('tenant_id');
        
        let headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        if (tenant) {
            headers = headers.set('tenant', tenant);
        }

        return headers;
    }

    /**
     * GET request
     */
    protected get<T>(url: string, params?: HttpParams): Observable<T>
    {
        return this._httpClient.get<T>(`${this.baseUrl}${url}`, {
            headers: this.getHeaders(),
            params
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * POST request
     */
    protected post<T>(url: string, body: any): Observable<T>
    {
        return this._httpClient.post<T>(`${this.baseUrl}${url}`, body, {
            headers: this.getHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * PUT request
     */
    protected put<T>(url: string, body: any): Observable<T>
    {
        return this._httpClient.put<T>(`${this.baseUrl}${url}`, body, {
            headers: this.getHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * DELETE request
     */
    protected delete<T>(url: string): Observable<T>
    {
        return this._httpClient.delete<T>(`${this.baseUrl}${url}`, {
            headers: this.getHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * PATCH request
     */
    protected patch<T>(url: string, body: any): Observable<T>
    {
        return this._httpClient.patch<T>(`${this.baseUrl}${url}`, body, {
            headers: this.getHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Handle HTTP errors
     */
    private handleError(error: any): Observable<never>
    {
        let errorMessage = 'An error occurred';
        
        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = error.error.message;
        } else {
            // Server-side error
            if (error.error?.messages) {
                errorMessage = error.error.messages.join(', ');
            } else if (error.error?.detail) {
                errorMessage = error.error.detail;
            } else if (error.status) {
                errorMessage = `Error ${error.status}: ${error.statusText}`;
            }
        }

        console.error('API Error:', error);
        return throwError(() => new Error(errorMessage));
    }
} 