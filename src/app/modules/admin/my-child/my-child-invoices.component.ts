import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { StudentsService } from '../../../core/students/students.service';
import { StudentInvoiceRow } from '../../../core/students/my-child.types';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { invoiceStatusClass, invoiceStatusLabel, money } from './my-child.display';

@Component({
    selector: 'my-child-invoices',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatIconModule, MatProgressBarModule, RouterLink, ListPageComponent],
    template: `
<app-list-page title="My Fee Invoices" subtitle="Your invoices and payment status."
    icon="receipt_long" iconGradient="from-amber-500 to-orange-600"
    pageGradient="from-gray-50 via-amber-50/30 to-orange-50/30">
    <ng-container pageActions>
        <a routerLink="/my-profile" class="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary">
            <mat-icon class="icon-size-5 mr-1">arrow_back</mat-icon> Back to dashboard
        </a>
    </ng-container>

    <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

    <div *ngIf="!loading" class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-900/40 text-gray-500 uppercase text-xs">
                <tr>
                    <th class="text-left font-medium px-4 py-3">Invoice #</th>
                    <th class="text-left font-medium px-4 py-3">Issued</th>
                    <th class="text-left font-medium px-4 py-3">Due</th>
                    <th class="text-right font-medium px-4 py-3">Total</th>
                    <th class="text-right font-medium px-4 py-3">Paid</th>
                    <th class="text-right font-medium px-4 py-3">Balance</th>
                    <th class="text-left font-medium px-4 py-3">Status</th>
                    <th class="px-4 py-3"></th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let i of rows" class="border-t border-gray-100 dark:border-gray-700/60">
                    <td class="px-4 py-3 font-medium">{{ i.invoiceNumber }}</td>
                    <td class="px-4 py-3 whitespace-nowrap">{{ i.invoiceDate | date:'dd MMM yyyy' }}</td>
                    <td class="px-4 py-3 whitespace-nowrap">{{ i.dueDate | date:'dd MMM yyyy' }}</td>
                    <td class="px-4 py-3 text-right">{{ money(i.totalAmount) }}</td>
                    <td class="px-4 py-3 text-right">{{ money(i.paidAmount) }}</td>
                    <td class="px-4 py-3 text-right font-medium" [ngClass]="i.balanceAmount > 0 ? 'text-red-700' : 'text-emerald-700'">{{ money(i.balanceAmount) }}</td>
                    <td class="px-4 py-3"><span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" [ngClass]="statusClass(i.status)">{{ statusLabel(i.status) }}</span></td>
                    <td class="px-4 py-3 text-right">
                        <a [routerLink]="['/my-profile/invoices', i.id]" class="inline-flex items-center text-primary hover:underline text-sm">
                            View <mat-icon class="icon-size-4 ml-0.5">chevron_right</mat-icon>
                        </a>
                    </td>
                </tr>
                <tr *ngIf="!rows.length"><td colspan="8" class="px-4 py-10 text-center text-gray-400">You have no invoices.</td></tr>
            </tbody>
        </table>
    </div>
</app-list-page>
    `,
})
export class MyChildInvoicesComponent implements OnInit {
    rows: StudentInvoiceRow[] = [];
    loading = true;

    money = money;
    statusLabel = invoiceStatusLabel;
    statusClass = invoiceStatusClass;

    constructor(private _svc: StudentsService, private _cdr: ChangeDetectorRef, private _notify: NotificationService) {}

    ngOnInit(): void {
        this._svc.getMyInvoices().subscribe({
            next: (rows) => { this.rows = rows ?? []; this.loading = false; this._cdr.markForCheck(); },
            error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load invoices.'); },
        });
    }
}
