import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { VehicleDto, VehiclesService } from '../../../core/transport/transport.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'vehicles-list',
    templateUrl: './vehicles-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, DatePipe, ReactiveFormsModule, RouterModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatProgressBarModule, MatTableModule, MatTooltipModule],
})
export class VehiclesListComponent implements OnInit, OnDestroy {
    rows: VehicleDto[] = [];
    total = 0; pageIndex = 0; pageSize = 25; loading = false;
    search = new FormControl('');
    cols = ['vehicleNumber', 'type', 'makeModel', 'capacity', 'driver', 'expiry', 'actions'];
    private _destroyed$ = new Subject<void>();

    constructor(private _svc: VehiclesService, private _cdr: ChangeDetectorRef, private _router: Router, private _notify: NotificationService) {}

    ngOnInit(): void {
        this.search.valueChanges.pipe(takeUntil(this._destroyed$), debounceTime(300), distinctUntilChanged())
            .subscribe(() => { this.pageIndex = 0; this.load(); });
        this.load();
    }
    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    load(): void {
        this.loading = true;
        this._svc.search({ pageNumber: this.pageIndex + 1, pageSize: this.pageSize, keyword: this.search.value || undefined })
            .pipe(takeUntil(this._destroyed$)).subscribe({
                next: (r) => { this.rows = r.data; this.total = r.totalCount; this.loading = false; this._cdr.markForCheck(); },
                error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load vehicles.'); },
            });
    }

    onPage(e: PageEvent): void { this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load(); }
    add(): void { this._router.navigate(['/transport/vehicles/create']); }
    edit(v: VehicleDto): void { this._router.navigate(['/transport/vehicles', v.id, 'edit']); }
    remove(v: VehicleDto): void {
        if (!confirm(`Delete vehicle "${v.vehicleNumber}"?`)) return;
        this._svc.delete(v.id).pipe(takeUntil(this._destroyed$)).subscribe({
            next: () => { this._notify.success('Deleted.'); this.load(); },
            error: () => this._notify.error('Delete failed.'),
        });
    }

    expiresSoon(v: VehicleDto): boolean {
        const d = v.insuranceExpiryDate || v.fitnessExpiryDate;
        if (!d) return false;
        const days = (new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return days < 30;
    }
}
