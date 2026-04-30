import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
    private readonly http = inject(HttpClient);

    private readonly _permissions = signal<string[] | null>(null);
    readonly permissions = this._permissions.asReadonly();

    load(): Observable<string[]> {
        return this.http
            .get<string[]>(`${environment.apiUrl}/api/personal/permissions`)
            .pipe(
                tap(list => this._permissions.set(list ?? [])),
                catchError(() => {
                    this._permissions.set([]);
                    return of<string[]>([]);
                }),
            );
    }

    has(name: string): boolean {
        const p = this._permissions();
        return !!p && p.includes(name);
    }

    hasAny(names: string[]): boolean {
        if (!names || names.length === 0) return true;
        const p = this._permissions();
        return !!p && names.some(n => p.includes(n));
    }

    clear(): void {
        this._permissions.set(null);
    }
}
