import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule, Router } from '@angular/router';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletDto } from 'app/core/outlets/outlets.types';

@Component({
    selector: 'app-outlet-list',
    standalone: true,
    imports: [
        CommonModule, RouterModule,
        MatButtonModule, MatIconModule, MatTableModule, MatChipsModule, MatProgressSpinnerModule,
    ],
    template: `
        <div class="p-6">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-semibold">Outlets</h2>
                <button mat-raised-button color="primary" (click)="create()">
                    <mat-icon>add</mat-icon> New Outlet
                </button>
            </div>

            <div *ngIf="loading" class="flex justify-center py-10">
                <mat-spinner diameter="40"></mat-spinner>
            </div>

            <div *ngIf="!loading && outlets.length === 0" class="text-center py-10 text-gray-500">
                No outlets yet. Click "New Outlet" to create the first one.
            </div>

            <table *ngIf="!loading && outlets.length > 0" mat-table [dataSource]="outlets" class="w-full">
                <ng-container matColumnDef="code">
                    <th mat-header-cell *matHeaderCellDef>Code</th>
                    <td mat-cell *matCellDef="let o">{{ o.code }}</td>
                </ng-container>
                <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Name</th>
                    <td mat-cell *matCellDef="let o">{{ o.name }}</td>
                </ng-container>
                <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef>Type</th>
                    <td mat-cell *matCellDef="let o">
                        <mat-chip>{{ o.type }}</mat-chip>
                    </td>
                </ng-container>
                <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let o">
                        <mat-chip [color]="o.status === 'Active' ? 'accent' : 'warn'">{{ o.status }}</mat-chip>
                    </td>
                </ng-container>
                <ng-container matColumnDef="city">
                    <th mat-header-cell *matHeaderCellDef>City</th>
                    <td mat-cell *matCellDef="let o">{{ o.city || '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef></th>
                    <td mat-cell *matCellDef="let o">
                        <button mat-icon-button (click)="edit(o)" title="Edit">
                            <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button color="warn" (click)="remove(o)" title="Delete">
                            <mat-icon>delete</mat-icon>
                        </button>
                    </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
        </div>
    `,
})
export class OutletListComponent implements OnInit {
    private readonly api = inject(OutletsService);
    private readonly router = inject(Router);

    outlets: OutletDto[] = [];
    loading = true;
    displayedColumns = ['code', 'name', 'type', 'status', 'city', 'actions'];

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading = true;
        this.api.getAll().subscribe({
            next: (data) => { this.outlets = data; this.loading = false; },
            error: () => { this.loading = false; },
        });
    }

    create(): void {
        this.router.navigate(['/outlet/create']);
    }

    edit(o: OutletDto): void {
        this.router.navigate(['/outlet', o.id]);
    }

    remove(o: OutletDto): void {
        if (!confirm(`Delete outlet "${o.name}"?`)) return;
        this.api.delete(o.id).subscribe(() => this.load());
    }
}
