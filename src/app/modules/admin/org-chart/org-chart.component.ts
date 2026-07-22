import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { EmployeesService } from '../../../core/employees/employees.service';
import { EmployeeOrgChartNode } from '../../../core/employees/employees.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'org-chart',
    templateUrl: './org-chart.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, RouterModule, ListPageComponent, MatButtonModule, MatIconModule, MatProgressBarModule],
})
export class OrgChartComponent implements OnInit, OnDestroy {
    roots: EmployeeOrgChartNode[] = [];
    isLoading = false;
    totalCount = 0;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _service: EmployeesService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _notificationService: NotificationService,
    ) {}

    ngOnInit(): void {
        this.load();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    load(): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();
        this._service.getOrgChart().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (nodes) => {
                this.roots = nodes || [];
                this.totalCount = this.count(this.roots);
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            },
            error: () => {
                this._notificationService.error('Failed to load org chart');
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            },
        });
    }

    private count(nodes: EmployeeOrgChartNode[]): number {
        return nodes.reduce((sum, n) => sum + 1 + this.count(n.reports || []), 0);
    }

    initials(name: string): string {
        return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(p => p.charAt(0).toUpperCase()).join('');
    }
}
