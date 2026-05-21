import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface PublicFeeInvoiceDto {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    discountAmount?: number | null;
    taxAmount?: number | null;
    lateFeeAmount?: number | null;
    status: string;
    studentName: string;
    className?: string | null;
    academicYearName?: string | null;
    schoolName?: string | null;
}

@Component({
    selector: 'public-invoice',
    templateUrl: './public-invoice.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule],
})
export class PublicInvoiceComponent implements OnInit {
    loading = true;
    error: string | null = null;
    invoice: PublicFeeInvoiceDto | null = null;

    constructor(
        private _route: ActivatedRoute,
        private _http: HttpClient,
        private _cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        const token = this._route.snapshot.paramMap.get('token') || '';
        const tenant = this._route.snapshot.queryParamMap.get('tenant') || '';
        if (!token || !tenant) {
            this.error = 'Invalid link.';
            this.loading = false;
            return;
        }
        const url = `${environment.apiUrl}/api/v1/feeinvoices/public/${encodeURIComponent(token)}?tenant=${encodeURIComponent(tenant)}`;
        this._http.get<PublicFeeInvoiceDto>(url).subscribe({
            next: (inv) => { this.invoice = inv; this.loading = false; this._cdr.markForCheck(); },
            error: () => { this.error = 'Invoice not found.'; this.loading = false; this._cdr.markForCheck(); },
        });
    }

    money(n: number | null | undefined): string {
        return (n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    date(d?: string | null): string {
        return d ? new Date(d).toLocaleDateString() : '—';
    }

    statusClass(): string {
        switch (this.invoice?.status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Partial': return 'bg-blue-100 text-blue-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Overdue': return 'bg-red-100 text-red-800';
            case 'Cancelled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    print(): void {
        window.print();
    }
}
