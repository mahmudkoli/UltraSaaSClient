import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletDto } from 'app/core/outlets/outlets.types';
import { ShiftsService } from 'app/core/sales/shifts.service';
import { ShiftDto } from 'app/core/sales/shifts.types';
import { CurrentOutletService } from 'app/core/outlets/current-outlet.service';
import { CloseShiftDialogComponent, OpenShiftDialogComponent } from './shift-dialogs.component';

@Component({
    selector: 'app-shift-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule,
        MatSelectModule, MatTableModule, MatTooltipModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg"><mat-icon class="text-white">point_of_sale</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Shifts</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Cash-register shifts: open, close, and review variance</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-56">
                    <mat-label>Outlet</mat-label>
                    <mat-select [(ngModel)]="filterOutletId" (ngModelChange)="load()">
                        <mat-option [value]="''">All</mat-option>
                        @for (o of outlets(); track o.id) { <mat-option [value]="o.id">{{ o.name }}</mat-option> }
                    </mat-select>
                </mat-form-field>
                @if (currentShift(); as cs) {
                    <button mat-flat-button color="warn" (click)="closeShift(cs)">
                        <mat-icon class="icon-size-5 mr-2">stop_circle</mat-icon>Close current shift
                    </button>
                } @else {
                    <button mat-flat-button color="primary" (click)="openShift()" [disabled]="!activeOutletId()">
                        <mat-icon class="icon-size-5 mr-2">play_arrow</mat-icon>Open new shift
                    </button>
                }
            </div>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="relative overflow-x-auto">
                    <table mat-table [dataSource]="rows()" class="w-full">
                        <ng-container matColumnDef="outlet"><th mat-header-cell *matHeaderCellDef class="pl-4 sm:pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Outlet</span></th>
                            <td mat-cell *matCellDef="let r" class="pl-4 sm:pl-6">{{ outletName(r.outletId) }}</td></ng-container>
                        <ng-container matColumnDef="opened"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Opened</span></th>
                            <td mat-cell *matCellDef="let r">{{ r.openedAt | date:'short' }}</td></ng-container>
                        <ng-container matColumnDef="closed"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Closed</span></th>
                            <td mat-cell *matCellDef="let r">{{ r.closedAt ? (r.closedAt | date:'short') : '—' }}</td></ng-container>
                        <ng-container matColumnDef="opening"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Opening</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right">{{ r.openingFloat | number:'1.2-2' }}</td></ng-container>
                        <ng-container matColumnDef="closing"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Closing</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right">{{ r.closingFloat != null ? (r.closingFloat | number:'1.2-2') : '—' }}</td></ng-container>
                        <ng-container matColumnDef="expected"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right">{{ r.expectedCash != null ? (r.expectedCash | number:'1.2-2') : '—' }}</td></ng-container>
                        <ng-container matColumnDef="variance"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right" [class.text-rose-700]="r.variance != null && r.variance < 0" [class.text-emerald-700]="r.variance != null && r.variance >= 0">
                                {{ r.variance != null ? (r.variance | number:'1.2-2') : '—' }}
                            </td></ng-container>
                        <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span></th>
                            <td mat-cell *matCellDef="let r">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                      [ngClass]="r.status === 'Open' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'">
                                    <mat-icon class="icon-size-4 mr-1">{{ r.status === 'Open' ? 'play_circle' : 'check_circle' }}</mat-icon>{{ r.status }}
                                </span>
                            </td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: cols"></tr>
                    </table>
                </div>
                <div *ngIf="rows().length === 0" class="flex flex-col items-center justify-center p-12">
                    <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-lg"><mat-icon class="icon-size-16 text-gray-400">point_of_sale</mat-icon></div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">No shifts yet</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Open a shift before ringing up sales.</p>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class ShiftListComponent implements OnInit {
    private readonly api = inject(ShiftsService);
    private readonly outletsApi = inject(OutletsService);
    private readonly dialog = inject(MatDialog);
    private readonly currentOutlet = inject(CurrentOutletService);

    rows = signal<ShiftDto[]>([]);
    outlets = signal<OutletDto[]>([]);
    currentShift = signal<ShiftDto | null>(null);
    filterOutletId = '';
    cols = ['outlet', 'opened', 'closed', 'opening', 'closing', 'expected', 'variance', 'status'];

    activeOutletId = computed(() => this.filterOutletId || this.currentOutlet.outletId());

    outletName(id: string): string { return this.outlets().find(o => o.id === id)?.name ?? '—'; }

    ngOnInit(): void {
        this.outletsApi.getAll().subscribe(o => {
            this.outlets.set(o);
            if (!this.filterOutletId && this.currentOutlet.outletId()) this.filterOutletId = this.currentOutlet.outletId();
            this.load();
            this.refreshCurrent();
        });
    }

    load(): void {
        const outletId = this.filterOutletId || undefined;
        this.api.search({ outletId, take: 200 }).subscribe(r => this.rows.set(r ?? []));
        this.refreshCurrent();
    }

    refreshCurrent(): void {
        const id = this.activeOutletId();
        if (!id) { this.currentShift.set(null); return; }
        this.api.current(id).subscribe(s => this.currentShift.set(s ?? null));
    }

    openShift(): void {
        const id = this.activeOutletId();
        if (!id) return;
        const o = this.outlets().find(x => x.id === id);
        this.dialog.open(OpenShiftDialogComponent, {
            width: '420px',
            data: { outletId: id, outletName: o?.name ?? '' },
        }).afterClosed().subscribe(saved => { if (saved) this.load(); });
    }

    closeShift(s: ShiftDto): void {
        const o = this.outlets().find(x => x.id === s.outletId);
        this.dialog.open(CloseShiftDialogComponent, {
            width: '440px',
            data: { shift: s, outletName: o?.name ?? '' },
        }).afterClosed().subscribe(_ => this.load());
    }
}
