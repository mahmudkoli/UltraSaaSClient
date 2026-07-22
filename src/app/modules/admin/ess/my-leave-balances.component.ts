import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { EssService } from '../../../core/ess/ess.service';
import { MyLeaveBalanceDto } from '../../../core/ess/ess.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'my-leave-balances',
    templateUrl: './my-leave-balances.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ListPageComponent, MatIconModule, MatProgressBarModule, MatTableModule],
})
export class MyLeaveBalancesComponent implements OnInit, OnDestroy {
    items: MyLeaveBalanceDto[] = [];
    isLoading = false;
    displayedColumns = ['leaveType', 'year', 'entitled', 'taken', 'balance'];

    private _unsubscribeAll = new Subject<any>();

    constructor(private _ess: EssService, private _cdr: ChangeDetectorRef, private _notification: NotificationService) {}

    ngOnInit(): void {
        this.isLoading = true; this._cdr.markForCheck();
        this._ess.leaveBalances().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (r) => { this.items = r || []; this.isLoading = false; this._cdr.markForCheck(); },
            error: () => { this._notification.error('Failed to load leave balances'); this.isLoading = false; this._cdr.markForCheck(); },
        });
    }
    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }
}
