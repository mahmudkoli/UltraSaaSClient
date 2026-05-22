import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { StudentHostelDto, StudentHostelsService } from '../../../core/hostel/hostel.service';
import { StudentTransportDto, StudentTransportsService } from '../../../core/transport/transport.service';

/**
 * Phase v1-O (K8) — read-only summary of the student's current transport
 * route + hostel allocation. Shown as a tab on student-form (edit mode only).
 * Edit links jump to the existing assignment pages — no duplicate form here.
 */
@Component({
    selector: 'student-assignments-tab',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, DatePipe, RouterModule, MatButtonModule, MatIconModule, MatProgressBarModule],
    template: `
<div *ngIf="!studentId" class="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-300">
    Save the student first — assignments are read from the Edit screen.
</div>

<div *ngIf="studentId" class="grid grid-cols-1 lg:grid-cols-2 gap-6">

    <div class="rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center gap-2 mb-3">
            <mat-icon class="text-sky-500">commute</mat-icon>
            <h3 class="text-lg font-semibold">Transport assignment</h3>
        </div>
        <mat-progress-bar *ngIf="loadingTransport" mode="indeterminate" class="mb-3"></mat-progress-bar>

        <ng-container *ngIf="!loadingTransport">
            <ng-container *ngIf="transport; else noTransport">
                <dl class="space-y-2 text-sm">
                    <div class="flex justify-between"><dt class="text-gray-500">Route</dt><dd class="font-medium">{{ transport.routeName || '—' }}</dd></div>
                    <div class="flex justify-between"><dt class="text-gray-500">Vehicle</dt><dd>{{ transport.vehicleNumber || '—' }}</dd></div>
                    <div class="flex justify-between"><dt class="text-gray-500">Pickup</dt><dd>{{ transport.pickupLocation || '—' }} <span *ngIf="transport.pickupTime" class="text-gray-500">{{ '@' }}{{ transport.pickupTime }}</span></dd></div>
                    <div class="flex justify-between"><dt class="text-gray-500">Drop</dt><dd>{{ transport.dropLocation || '—' }} <span *ngIf="transport.dropTime" class="text-gray-500">{{ '@' }}{{ transport.dropTime }}</span></dd></div>
                    <div class="flex justify-between"><dt class="text-gray-500">Monthly fee</dt><dd class="font-semibold">BDT {{ transport.monthlyFee | number:'1.0-0' }}</dd></div>
                    <div class="flex justify-between"><dt class="text-gray-500">Status</dt><dd>{{ transportStatusLabel(transport.status) }}</dd></div>
                    <div class="flex justify-between"><dt class="text-gray-500">Started</dt><dd>{{ transport.startDate | date:'mediumDate' }}</dd></div>
                </dl>
                <div class="mt-4 flex justify-end">
                    <a mat-stroked-button color="primary" routerLink="/transport/assignments">
                        <mat-icon class="mr-1">edit</mat-icon> Manage in Transport
                    </a>
                </div>
            </ng-container>
            <ng-template #noTransport>
                <p class="text-sm text-gray-500 mb-3">No transport assigned to this student.</p>
                <a mat-stroked-button color="primary" routerLink="/transport/assignments">
                    <mat-icon class="mr-1">add</mat-icon> Assign route + vehicle
                </a>
            </ng-template>
        </ng-container>
    </div>

    <div class="rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center gap-2 mb-3">
            <mat-icon class="text-amber-500">meeting_room</mat-icon>
            <h3 class="text-lg font-semibold">Hostel allocation</h3>
        </div>
        <mat-progress-bar *ngIf="loadingHostel" mode="indeterminate" class="mb-3"></mat-progress-bar>

        <ng-container *ngIf="!loadingHostel">
            <ng-container *ngIf="hostel; else noHostel">
                <dl class="space-y-2 text-sm">
                    <div class="flex justify-between"><dt class="text-gray-500">Room</dt><dd class="font-medium">{{ hostel.roomNumber }}<span *ngIf="hostel.bedNumber" class="text-gray-500"> · bed {{ hostel.bedNumber }}</span></dd></div>
                    <div class="flex justify-between" *ngIf="hostel.floor"><dt class="text-gray-500">Floor</dt><dd>{{ hostel.floor }}</dd></div>
                    <div class="flex justify-between" *ngIf="hostel.block"><dt class="text-gray-500">Block</dt><dd>{{ hostel.block }}</dd></div>
                    <div class="flex justify-between"><dt class="text-gray-500">Check-in</dt><dd>{{ hostel.checkInDate | date:'mediumDate' }}</dd></div>
                    <div class="flex justify-between" *ngIf="hostel.checkOutDate"><dt class="text-gray-500">Check-out</dt><dd>{{ hostel.checkOutDate | date:'mediumDate' }}</dd></div>
                    <div class="flex justify-between"><dt class="text-gray-500">Monthly fee</dt><dd class="font-semibold">BDT {{ hostel.monthlyFee | number:'1.0-0' }}</dd></div>
                    <div class="flex justify-between"><dt class="text-gray-500">Warden</dt><dd>{{ hostel.wardenName || '—' }}</dd></div>
                </dl>
                <div class="mt-4 flex justify-end">
                    <a mat-stroked-button color="primary" routerLink="/hostels/allocations">
                        <mat-icon class="mr-1">edit</mat-icon> Manage in Hostels
                    </a>
                </div>
            </ng-container>
            <ng-template #noHostel>
                <p class="text-sm text-gray-500 mb-3">No hostel room allocated to this student.</p>
                <a mat-stroked-button color="primary" routerLink="/hostels/allocations">
                    <mat-icon class="mr-1">add</mat-icon> Allocate room
                </a>
            </ng-template>
        </ng-container>
    </div>

</div>
    `,
})
export class StudentAssignmentsTabComponent implements OnInit {
    @Input() studentId?: string;

    transport: StudentTransportDto | null = null;
    hostel: StudentHostelDto | null = null;
    loadingTransport = false;
    loadingHostel = false;

    constructor(
        private _transport: StudentTransportsService,
        private _hostel: StudentHostelsService,
        private _cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        if (!this.studentId) return;
        this.loadTransport();
        this.loadHostel();
    }

    loadTransport(): void {
        this.loadingTransport = true;
        this._transport.search({ pageNumber: 1, pageSize: 1, studentId: this.studentId }).subscribe({
            next: r => { this.transport = r.data?.[0] ?? null; this.loadingTransport = false; this._cdr.markForCheck(); },
            error: () => { this.loadingTransport = false; this._cdr.markForCheck(); },
        });
    }

    loadHostel(): void {
        this.loadingHostel = true;
        this._hostel.search({ pageNumber: 1, pageSize: 1, studentId: this.studentId }).subscribe({
            next: r => { this.hostel = r.data?.[0] ?? null; this.loadingHostel = false; this._cdr.markForCheck(); },
            error: () => { this.loadingHostel = false; this._cdr.markForCheck(); },
        });
    }

    transportStatusLabel(status: number): string {
        return ['Inactive', 'Active', 'Suspended', 'Cancelled'][status] ?? 'Unknown';
    }
}
