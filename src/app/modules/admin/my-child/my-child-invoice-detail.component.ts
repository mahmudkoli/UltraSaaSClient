import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StudentsService } from '../../../core/students/students.service';
import { StudentInvoiceRow } from '../../../core/students/my-child.types';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { invoiceStatusClass, invoiceStatusLabel, money } from './my-child.display';

@Component({
    selector: 'my-child-invoice-detail',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatIconModule, MatProgressBarModule, RouterLink, ListPageComponent],
    template: `
<app-list-page title="Invoice" subtitle="Your fee invoice details."
    icon="receipt" iconGradient="from-amber-500 to-orange-600"
    pageGradient="from-gray-50 via-amber-50/30 to-orange-50/30">
    <ng-container pageActions>
        <a routerLink="/my-profile/invoices" class="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary no-print">
            <mat-icon class="icon-size-5 mr-1">arrow_back</mat-icon> Back to invoices
        </a>
    </ng-container>

    <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>
    <div *ngIf="error && !loading" class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-10 text-center text-gray-400">
        Invoice not found.
    </div>

    <div *ngIf="inv && !loading" class="max-w-3xl mx-auto rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 invoice-sheet">
        <div class="flex items-start justify-between">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Fee Invoice</h2>
                <p class="text-sm text-gray-500 mt-1">#{{ inv.invoiceNumber }}</p>
            </div>
            <span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold" [ngClass]="statusClass(inv.status)">{{ statusLabel(inv.status) }}</span>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div>
                <div class="text-gray-500">Billed to</div>
                <div class="font-medium text-gray-900 dark:text-white">{{ inv.studentName || '—' }}</div>
                <div class="text-gray-500">{{ inv.className }}<span *ngIf="inv.academicYearName"> · {{ inv.academicYearName }}</span></div>
            </div>
            <div class="text-right">
                <div><span class="text-gray-500">Issued: </span>{{ inv.invoiceDate | date:'dd MMM yyyy' }}</div>
                <div><span class="text-gray-500">Due: </span>{{ inv.dueDate | date:'dd MMM yyyy' }}</div>
                <div *ngIf="inv.paidDate"><span class="text-gray-500">Paid: </span>{{ inv.paidDate | date:'dd MMM yyyy' }}</div>
            </div>
        </div>

        <table class="w-full text-sm mt-6 border-t border-gray-200 dark:border-gray-700">
            <tbody>
                <tr class="border-b border-gray-100 dark:border-gray-700/60">
                    <td class="py-2.5 text-gray-600 dark:text-gray-300">Total amount</td>
                    <td class="py-2.5 text-right font-medium">{{ money(inv.totalAmount) }}</td>
                </tr>
                <tr *ngIf="inv.discountAmount" class="border-b border-gray-100 dark:border-gray-700/60">
                    <td class="py-2.5 text-gray-600 dark:text-gray-300">Discount</td>
                    <td class="py-2.5 text-right text-emerald-700">- {{ money(inv.discountAmount) }}</td>
                </tr>
                <tr *ngIf="inv.taxAmount" class="border-b border-gray-100 dark:border-gray-700/60">
                    <td class="py-2.5 text-gray-600 dark:text-gray-300">Tax</td>
                    <td class="py-2.5 text-right">{{ money(inv.taxAmount) }}</td>
                </tr>
                <tr *ngIf="inv.lateFeeAmount" class="border-b border-gray-100 dark:border-gray-700/60">
                    <td class="py-2.5 text-gray-600 dark:text-gray-300">Late fee</td>
                    <td class="py-2.5 text-right text-red-700">{{ money(inv.lateFeeAmount) }}</td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-700/60">
                    <td class="py-2.5 text-gray-600 dark:text-gray-300">Paid</td>
                    <td class="py-2.5 text-right">{{ money(inv.paidAmount) }}</td>
                </tr>
                <tr>
                    <td class="py-3 font-semibold text-gray-900 dark:text-white">Balance due</td>
                    <td class="py-3 text-right text-lg font-bold" [ngClass]="inv.balanceAmount > 0 ? 'text-red-700' : 'text-emerald-700'">{{ money(inv.balanceAmount) }}</td>
                </tr>
            </tbody>
        </table>

        <div *ngIf="inv.receiptNumber || inv.paymentMethod || inv.remarks" class="mt-4 text-xs text-gray-500 space-y-0.5">
            <div *ngIf="inv.paymentMethod">Payment method: {{ inv.paymentMethod }}</div>
            <div *ngIf="inv.receiptNumber">Receipt #: {{ inv.receiptNumber }}</div>
            <div *ngIf="inv.remarks">Note: {{ inv.remarks }}</div>
        </div>

        <div class="mt-8 flex justify-end no-print">
            <button (click)="print()" class="inline-flex items-center rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90">
                <mat-icon class="icon-size-5 mr-1">print</mat-icon> Print / Save as PDF
            </button>
        </div>
    </div>
</app-list-page>
    `,
    styles: [`
        @media print {
            .no-print { display: none !important; }
            .invoice-sheet { box-shadow: none !important; border: none !important; }
        }
    `],
})
export class MyChildInvoiceDetailComponent implements OnInit {
    inv?: StudentInvoiceRow;
    loading = true;
    error = false;

    money = money;
    statusLabel = invoiceStatusLabel;
    statusClass = invoiceStatusClass;

    constructor(private _svc: StudentsService, private _route: ActivatedRoute, private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        const id = this._route.snapshot.paramMap.get('id');
        if (!id) { this.loading = false; this.error = true; return; }
        this._svc.getMyInvoice(id).subscribe({
            next: (inv) => { this.inv = inv; this.loading = false; this._cdr.markForCheck(); },
            error: () => { this.error = true; this.loading = false; this._cdr.markForCheck(); },
        });
    }

    print(): void { window.print(); }
}
