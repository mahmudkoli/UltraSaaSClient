import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { MySubscriptionService } from '../../../core/billing/my-subscription.service';
import { MySubscriptionDto, TenantInvoiceDto, TenantPaymentDto } from '../../../core/billing/billing.types';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';

@Component({
    selector: 'my-subscription',
    templateUrl: './my-subscription.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule, MatTabsModule, MatTooltipModule, ListPageComponent],
})
export class MySubscriptionComponent implements OnInit, OnDestroy {
    sub?: MySubscriptionDto;
    payments: TenantPaymentDto[] = [];
    invoices: TenantInvoiceDto[] = [];
    loading = true;
    paymentColumns = ['paidOn', 'amount', 'method', 'reference', 'periodEnd'];
    invoiceColumns = ['serialNumber', 'issuedOn', 'periodEnd', 'total', 'actions'];
    private _destroyed$ = new Subject<void>();

    constructor(
        private _service: MySubscriptionService,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
    ) {}

    ngOnInit(): void {
        forkJoin({
            sub: this._service.getMine(),
            payments: this._service.getPayments(),
            invoices: this._service.getInvoices(),
        }).pipe(takeUntil(this._destroyed$)).subscribe({
            next: ({ sub, payments, invoices }) => {
                this.sub = sub;
                this.payments = payments;
                this.invoices = invoices;
                this.loading = false;
                this._cdr.markForCheck();
            },
            error: () => {
                this.loading = false;
                this._cdr.markForCheck();
                this._notify.error('Could not load subscription details.');
            },
        });
    }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    severityClass(): string {
        const sev = this.sub?.severity ?? 'none';
        if (sev === 'urgent') return 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:text-red-300';
        if (sev === 'warning') return 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
        return 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:text-green-300';
    }

    severityIcon(): string {
        const sev = this.sub?.severity ?? 'none';
        if (sev === 'urgent') return 'error';
        if (sev === 'warning') return 'warning';
        return 'check_circle';
    }

    downloadInvoice(inv: TenantInvoiceDto): void {
        this._service.downloadInvoicePdf(inv.id).pipe(takeUntil(this._destroyed$)).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${inv.serialNumber}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: () => this._notify.error('Could not download invoice PDF.'),
        });
    }
}
