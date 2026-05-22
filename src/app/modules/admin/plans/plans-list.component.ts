import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PlansService } from '../../../core/billing/plans.service';
import { PlanDto } from '../../../core/billing/billing.types';
import { CurrencyDescriptor, CurrencyService } from '../../../core/currency/currency.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';

@Component({
    selector: 'plans-list',
    templateUrl: './plans-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatTableModule, MatTooltipModule, ListPageComponent],
})
export class PlansListComponent implements OnInit, OnDestroy {
    plans: PlanDto[] = [];
    loading = false;
    /** Currency descriptors from /api/currencies — one price column per entry. */
    currencies: CurrencyDescriptor[] = [];
    /** Built dynamically once currencies arrive: code/name/<price-per-currency>/limits/status/actions. */
    displayedColumns: string[] = [];
    private _destroyed$ = new Subject<void>();

    constructor(
        private _service: PlansService,
        private _currencyService: CurrencyService,
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        private _route: ActivatedRoute,
        private _notify: NotificationService,
    ) {}

    ngOnInit(): void {
        this._currencyService.list().pipe(takeUntil(this._destroyed$)).subscribe({
            next: (currencies) => {
                this.currencies = currencies;
                const priceCols = currencies.map(c => `price_${c.code}`);
                this.displayedColumns = ['code', 'name', ...priceCols, 'trialDays', 'maxInstitutes', 'maxUsers', 'isActive', 'actions'];
                this._cdr.markForCheck();
                this.load();
            },
            error: () => this._notify.error('Could not load currency list.'),
        });
    }

    /** Price lookup the template binds to — null when the plan doesn't publish that currency. */
    priceOf(plan: PlanDto, code: string): number | null {
        return plan.prices?.[code] ?? null;
    }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    load(): void {
        this.loading = true;
        this._cdr.markForCheck();
        this._service.getAll(false).pipe(takeUntil(this._destroyed$)).subscribe({
            next: (rows) => {
                this.plans = rows;
                this.loading = false;
                this._cdr.markForCheck();
            },
            error: () => {
                this.loading = false;
                this._cdr.markForCheck();
                this._notify.error('Could not load plans.');
            },
        });
    }

    add(): void {
        this._router.navigate(['create'], { relativeTo: this._route });
    }

    edit(plan: PlanDto): void {
        this._router.navigate([plan.id, 'edit'], { relativeTo: this._route });
    }
}
