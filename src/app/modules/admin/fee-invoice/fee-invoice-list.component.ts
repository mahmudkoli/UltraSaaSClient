import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FeeInvoicesService } from '../../../core/fee-invoices/fee-invoices.service';
import { FeeInvoiceDto, InvoiceStatus, SearchFeeInvoicesRequest, PaginationResponse } from '../../../core/fee-invoices/fee-invoices.types';
import { ClassesService } from '../../../core/classes/classes.service';
import { ClassDto } from '../../../core/classes/classes.types';
import { AcademicYearsService } from '../../../core/academic-years/academic-years.service';
import { AcademicYearDto } from '../../../core/academic-years/academic-years.types';
import { NotificationService } from '../../../core/services/notification.service';
import { TenantService } from '../../../core/tenant/tenant.service';
import { CurrencyService } from '../../../core/currency/currency.service';

@Component({
    selector: 'fee-invoice-list',
    templateUrl: './fee-invoice-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatPaginatorModule, MatSelectModule, MatTableModule, MatTooltipModule,
    ],
})
export class FeeInvoiceListComponent implements OnInit, OnDestroy {
    invoices: FeeInvoiceDto[] = [];
    isLoading = false;
    totalCount = 0;
    currentPage = 0;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];
    searchControl = new FormControl('');
    selectedClassId = '';
    selectedAcademicYearId = '';
    overdueOnly = false;
    classes: ClassDto[] = [];
    academicYears: AcademicYearDto[] = [];
    displayedColumns: string[] = ['invoiceNumber', 'studentName', 'className', 'totalAmount', 'paidAmount', 'balanceAmount', 'dueDate', 'status', 'paidBy', 'actions'];
    Math = Math;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _service: FeeInvoicesService,
        private _classesService: ClassesService,
        private _academicYearsService: AcademicYearsService,
        private _cdr: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _notificationService: NotificationService,
        private _tenant: TenantService,
        private _currency: CurrencyService,
    ) {}

    ngOnInit(): void {
        this.searchControl.valueChanges
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(300), distinctUntilChanged())
            .subscribe(() => { this.currentPage = 0; this.loadData(); });
        this.loadDropdowns();
        this.loadData();
    }

    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

    loadDropdowns(): void {
        this._classesService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.classes = r.data; this._cdr.markForCheck(); }, error: () => {} });
        this._academicYearsService.search({ pageNumber: 1, pageSize: 200, isActive: true })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.academicYears = r.data; this._cdr.markForCheck(); }, error: () => {} });
    }

    loadData(): void {
        this.isLoading = true;
        this._cdr.markForCheck();
        const request: SearchFeeInvoicesRequest = {
            pageNumber: this.currentPage + 1,
            pageSize: this.pageSize,
            keyword: this.searchControl.value || undefined,
            classId: this.selectedClassId || undefined,
            academicYearId: this.selectedAcademicYearId || undefined,
            overdueOnly: this.overdueOnly || undefined
        };
        this._service.search(request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (response: PaginationResponse<FeeInvoiceDto>) => {
                this.invoices = response.data;
                this.totalCount = response.totalCount;
                this.currentPage = response.currentPage - 1;
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: () => { this.isLoading = false; this._cdr.markForCheck(); this._notificationService.error('Error loading fee invoices'); }
        });
    }

    onFilterChange(): void { this.currentPage = 0; this.loadData(); }
    onPageChange(event: PageEvent): void { this.currentPage = event.pageIndex; this.pageSize = event.pageSize; this.loadData(); }
    add(): void { this._router.navigate(['create'], { relativeTo: this._route }); }
    edit(item: FeeInvoiceDto): void { this._router.navigate([item.id, 'edit'], { relativeTo: this._route }); }

    deleteItem(item: FeeInvoiceDto): void {
        const dialogRef = this._fuseConfirmationService.open({
            title: 'Delete Invoice',
            message: `Delete invoice "${item.invoiceNumber}" for "${item.studentName}"?`,
            icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
            actions: { confirm: { show: true, label: 'Delete', color: 'warn' }, cancel: { show: true, label: 'Cancel' } },
            dismissible: false
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._service.delete(item.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                    next: () => { this._notificationService.success('Invoice deleted'); this.loadData(); },
                    error: () => this._notificationService.error('Error deleting invoice')
                });
            }
        });
    }

    /** Phase v1-I2 — mint a share-token then open wa.me with a prefilled
     * parent-friendly message containing the public viewer link. The cashier
     * picks the contact in WhatsApp after the message text is pre-staged. */
    shareViaWhatsApp(item: FeeInvoiceDto): void {
        const tenantId = this._tenant.resolve();
        if (!tenantId) {
            this._notificationService.error('Tenant ID not available — log in again.');
            return;
        }
        this._service.createShareToken(item.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (res) => {
                const url = `${window.location.origin}/public/invoice/${encodeURIComponent(res.token)}?tenant=${encodeURIComponent(tenantId)}`;
                const money = this._currency.format(item.balanceAmount ?? 0);
                const due = item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '';
                const lines = [
                    `Dear Parent,`,
                    `Fee invoice ${item.invoiceNumber} for ${item.studentName ?? 'your child'} — balance ${money}${due ? `, due ${due}` : ''}.`,
                    `View / pay: ${url}`,
                ];
                const text = encodeURIComponent(lines.join('\n'));
                window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
            },
            error: () => this._notificationService.error('Could not generate share link.'),
        });
    }

    printReceipt(item: FeeInvoiceDto): void {
        const html = this.buildReceiptHtml(item);
        const w = window.open('', '_blank', 'width=800,height=900');
        if (!w) {
            this._notificationService.error('Pop-up blocked. Allow pop-ups to print the receipt.');
            return;
        }
        w.document.open();
        w.document.write(html);
        w.document.close();
    }

    private buildReceiptHtml(inv: FeeInvoiceDto): string {
        const money = (n: number | undefined) => (n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const date = (d?: string) => d ? new Date(d).toLocaleDateString() : '—';
        const status = this.getStatusName(inv.status);

        return `<!doctype html>
<html><head>
<meta charset="utf-8">
<title>Invoice ${this.escape(inv.invoiceNumber)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111; margin: 0; padding: 32px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { margin: 0; font-size: 28px; letter-spacing: 1px; }
  .muted { color: #666; font-size: 13px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
  .block h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px; }
  .block p { margin: 2px 0; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0 24px; }
  th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 14px; }
  th { background: #f6f6f6; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #444; }
  .text-right { text-align: right; }
  .totals { margin-left: auto; width: 280px; font-size: 14px; }
  .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
  .totals .grand { border-top: 2px solid #111; margin-top: 8px; padding-top: 10px; font-size: 16px; font-weight: 700; }
  .status { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; }
  .status-paid { background: #d1fae5; color: #065f46; }
  .status-partial { background: #dbeafe; color: #1e40af; }
  .status-pending { background: #fef3c7; color: #92400e; }
  .status-overdue { background: #fee2e2; color: #991b1b; }
  .status-other { background: #e5e7eb; color: #374151; }
  .footer { border-top: 1px solid #eee; padding-top: 16px; margin-top: 32px; font-size: 12px; color: #666; text-align: center; }
  @media print { body { padding: 16px; } .no-print { display: none; } }
</style>
</head><body>
<div class="header">
  <div>
    <h1>INVOICE</h1>
    <div class="muted">${this.escape(inv.invoiceNumber)}</div>
  </div>
  <div style="text-align:right;">
    <span class="status ${this.statusPrintClass(status)}">${this.escape(status)}</span>
    <div class="muted" style="margin-top:8px;">Issued ${date(inv.invoiceDate)}</div>
    <div class="muted">Due ${date(inv.dueDate)}</div>
  </div>
</div>

<div class="grid">
  <div class="block">
    <h3>Billed To</h3>
    <p><strong>${this.escape(inv.studentName || '—')}</strong></p>
    <p class="muted">Class: ${this.escape(inv.className || '—')}</p>
    <p class="muted">Academic Year: ${this.escape(inv.academicYearName || '—')}</p>
  </div>
  <div class="block">
    <h3>Payment</h3>
    <p>Method: ${this.escape(inv.paymentMethod || '—')}</p>
    <p>Paid on: ${date(inv.paidDate)}</p>
    <p>Receipt #: ${this.escape(inv.receiptNumber || '—')}</p>
    <p>Txn ID: ${this.escape(inv.transactionId || '—')}</p>
  </div>
</div>

<table>
  <thead><tr><th>Description</th><th class="text-right">Amount</th></tr></thead>
  <tbody>
    <tr><td>Tuition / Fees</td><td class="text-right">${money(inv.totalAmount)}</td></tr>
    ${inv.discountAmount ? `<tr><td>Discount</td><td class="text-right">-${money(inv.discountAmount)}</td></tr>` : ''}
    ${inv.taxAmount ? `<tr><td>Tax</td><td class="text-right">${money(inv.taxAmount)}</td></tr>` : ''}
    ${inv.lateFeeAmount ? `<tr><td>Late Fee</td><td class="text-right">${money(inv.lateFeeAmount)}</td></tr>` : ''}
  </tbody>
</table>

<div class="totals">
  <div><span>Subtotal</span><span>${money(inv.totalAmount)}</span></div>
  <div><span>Paid</span><span>${money(inv.paidAmount)}</span></div>
  <div class="grand"><span>Balance Due</span><span>${money(inv.balanceAmount)}</span></div>
</div>

${inv.remarks ? `<div class="block"><h3>Remarks</h3><p>${this.escape(inv.remarks)}</p></div>` : ''}

<div class="footer">
  Thank you for your payment. This is a system-generated receipt.
</div>

<script>
  window.addEventListener('load', function() { setTimeout(function(){ window.print(); }, 100); });
</script>
</body></html>`;
    }

    private escape(s: string | undefined | null): string {
        if (s === null || s === undefined) return '';
        return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
    }

    private statusPrintClass(status: string): string {
        switch (status) {
            case 'Paid': return 'status-paid';
            case 'Partial': return 'status-partial';
            case 'Pending': return 'status-pending';
            case 'Overdue': return 'status-overdue';
            default: return 'status-other';
        }
    }

    getStatusName(status: InvoiceStatus): string {
        const map: Record<number, string> = {
            1: 'Pending', 2: 'Partial', 3: 'Paid', 4: 'Overdue',
            5: 'Cancelled', 6: 'Refunded', 7: 'Disputed', 8: 'On Hold'
        };
        return map[status] || '-';
    }

    isOverdue(item: FeeInvoiceDto): boolean {
        if (!item.dueDate || item.balanceAmount <= 0) return false;
        const due = new Date(item.dueDate);
        due.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return due < today;
    }

    daysOverdue(item: FeeInvoiceDto): number {
        if (!this.isOverdue(item)) return 0;
        const due = new Date(item.dueDate);
        const today = new Date();
        return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    }

    toggleOverdueFilter(): void {
        this.overdueOnly = !this.overdueOnly;
        this.currentPage = 0;
        this.loadData();
    }

    getStatusClass(status: InvoiceStatus): string {
        switch (status) {
            case InvoiceStatus.Paid: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case InvoiceStatus.Pending: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case InvoiceStatus.Partial: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case InvoiceStatus.Overdue: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case InvoiceStatus.Cancelled: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
            case InvoiceStatus.Refunded: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    }
}
